// ReadMalawi browser-only download feedback. Never sends text or reads file storage.
// Browsers decide whether to open the operating system Downloads manager.
let activePanel=null;
const el=(tag,className,text)=>{
  const e=document.createElement(tag);
  if(className)e.className=className;
  if(text!==undefined)e.textContent=text;
  return e;
};
// Render browser-only, readable private text. Escape all user-entered text before HTML.
// No external resources, network access, scripts or download API calls from the viewer.
const escapePreviewHtml=value=>String(value).replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
})[c]);
export function makeMobilePreviewHtml(filename,content){
  const title=escapePreviewHtml(filename);
  const text=escapePreviewHtml(content);
  return [
    '<!doctype html><html lang="en"><head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;">',
    '<meta name="color-scheme" content="light">',
    '<title>'+title+' | ReadMalawi TEST preview</title>',
    '<style>',
    ':root{font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#163c2e;background:#f5f8f4}',
    '*{box-sizing:border-box}body{margin:0;padding:0 16px 36px}',
    'header{background:#103f33;color:#fff;margin:0 -16px 24px;padding:24px max(16px,calc((100% - 900px)/2))}',
    'header small{display:block;color:#e7c585;letter-spacing:.12em;font-weight:800;font-size:12px}',
    'header h1{font-size:clamp(1.25rem,4.7vw,2rem);overflow-wrap:anywhere;line-height:1.3;margin:8px 0}',
    'main{max-width:900px;margin:auto}',
    '.notice{padding:12px 14px;background:#fff3d9;border:1px solid #e4d19e;border-radius:10px;color:#6a4d1d;font-size:14px;line-height:1.6;margin:0 0 20px}',
    'pre{white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;font:16px/1.75 ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace;margin:0;padding:18px;background:#fff;border:1px solid #d1e0d5;border-radius:13px;color:#1d3e31}',
    '.tip{font-size:13px;color:#58685f;margin:18px 0;line-height:1.6}',
    '@media(max-width:540px){header{padding:19px 16px}pre{font-size:15px;line-height:1.72;padding:14px}}',
    '@media print{body{padding:0;background:white;color:black}header{margin:0 0 14px;background:white;color:black;padding:0}.notice,.tip{display:none}pre{border:0;padding:0;font-size:10pt;line-height:1.45;overflow-wrap:anywhere}}',
    '</style></head><body>',
    '<header><small>READMALAWI · PRIVATE TEST PREVIEW</small><h1>'+title+'</h1></header>',
    '<main><p class="notice">For internal development review only. This is a readable browser preview, not a quotation or invoice. No file was uploaded or emailed. Use the original tab to download the .txt file.</p>',
    '<pre>'+text+'</pre>',
    '<p class="tip">This preview stays in your browser. You can adjust your phone’s font or zoom settings for easier reading.</p>',
    '</main></body></html>'
  ].join("");
}

export function showDownloadPanel({filename,content,onDownload,trigger}={}){
  if(!filename||typeof content!=="string"||typeof onDownload!=="function")return;
  if(activePanel)activePanel.close();
  const originalFocus=trigger||document.activeElement;
  const overlay=el("div","rm-download-overlay");
  overlay.setAttribute("role","presentation");
  const box=el("section","rm-download-dialog");
  box.setAttribute("role","dialog");
  box.setAttribute("aria-modal","true");
  box.setAttribute("aria-labelledby","rm-download-title");
  box.tabIndex=-1;
  const eyebrow=el("p","rm-download-kicker","READMALAWI · TEST EXPORT");
  const heading=el("h2","", "Download requested");
  heading.id="rm-download-title";
  const message=el("p","", "Your browser has been asked to save this draft. The browser controls whether a system Downloads notification or tab appears.");
  const filenameLabel=el("p","rm-download-file",filename);
  const note=el("p","rm-download-note","File stays on this device. No client email, quote, payment or database change.");
  const actions=el("div","rm-download-actions");
  const previewButton=el("button","rm-download-btn","Preview file");
  previewButton.type="button";previewButton.setAttribute("aria-expanded","false");
  const tabButton=el("button","rm-download-btn","Open in new tab");
  tabButton.type="button";
  const againButton=el("button","rm-download-btn","Download again");
  againButton.type="button";
  const closeButton=el("button","rm-download-btn primary","Close");
  closeButton.type="button";
  const filePreview=el("pre","rm-download-preview",content);
  filePreview.hidden=true;
  const helper=el("p","rm-download-note", "If no Android download notification appears, check your browser menu → Downloads. You can always preview the text here.");
  const status=el("p","rm-download-status","");
  status.setAttribute("role","status");
  status.setAttribute("aria-live","polite");
  actions.append(previewButton,tabButton,againButton,closeButton);
  box.append(eyebrow,heading,message,filenameLabel,note,actions,filePreview,helper,status);
  overlay.append(box);
  const previousOverflow=document.body.style.overflow;
  let closed=false;
  const onKeyDown=e=>{
    if(e.key==="Escape"){e.preventDefault();close();}
    if(e.key==="Tab"){
      const enabled=[previewButton,tabButton,againButton,closeButton];
      const first=enabled[0],last=enabled[enabled.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  };
  function close(){
    if(closed)return;
    closed=true;
    document.removeEventListener("keydown",onKeyDown);
    overlay.remove();document.body.style.overflow=previousOverflow;
    if(activePanel?.element===overlay)activePanel=null;
    if(originalFocus&&typeof originalFocus.focus==="function"&&originalFocus.isConnected)originalFocus.focus();
  }
  overlay.addEventListener("click",e=>{if(e.target===overlay)close()});
  closeButton.addEventListener("click",close);
  previewButton.addEventListener("click",()=>{
    const show=filePreview.hidden;
    filePreview.hidden=!show;
    previewButton.textContent=show?"Hide preview":"Preview file";
    previewButton.setAttribute("aria-expanded",String(show));
    if(show)filePreview.scrollIntoView({behavior:"smooth",block:"nearest"});
  });
  tabButton.addEventListener("click",()=>{
    // Open a responsive, private HTML viewer instead of the browser's tiny plain-text display.
    // No external scripts, styling or network requests are used.
    const viewer=makeMobilePreviewHtml(filename,content);
    const url=URL.createObjectURL(new Blob([viewer],{type:"text/html;charset=utf-8"}));
    const link=document.createElement("a");
    link.href=url;link.target="_blank";link.rel="noopener noreferrer";
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    status.textContent="Readable preview requested in a new tab. If your browser blocks it, use Preview file.";
  });
  againButton.addEventListener("click",()=>{
    try{onDownload();status.textContent="The browser received another download request.";}
    catch(error){status.textContent="Download could not be started. Try again or use Preview file.";}
  });
  document.body.append(overlay);
  document.body.style.overflow="hidden";
  document.addEventListener("keydown",onKeyDown);
  previewButton.focus();
  activePanel={element:overlay,close};
}
