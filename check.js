const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const files = ['index.html','about.html','contact.html','food.html','shop-stickers.html','shop-artpack.html','shop-song.html','shop-widget.html'];
const DIR = '/tmp/hubdeploy';

function get(path){return new Promise((res,rej)=>{http.get({host:'127.0.0.1',port:9222,path},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(JSON.parse(d)))}).on('error',rej)})}

async function main(){
  const chrome = spawn('chromium',['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port=9222','--remote-allow-origins=*','about:blank'],{stdio:'ignore'});
  await new Promise(r=>setTimeout(r,2500));
  const list = await get('/json/list');
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id=0; const pend={};
  ws.onmessage = e=>{const m=JSON.parse(e.data); if(m.id&&pend[m.id]){pend[m.id](m);delete pend[m.id]}};
  const send=(method,params={})=>new Promise(res=>{const i=++id;pend[i]=res;ws.send(JSON.stringify({id:i,method,params}))});
  await new Promise(r=>ws.onopen=r);
  await send('Page.enable'); await send('Runtime.enable');
  for(const w of [390,1280]){
    for(const f of files){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:900,deviceScaleFactor:1,mobile:w<600});
      await send('Page.navigate',{url:'file://'+DIR+'/'+f});
      await new Promise(r=>setTimeout(r,900));
      const r = await send('Runtime.evaluate',{expression:`(function(){const d=document.documentElement;let over=[];document.querySelectorAll('*').forEach(el=>{const r=el.getBoundingClientRect();if(r.right>window.innerWidth+1)over.push(el.tagName+'.'+(el.className||'').toString().slice(0,25)+'@'+Math.round(r.right))});return JSON.stringify({sw:d.scrollWidth,iw:window.innerWidth,over:over.slice(0,6)})})()`,returnByValue:true});
      console.log(w, f, r.result.result.value);
    }
  }
  ws.close(); chrome.kill();
}
main().catch(e=>{console.error(e);process.exit(1)});
