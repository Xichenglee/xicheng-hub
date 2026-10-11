import re, os
ROOT="/workspace/hub_rebuild"

# 1) index hero: strengthen value indicators
p=os.path.join(ROOT,"index.html"); s=open(p,encoding="utf-8").read()
old='<p class="lede">Stickers, character art, custom songs, little web toys, and a food report where every spot is checked by hand before it reaches you. Look at the samples first. Nothing here needs an app to see.</p>'
new=('<p class="lede">Stickers, character art, custom songs, little web toys, and a food report where every spot is checked by hand before it reaches you. Everything below is made for one person at a time, and there is a real sample behind each shop you can open without downloading a thing.</p>\n'
     '      <div class="value"><span>Character art</span><span>Tailored songs</span><span>Hand-tested food guides</span><span>Bespoke web toys</span><span>Delivered to you</span></div>')
assert old in s, "lede not found"
s=s.replace(old,new,1)
open(p,"w",encoding="utf-8").write(s)
print("index hero updated")

# 2) fix duplicate Shops nav in about.html
p=os.path.join(ROOT,"about.html"); s=open(p,encoding="utf-8").read()
s=s.replace('        <a href="index.html#shops">Shops</a>\n        <a href="index.html#shops">Shops</a>\n','        <a href="index.html#shops">Shops</a>\n',1)
open(p,"w",encoding="utf-8").write(s)
print("about nav dedup")

# 3) token->USD tooltips
tips={
 "≈ US$1":' data-tip="Roughly US$1 at the platform rate (~610 tokens = US$1)" tabindex="0"',
 "≈ US$3":' data-tip="Roughly US$3 at the platform rate (~610 tokens = US$1)" tabindex="0"',
 "≈ US$2.50":' data-tip="Roughly US$2.50 at the platform rate (~610 tokens = US$1)" tabindex="0"',
 "≈ US$2":' data-tip="Roughly US$2 at the platform rate (~610 tokens = US$1)" tabindex="0"',
}
for name in os.listdir(ROOT):
    if not name.endswith(".html"): continue
    p=os.path.join(ROOT,name); s=open(p,encoding="utf-8").read(); o=s
    for k,v in tips.items():
        s=s.replace('<span class="usd">'+k+'</span>','<span class="usd"'+v+'>'+k+'</span>')
    if s!=o:
        open(p,"w",encoding="utf-8").write(s); print("tooltip",name)
