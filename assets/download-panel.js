// ReadMalawi browser-only download feedback. Never sends text or reads file storage.
// Browsers decide whether to open the operating system Downloads manager.
let activePanel=null;
const el=(tag,className,text)=>{
  const e=document.createElement(tag);
  if(className)e.className=className;
  if(text!==undefined)e.textContent=text;
  return e;
};
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
    // Opening text in a separate browser tab is user-initiated; some mobile apps may block it.
    const url=URL.createObjectURL(new Blob([content],{type:"text/plain;charset=utf-8"}));
    const link=document.createElement("a");
    link.href=url;link.target="_blank";link.rel="noopener noreferrer";
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    status.textContent="New tab requested. If your browser blocks it, use Preview file instead.";
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
