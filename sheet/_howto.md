# Song Desk lyric sheet — locked process (Xino, Nov 2 2026)

Delivery for every Song Desk order. Do not paste lyrics into chat bubbles.

1. Write the lyrics into the template in this folder (`_template.html`).
2. Section block shape:
   `<section><h2>Verse 1</h2><p>line one<br>line two</p></section>`
3. Filename: `sheet/<10 hex chars>.html`, random, never reused.
4. `meta robots` stays `noindex, nofollow`. The slug is the only way in; link is shared in exactly one DM bubble.
5. Push to `main`. Verify: `curl -s -o /dev/null -w "%{http_code}"` = 200 and title reads "`<song>` · lyrics".
6. DM the customer one bubble: the link + one line ("read it over, tell me any line to change").
7. The page is also the revision record: a changed line means a new section body, same URL, so the customer's link never breaks.

Caveat kept honest: repo is public, so the slug is unlisted, not secret. Only ship lyrics the customer already owns.
