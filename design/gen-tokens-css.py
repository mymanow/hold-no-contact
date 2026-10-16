import json,sys
t=json.load(open(sys.argv[1])); L=t["layout"]
o=["/* Généré depuis design/tokens.json — ne pas éditer à la main. */",
   "/* Tailwind v4 : importé par src/app/globals.css */","",
   "@theme {","  --color-*: initial;"]
o+=[f"  --color-{k}: {v};" for k,v in t["color"].items()]
o+=["",f"  --font-sans: {t['font']['sans']};",f"  --font-display: {t['font']['display']};",f"  --font-mono: {t['font']['mono']};",""]
for k,v in t["type"].items():
    if k=="counter": continue
    o+=[f"  --text-{k}: {v['size']/16:g}rem;",f"  --text-{k}--line-height: {v['line']/16:g}rem;",f"  --text-{k}--font-weight: {v['weight']};"]
o+=["","  --spacing: 4px;"]
o+=[f"  --radius-{k}: {v}px;" for k,v in t["radius"].items()]
o+=[f"  --shadow-{k}: {v};" for k,v in t["shadow"].items() if not k.startswith('_')]
o+=[f"  --ease-out: {t['motion']['ease']};",f"  --ease-calm: {t['motion']['ease-calm']};"]
o+=[f"  --breakpoint-md: {L['breakpoint-md']/16:g}rem;",f"  --breakpoint-lg: {L['breakpoint-lg']/16:g}rem;",f"  --breakpoint-xl: {L['breakpoint-xl']/16:g}rem;","}",""]
c=t["type"]["counter"]
o+=[":root {","  color-scheme: dark;"]
for k in ["content-max","content-wide-max","gutter-mobile","gutter-desktop","header-height","tabbar-height","sidebar-width","sidebar-collapsed","touch-min","panic-fab-size","panic-hero-size"]:
    o.append(f"  --{k}: {L[k]}px;")
o+=[f"  --safe-bottom: {L['safe-area-bottom']};",f"  --counter-size: {c['size']};"]
o+=[f"  --duration-{k}: {t['motion'][k]};" for k in ["fast","base","slow","breath-in","breath-hold","breath-out"]]
o+=[f"  --z-{k}: {v};" for k,v in t["z"].items()]
o+=["}","",
"html { background: var(--color-bg); color: var(--color-text); font-family: var(--font-sans); font-size: 100%; -webkit-text-size-adjust: 100%; }",
"body { font-size: var(--text-base); line-height: var(--text-base--line-height); min-height: 100dvh; }",
":focus-visible { outline: 2px solid var(--color-focus); outline-offset: 3px; border-radius: 4px; }",
".tabular { font-variant-numeric: tabular-nums lining-nums; }",
"@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }",
"@media (prefers-contrast: more) { :root { --color-text-muted: var(--color-text); --color-text-subtle: var(--color-text-muted); --color-border: var(--color-border-input); } }",""]
open(sys.argv[2],"w").write("\n".join(o))
