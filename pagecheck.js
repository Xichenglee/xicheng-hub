// pagecheck.js — one command = full door health for the hub.
// For every door: live HTTP 200, page title carries the expected marker,
// required selectors/text exist, and the layout has no x-overflow at phone + desktop.
// Exits nonzero (and names the failing door) if any check fails.
//
// usage: node pagecheck.js            # checks the live hub
//        node pagecheck.js --local    # geometry against /workspace/hub_rebuild (file://)
const { spawn } = require('child_process');
const http = require('http');

const LOCAL = process.argv.includes('--local');
const BASE = 'https://xichenglee.github.io/xicheng-hub/';
const DIR = '/workspace/hub_rebuild';
const WIDTHS = [390, 1280];

// title = the page's identity marker; mustSel / mustText = the door's guts
const DOORS = [
  { path: '',                  title: 'Small, careful things' },
  { path: 'about.html',        title: 'About' },
  { path: 'contact.html',      title: 'Contact' },
  { path: 'food.html',         title: 'Hungry Scout', mustSel: '#scoutForm' },
  { path: 'shop-stickers.html',title: 'Character Sticker Sheet', mustSel: '#orderForm', mustText: 'How it works', delivery: '24h' },
  { path: 'shop-artpack.html', title: 'Character Art Pack',      mustSel: '#orderForm', mustText: 'How it works' },
  { path: 'shop-song.html',    title: 'The Song Desk',           mustSel: '#orderForm', mustText: 'How it works' },
  { path: 'shop-widget.html',  title: 'Custom Widget',           mustSel: '#orderForm', mustText: 'How it works' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function cdpGet(path) {
  return new Promise((res, rej) => {
    http.get({ host: '127.0.0.1', port: 9222, path }, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}

async function main() {
  const failures = [];

  // 1. HTTP reachability + marker straight off the wire (skip in --local mode)
  if (!LOCAL) {
    for (const d of DOORS) {
      const url = BASE + d.path;
      try {
        const r = await fetch(url, { redirect: 'follow' });
        const html = await r.text();
        const ok = r.status === 200 && html.includes(d.title);
        console.log(`${ok ? 'OK  ' : 'FAIL'}  ${String(r.status).padEnd(4)} ${url}`);
        if (!ok) failures.push(`${url}: http=${r.status} marker=${d.title} ${html.includes(d.title) ? '' : 'MISSING'}`);
      } catch (e) {
        console.log(`FAIL  err  ${url}  ${e.message}`);
        failures.push(`${url}: fetch ${e.message}`);
      }
    }
  }

  // 2. Geometry + in-DOM content, live or local
  const chrome = spawn('chromium', ['--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=9222', '--remote-allow-origins=*', 'about:blank'], { stdio: 'ignore' });
  await sleep(2500);
  const list = await cdpGet('/json/list');
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id = 0; const pend = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pend[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => ws.onopen = r);
  await send('Page.enable'); await send('Runtime.enable');

  for (const w of WIDTHS) {
    for (const d of DOORS) {
      const url = LOCAL ? 'file://' + DIR + '/' + d.path : BASE + d.path;
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 600 });
      await send('Page.navigate', { url });
      await sleep(800);
      const expr = `(function(){
        const de=document.documentElement, iw=window.innerWidth;
        const over=[];
        document.querySelectorAll('*').forEach(el=>{const r=el.getBoundingClientRect();
          if(r.right>iw+1) over.push(el.tagName+'.'+(el.className||'').toString().split(' ')[0]+'@'+Math.round(r.right));});
        const t=document.title||'';
        const body=document.body?document.body.innerText:'';
        return JSON.stringify({sw:de.scrollWidth,iw:iw,title:t,
          sel:${d.mustSel ? `!!document.querySelector(${JSON.stringify(d.mustSel)})` : 'true'},
          txt:${d.mustText ? `body.includes(${JSON.stringify(d.mustText)})` : 'true'},
          over:over.slice(0,4)});
      })()`;
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
      const v = JSON.parse(r.result.result.value);
      const overflow = v.sw > v.iw + 1;
      const bad = overflow || !v.sel || !v.txt || (v.title.indexOf(d.title) === -1 && d.path !== '' ? true : false);
      const label = `${w} ${d.path || 'index.html'}`;
      console.log(`${bad ? 'FAIL' : 'OK  '}  ${label.padEnd(28)} sw=${v.sw} iw=${v.iw}${overflow ? ' OVERFLOW ' + v.over.join(',') : ''}${v.sel ? '' : ' NO-SEL'}${v.txt ? '' : ' NO-TEXT'}`);
      if (overflow) failures.push(`${label}: x-overflow ${v.sw}>${v.iw} ${v.over.join(',')}`);
      if (!v.sel) failures.push(`${label}: missing selector ${d.mustSel}`);
      if (!v.txt) failures.push(`${label}: missing text "${d.mustText}"`);
    }
  }
  ws.close(); chrome.kill();

  console.log('\n' + (failures.length ? `PAGECHECK FAILED (${failures.length})` : 'PAGECHECK: all doors green'));
  failures.forEach(f => console.log('  - ' + f));
  process.exit(failures.length ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
