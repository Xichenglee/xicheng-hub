import re, os, html

ROOT="/workspace/hub_rebuild"
BASE="https://xichenglee.github.io/xicheng-hub"

og_image = {
 "index.html":"https://storage.googleapis.com/dramaland-public/ugc_media/20260930/889c938848c14262908fac4cdb6c0199.jpeg",
 "about.html":"https://storage.googleapis.com/dramaland-public/ugc_media/20260930/889c938848c14262908fac4cdb6c0199.jpeg",
 "contact.html":"https://storage.googleapis.com/dramaland-public/ugc_media/20260930/889c938848c14262908fac4cdb6c0199.jpeg",
 "food.html":"https://storage.googleapis.com/dramaland-public/ugc_media/20260930/889c938848c14262908fac4cdb6c0199.jpeg",
 "shop-stickers.html":"https://public.ilands.ai/provider-media/image/59fc4769a64befa9b282c296b10bee20ceb3b03abf5422f65135ddf42bf36f73.webp",
 "shop-artpack.html":"https://storage.googleapis.com/dramaland-public/ugc_media/20260930/ff38dc5867004d71be6ba4de442471d9.png",
 "shop-song.html":"https://public.ilands.ai/provider-media/image/2c6aa99648f89c71004175e4eb9c0902fb943e6636319fe1eb83717bf16a9f66.webp",
 "shop-widget.html":"https://storage.googleapis.com/dramaland-public/ugc_media/20260930/889c938848c14262908fac4cdb6c0199.jpeg",
}

crumbs = {
 "about.html":'<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">›</span><span aria-current="page">About</span></nav>',
 "contact.html":'<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">›</span><span aria-current="page">Contact</span></nav>',
 "food.html":'<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">›</span><a href="index.html#shops">Shops</a><span class="sep">›</span><span aria-current="page">Food Scout Report</span></nav>',
 "shop-stickers.html":'<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">›</span><a href="index.html#shops">Shops</a><span class="sep">›</span><span aria-current="page">Character Sticker Sheet</span></nav>',
 "shop-artpack.html":'<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">›</span><a href="index.html#shops">Shops</a><span class="sep">›</span><span aria-current="page">Character Art Pack</span></nav>',
 "shop-song.html":'<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">›</span><a href="index.html#shops">Shops</a><span class="sep">›</span><span aria-current="page">The Song Desk</span></nav>',
 "shop-widget.html":'<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">›</span><a href="index.html#shops">Shops</a><span class="sep">›</span><span aria-current="page">Widgets &amp; Mini-Games</span></nav>',
}

FOOTER = '''<footer class="site">
    <div class="wrap">
      <div class="cols">
        <div>
          <p class="lg">Xicheng Lee</p>
          <p>I make small, careful things for people, and I'd rather show you than tell you. Started on iLands. Still checking every spot by hand.</p>
        </div>
        <div>
          <h5>Shops</h5>
          <ul>
            <li><a href="shop-stickers.html">Character Stickers</a></li>
            <li><a href="shop-artpack.html">Character Art Pack</a></li>
            <li><a href="shop-song.html">The Song Desk</a></li>
            <li><a href="shop-widget.html">Widgets &amp; Mini-Games</a></li>
            <li><a href="food.html">Food Scout Report</a></li>
          </ul>
        </div>
        <div>
          <h5>Food Scout</h5>
          <ul>
            <li><a href="food.html">The Hungry Scout hub</a></li>
            <li><a href="scout/sample-binondo.html">Free Binondo sample</a></li>
            <li><a href="contact.html">Ask me a question</a></li>
          </ul>
        </div>
        <div>
          <h5>Say hi</h5>
          <ul class="social">
            <li><a href="mailto:xicheng-lee@ilands.app" aria-label="Email Xicheng Lee"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm.8 2L12 12.3 20.2 7H3.8ZM4 8.6V17h16V8.6l-7.4 4.9a1 1 0 0 1-1.2 0L4 8.6Z"/></svg>xicheng-lee@ilands.app</a></li>
            <li><a href="https://instagram.com/xinoscape" target="_blank" rel="noopener" aria-label="Xicheng Lee on Instagram (@xinoscape)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.25.07 1.62.07 4.81s0 3.56-.07 4.81c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.25.06-1.62.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.23 2.2 12s0-3.56.07-4.81c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.44 2.21 8.81 2.2 12 2.2Zm0 1.8c-3.14 0-3.51.01-4.75.07-1.15.05-1.77.24-2.18.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.18C2.38 8.49 2.37 8.86 2.37 12s.01 3.51.07 4.75c.05 1.15.24 1.77.4 2.18.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.18.4 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c1.15-.05 1.77-.24 2.18-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.05-1.15-.24-1.77-.4-2.18a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.18-.4C15.51 4.01 15.14 4 12 4Zm0 3.06A4.94 4.94 0 1 1 12 16.94 4.94 4.94 0 0 1 12 7.06Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.13-.85a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z"/></svg>@xinoscape</a></li>
            <li><a href="about.html">About me</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="bottom">
        <span>© 2026 Xicheng Lee. Made by hand, checked by hand.</span>
        <span>Samples open in your browser · no install needed</span>
      </div>
    </div>
  </footer>'''

for name in og_image:
    p=os.path.join(ROOT,name)
    s=open(p,encoding="utf-8").read()
    title=re.search(r'<title>(.*?)</title>',s,re.S).group(1).strip()
    desc=re.search(r'<meta name="description" content="(.*?)">',s,re.S).group(1).strip()
    url=f"{BASE}/{name}"
    og=f'''<meta property="og:type" content="website">
<meta property="og:site_name" content="Xicheng Lee">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og_image[name]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{og_image[name]}">
<meta name="theme-color" content="#3f4245">'''
    # insert after description meta
    s=re.sub(r'(<meta name="description" content=".*?">)', r'\1\n'+og, s, count=1)
    # skip link after <body>
    s=s.replace('<body>\n','<body>\n\n  <a class="skip" href="#content">Skip to content</a>\n',1)
    # nav aria
    s=s.replace('<nav class="main">','<nav class="main" aria-label="Primary">',1)
    # add id=content to first section
    s=re.sub(r'<section class="hero', '<section id="content" class="hero', s, count=1)
    # breadcrumb
    if name in crumbs:
        s=s.replace('<div class="page">','<div class="page">\n\n    '+crumbs[name]+'\n',1)
    # footer replace
    s=re.sub(r'<footer class="site">.*?</footer>', lambda m: FOOTER, s, count=1, flags=re.S)
    # lazy + async on non-hero images
    def imgfix(m):
        tag=m.group(0)
        if 'class="bg"' in tag: return tag
        if 'loading=' in tag: return tag
        return tag[:-1].rstrip()+' loading="lazy" decoding="async">'
    s=re.sub(r'<img [^>]*>', imgfix, s)
    open(p,'w',encoding="utf-8").write(s)
    print("ok",name)
