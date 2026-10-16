-- No Contact clone : schéma initial (Supabase / PostgreSQL)
-- Première migration : supabase/migrations/0001_init.sql
-- Conventions : uuid, timestamptz en UTC, owner = user_id -> auth.users, RLS partout.
-- Champs sensibles : stockés CHIFFRÉS par le serveur (AES-256-GCM) dans des colonnes *_enc (bytea),
-- avec key_version pour la rotation des clés. La base ne voit jamais le texte clair.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  locale            text not null default 'fr' check (locale in ('fr','en')),
  timezone          text not null default 'Europe/Paris',          -- IANA, sert au calcul des jours
  relationship_type text check (relationship_type in ('ex','situationship')),
  ex_label          text,                                           -- surnom, jamais le vrai nom requis
  coach_mode        text not null default 'gentle' check (coach_mode in ('gentle','no_bs')),
  onboarded_at      timestamptz,
  -- droits d'accès (dénormalisés depuis subscriptions par le webhook Stripe)
  plan              text not null default 'free' check (plan in ('free','monthly','lifetime')),
  plan_active       boolean not null default false,
  stripe_customer_id text unique,
  -- notifications
  reminder_hour     smallint not null default 20 check (reminder_hour between 0 and 23),
  notify_push       boolean not null default true,
  notify_email      boolean not null default true,
  -- confidentialité
  lock_pin_hash     text,                                           -- verrou par code (argon2/bcrypt côté serveur)
  deleted_at        timestamptz,                                    -- suppression demandée -> purge par job
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- création auto du profil à l'inscription
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- streaks
-- Une "période" de no contact = un streak. Un reset clôt la période et en ouvre une nouvelle.
create table public.nc_periods (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  started_at    timestamptz not null,                 -- peut être dans le passé (rupture déjà ancienne)
  ended_at      timestamptz,
  end_reason    text check (end_reason in ('relapse','goal_reached','manual')),
  target_days   integer check (target_days > 0),      -- objectif : 30, 60, 90...
  rules         jsonb not null default '[]',          -- règles perso : ["pas de stories", "pas de like"...]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint ended_after_start check (ended_at is null or ended_at >= started_at),
  constraint reason_iff_ended  check ((ended_at is null) = (end_reason is null))
);
-- une seule période active par utilisateur : la règle est dans la base, pas dans l'UI
create unique index nc_periods_one_active on public.nc_periods (user_id) where ended_at is null;
create index nc_periods_user_started on public.nc_periods (user_id, started_at desc);
create trigger nc_periods_updated before update on public.nc_periods
  for each row execute function public.set_updated_at();

-- Reset & Reflect : la réflexion liée à la fin d'une période
create table public.relapse_reflections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  period_id       uuid not null unique references public.nc_periods(id) on delete cascade,
  contact_kind    text check (contact_kind in ('texted','called','replied','met','social_media','other')),
  trigger_tag     text,                                -- "solitude", "alcool", "anniversaire"... (non sensible, filtrable)
  reflection_enc  bytea,                               -- texte libre chiffré
  key_version     smallint not null default 1,
  created_at      timestamptz not null default now()
);
create index relapse_reflections_user on public.relapse_reflections (user_id, created_at desc);

-- Check-ins quotidiens (un par jour local)
create table public.check_ins (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  local_date    date not null,                         -- date dans le fuseau de l'utilisateur au moment du check-in
  mood          smallint not null check (mood between 1 and 5),
  urge_level    smallint not null check (urge_level between 0 and 10),
  triggers      text[] not null default '{}',
  note_enc      bytea,
  key_version   smallint not null default 1,
  created_at    timestamptz not null default now(),
  unique (user_id, local_date)
);

-- Utilisations de la Panic Room (mesure des envies et de l'efficacité des outils)
create table public.urge_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  intensity   smallint check (intensity between 0 and 10),
  tool_used   text check (tool_used in ('breathing','icks','unsent','coach','affirmations','distraction')),
  outcome     text not null default 'unknown' check (outcome in ('resisted','relapsed','unknown')),
  created_at  timestamptz not null default now()
);
create index urge_events_user on public.urge_events (user_id, created_at desc);

-- ---------------------------------------------------------------- Ick List (red flags)
create table public.red_flags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    text not null default 'ick' check (category in ('red_flag','dealbreaker','ick','reason')),
  body_enc    bytea not null,
  key_version smallint not null default 1,
  pinned      boolean not null default false,          -- affichés en premier dans la Panic Room
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index red_flags_user on public.red_flags (user_id, pinned desc, position);
create trigger red_flags_updated before update on public.red_flags
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- Text Your Ex (But Don't)
create table public.unsent_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  body_enc    bytea not null,
  key_version smallint not null default 1,
  urge_event_id uuid references public.urge_events(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index unsent_messages_user on public.unsent_messages (user_id, created_at desc);

-- ---------------------------------------------------------------- Coach Sam
create table public.chat_threads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index chat_threads_user on public.chat_threads (user_id, updated_at desc);

create table public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references public.chat_threads(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,  -- dénormalisé pour la RLS
  role          text not null check (role in ('user','assistant')),
  mode          text not null check (mode in ('gentle','no_bs')),           -- mode actif à ce message
  content_enc   bytea not null,
  key_version   smallint not null default 1,
  flagged       text check (flagged in ('crisis','self_harm','violence')),  -- résultat de la modération
  model         text,                                                         -- ex. gpt-4o-mini, pour tracer
  tokens_in     integer,
  tokens_out    integer,
  created_at    timestamptz not null default now()
);
create index chat_messages_thread on public.chat_messages (thread_id, created_at);
create index chat_messages_user on public.chat_messages (user_id, created_at desc);

-- Mémoire long terme du coach : un résumé par utilisateur, régénéré par un job
create table public.coach_memory (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  summary_enc  bytea not null,
  key_version  smallint not null default 1,
  updated_at   timestamptz not null default now()
);

-- Quota IA (indispensable avec un accès à vie)
create table public.ai_usage (
  user_id     uuid not null references auth.users(id) on delete cascade,
  month       date not null,                           -- premier jour du mois
  messages    integer not null default 0,
  tokens      integer not null default 0,
  primary key (user_id, month)
);

-- ---------------------------------------------------------------- paiements
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  kind                    text not null check (kind in ('monthly','lifetime')),
  stripe_subscription_id  text unique,                 -- null pour lifetime
  stripe_payment_intent_id text unique,                -- null pour monthly
  status                  text not null check (status in ('trialing','active','past_due','canceled','unpaid','paid','refunded')),
  amount_cents            integer not null check (amount_cents >= 0),
  currency                text not null default 'eur',
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index subscriptions_user on public.subscriptions (user_id);
create trigger subscriptions_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Idempotence des webhooks Stripe (ils arrivent parfois deux fois)
create table public.stripe_events (
  id           text primary key,                       -- evt_...
  type         text not null,
  processed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- notifications
create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now(),
  last_ok_at  timestamptz
);
create index push_subscriptions_user on public.push_subscriptions (user_id);

create table public.notification_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('checkin_reminder','milestone','reengage')),
  channel     text not null check (channel in ('push','email','sms')),
  dedupe_key  text not null,                           -- ex. checkin:2026-10-16
  sent_at     timestamptz not null default now(),
  unique (user_id, kind, dedupe_key)                   -- jamais deux fois le même rappel
);

-- ---------------------------------------------------------------- reset atomique
-- Clôt la période active, enregistre la réflexion, ouvre une nouvelle période. Tout ou rien.
create or replace function public.reset_streak(
  p_contact_kind text, p_trigger_tag text, p_reflection_enc bytea, p_key_version smallint
) returns uuid
language plpgsql security invoker set search_path = public as $$
declare v_old uuid; v_new uuid; v_target integer; v_rules jsonb;
begin
  select id, target_days, rules into v_old, v_target, v_rules
    from nc_periods where user_id = auth.uid() and ended_at is null for update;
  if v_old is null then raise exception 'no active period'; end if;
  update nc_periods set ended_at = now(), end_reason = 'relapse' where id = v_old;
  insert into relapse_reflections (user_id, period_id, contact_kind, trigger_tag, reflection_enc, key_version)
    values (auth.uid(), v_old, p_contact_kind, p_trigger_tag, p_reflection_enc, p_key_version);
  insert into nc_periods (user_id, started_at, target_days, rules)
    values (auth.uid(), now(), v_target, v_rules) returning id into v_new;
  return v_new;
end $$;

-- ---------------------------------------------------------------- RLS
alter table public.profiles            enable row level security;
alter table public.nc_periods          enable row level security;
alter table public.relapse_reflections enable row level security;
alter table public.check_ins           enable row level security;
alter table public.urge_events         enable row level security;
alter table public.red_flags           enable row level security;
alter table public.unsent_messages     enable row level security;
alter table public.chat_threads        enable row level security;
alter table public.chat_messages       enable row level security;
alter table public.coach_memory        enable row level security;
alter table public.ai_usage            enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.stripe_events       enable row level security;   -- aucune policy : service role seulement
alter table public.push_subscriptions  enable row level security;
alter table public.notification_log    enable row level security;   -- aucune policy : service role seulement

-- profil : lecture et édition de son propre profil ; les colonnes de plan sont protégées ci-dessous
create policy "own profile read"   on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- Supabase accorde UPDATE sur toute la table à "authenticated" : révoquer une colonne ne suffit pas.
-- On retire l'UPDATE global puis on ne rend que les colonnes éditables par l'utilisateur.
revoke update on public.profiles from authenticated, anon;
grant update (display_name, locale, timezone, relationship_type, ex_label, coach_mode, onboarded_at,
              reminder_hour, notify_push, notify_email, updated_at)
  on public.profiles to authenticated;
-- lock_pin_hash et deleted_at : écrits par le serveur uniquement (hash calculé côté serveur)

-- tables possédées : CRUD sur ses propres lignes
do $$ declare t text; begin
  foreach t in array array['nc_periods','relapse_reflections','check_ins','urge_events','red_flags',
                           'unsent_messages','chat_threads','push_subscriptions'] loop
    execute format('create policy "own rows" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- lecture seule côté client ; écritures par le serveur (service role) uniquement
create policy "own read" on public.chat_messages for select using (user_id = auth.uid());
create policy "own read" on public.coach_memory  for select using (user_id = auth.uid());
create policy "own read" on public.ai_usage      for select using (user_id = auth.uid());
create policy "own read" on public.subscriptions for select using (user_id = auth.uid());
