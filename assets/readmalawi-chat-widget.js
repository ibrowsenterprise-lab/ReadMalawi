// In-site ReadMalawi Reading Buddy panel, shown without navigating to another website.
(function(){
"use strict";
if(document.getElementById("readmalawi-chat-launch"))return;
const prefix=location.pathname.startsWith("/assets/")?"":"assets/";
const css=document.createElement("style");
css.textContent=[
'#readmalawi-chat-launch{position:fixed;right:15px;bottom:15px;z-index:500;border:0;border-radius:999px;background:#0b6349;color:#fff;min-height:52px;padding:10px 18px;font:750 .95rem system-ui,-apple-system,sans-serif;box-shadow:0 8px 28px #082c2760;cursor:pointer}',
'#readmalawi-chat-launch:hover{background:#084a37}',
'#readmalawi-chat-panel{position:fixed;z-index:501;right:15px;bottom:78px;width:min(440px,calc(100vw - 22px));height:min(660px,calc(100dvh - 105px));border-radius:18px;border:1px solid #b0cfc1;background:white;box-shadow:0 20px 60px #041e1966;overflow:hidden;display:flex;flex-direction:column}',
'#readmalawi-chat-panel[hidden]{display:none}',
'#readmalawi-chat-top{display:flex;align-items:center;justify-content:space-between;background:#092e2b;color:white;font:750 1rem system-ui;padding:7px 13px;gap:8px;min-height:43px}',
'#readmalawi-chat-top button{border:1px solid #b8d0c1;background:transparent;color:#fff;min-width:36px;min-height:33px;border-radius:8px;font:700 1.1rem system-ui;cursor:pointer}',
'#readmalawi-chat-frame{width:100%;height:100%;flex:1;min-height:0;border:0}',
'#readmalawi-chat-panel button:focus-visible,#readmalawi-chat-launch:focus-visible{outline:3px solid #ffcd76;outline-offset:2px}',
'@media(max-width:550px){#readmalawi-chat-panel{right:7px;bottom:75px;width:calc(100vw - 14px);height:min(660px,calc(100dvh - 93px))}#readmalawi-chat-launch{right:10px;bottom:10px}}'
].join("\n");document.head.append(css);
const launch=document.createElement("button");launch.id="readmalawi-chat-launch";launch.type="button";launch.textContent="📚 Ask Buddy";launch.setAttribute("aria-expanded","false");launch.setAttribute("aria-controls","readmalawi-chat-panel");
const panel=document.createElement("div");panel.id="readmalawi-chat-panel";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-label","ReadMalawi Reading Buddy");
const bar=document.createElement("div");bar.id="readmalawi-chat-top";const label=document.createElement("strong");label.textContent="Reading Buddy";const close=document.createElement("button");close.type="button";close.setAttribute("aria-label","Close Reading Buddy");close.textContent="×";bar.append(label,close);
const frame=document.createElement("iframe");frame.id="readmalawi-chat-frame";frame.title="ReadMalawi Reading Buddy";frame.setAttribute("loading","lazy");frame.setAttribute("referrerpolicy","strict-origin");frame.src=prefix+"reading-buddy.html";
panel.append(bar,frame);document.body.append(launch,panel);
const toggle=(open)=>{panel.hidden=!open;launch.setAttribute("aria-expanded",String(open));if(open)close.focus();else launch.focus()};
launch.addEventListener("click",()=>toggle(panel.hidden));
close.addEventListener("click",()=>toggle(false));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!panel.hidden)toggle(false)});
})();