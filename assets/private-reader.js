import {readEPUB} from './epub-text.js';
import { loadPublicCatalogue, cleanBook } from './catalogue-tools.js';
const $=id=>document.getElementById(id),say=t=>$('status').textContent=t;
const cfg=window.READMALAWI_CONFIG||{};
let pdf=null,parts=[],page=1,total=0,currentText='',key='',busy=false,generation=0,textView=false,voices=[],speechGeneration=0,renderTask=null;
const synth=window.speechSynthesis;
let libraryLoading=false;
function stop(){speechGeneration++;if(synth)synth.cancel();$('pause').disabled=true;$('stop').disabled=true;$('pause').textContent='Pause'}
function reset(){generation++;libraryLoading=false;$('retry-book').hidden=true;$('cancel-opening').hidden=true;$('library-audio').hidden=true;const audio=$('audio-player').querySelector('audio');if(audio){audio.pause?.();audio.removeAttribute('src');audio.load?.()}$('audio-player').replaceChildren();stop();if(renderTask)renderTask.cancel();renderTask=null;if(pdf)pdf.destroy();pdf=null;parts=[];currentText='';total=0;key='';$('workspace').hidden=true;$('file-panel').hidden=false;$('privacy-note').textContent='Your personal file is opened in this browser, not uploaded to ReadMalawi or published to the library. Reading tools are downloaded when needed.';$('pdf-canvas').hidden=true;$('pdf-canvas').width=0;$('pdf-canvas').height=0;$('page-text').textContent='';$('page-text').hidden=true;textView=false;$('text-toggle').textContent='Text view';$('text-toggle').setAttribute('aria-pressed','false');$('book-file').value='';$('saved-place').textContent='';$('book-title').textContent='Open a book. Make time to read.';say('Book cleared from this tab. Saved page positions can be removed in browser site data.');busy=false}
function restore(){try{const saved=Number(localStorage.getItem(key));page=Number.isInteger(saved)&&saved>=1&&saved<=total?saved:1;if(page>1)$('saved-place').textContent='Resumed at your saved page / section '+page+'.'}catch{page=1}}
function updateView(){
 $('page-text').hidden=!!pdf&&!textView;$('pdf-canvas').hidden=!pdf||textView;
 $('text-toggle').hidden=!pdf;$('text-toggle').disabled=!currentText;
 $('text-toggle').setAttribute('aria-pressed',String(!!pdf&&textView));
 $('text-toggle').textContent=textView?'Original page':'Text view';
 $('font-size').disabled=!currentText;
 $('view-help').textContent=pdf?(currentText?'Text size opens the extracted text view. Use Original page to return to the PDF layout.':'This page is a scan or image. Text size and listening need readable text; use your browser’s zoom to enlarge the original page.'):'Text size changes the reading text below.';
}
async function showPage(next){
 if(busy||!total)return;page=Math.max(1,Math.min(total,next));busy=true;const token=generation;let ready=false;stop();say('Opening page / section '+page+'…');
 currentText='';$('page-text').textContent='';$('page-text').hidden=true;$('pdf-canvas').hidden=true;
 $('page-number').value=page;$('page-number').max=total;$('page-total').textContent='of '+total;
 for(const id of ['previous','next','listen','font-size','text-toggle','bookmark'])$(id).disabled=true;
 try{
  if(pdf){
   const p=await pdf.getPage(page);if(token!==generation)return;
   const text=await p.getTextContent();currentText=text.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('').trim();
   const base=p.getViewport({scale:1});const width=Math.min(1200,Math.max(280,$('page-surface').clientWidth-28));const viewport=p.getViewport({scale:Math.min(2,width/base.width)});
   const c=$('pdf-canvas');c.width=Math.ceil(viewport.width);c.height=Math.ceil(viewport.height);
   renderTask=p.render({canvasContext:c.getContext('2d'),viewport});await renderTask.promise;renderTask=null;
  }else currentText=parts[page-1]||'';
  if(token!==generation)return;
  if(!currentText&&pdf)textView=false;
  $('page-text').textContent=currentText||'No readable text was found on this page. It may be a scan or image. You can still view the original PDF.';
  updateView();ready=true;
  $('listen').disabled=!currentText||!voices.length||!synth;
  say('Page / section '+page+' of '+total+(currentText?' ready.':' · No extractable text; listening is unavailable.'));
 }catch(e){if(token===generation){currentText='';$('view-help').textContent='Choose another page or enter this page number again to retry.';say('This page could not open. Try another page or reopen the file. '+(e.name==='PasswordException'?'Password-protected PDFs are not supported.':''))}}
 finally{if(token===generation){busy=false;$('previous').disabled=page<=1;$('next').disabled=page>=total;$('bookmark').disabled=!ready}}
}
async function loadPDF(source){
 const lib=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.min.mjs');
 lib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.worker.min.mjs';
 const loaded=await lib.getDocument({...source,isEvalSupported:false,enableXfa:false}).promise;return loaded;
}
async function openFile(file){
 reset();if(!file)return;if(file.size>50*1024*1024){say('Choose a file smaller than 50 MB.');return}
 const ext=file.name.split('.').pop().toLowerCase();if(!['pdf','epub','txt'].includes(ext)){say('Choose a PDF, EPUB or plain text file.');return}
 busy=true;const token=generation;say('Opening your file on this device…');
 try{
  const data=new Uint8Array(await file.arrayBuffer());const hash=await crypto.subtle.digest('SHA-256',data.slice(0,65536));key='rm-place-'+file.size+'-'+Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join('');
  if(ext==='pdf'){const loaded=await loadPDF({data});if(token!==generation){loaded.destroy();return}pdf=loaded;total=pdf.numPages}
  else if(ext==='epub'){const sections=await readEPUB(data);if(token!==generation)return;parts=sections;total=parts.length}
  else {if(file.size>2*1024*1024)throw Error('Plain text files must be smaller than 2 MB');const text=new TextDecoder().decode(data);for(let i=0;i<text.length;i+=10000)parts.push(text.slice(i,i+10000));total=parts.length}
  if(token!==generation)return;if(!total)throw Error('This file is empty');
  $('book-title').textContent=file.name;$('workspace').hidden=false;restore();busy=false;await showPage(page);
 }catch(e){if(token===generation){say('Could not open this file: '+e.message+'. Your file has not been uploaded.');busy=false}}
}
function refreshVoices(){voices=synth?synth.getVoices():[];const chosen=$('voice').value;$('voice').replaceChildren();voices.forEach((v,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=v.name+' · '+v.lang+(v.localService?' · device':' · online service');$('voice').append(o)});if(voices[Number(chosen)])$('voice').value=chosen;else{const en=voices.findIndex(v=>v.lang.startsWith('en'));if(en>=0)$('voice').value=String(en)}$('listen').disabled=!voices.length||!currentText;$('speech-status').textContent=voices.length?'Choose a matching language voice. Listening reads this page / section only.':'No speech voices are available in this browser. Reading still works; try your phone’s text-to-speech settings or another browser.'}
if(synth){synth.onvoiceschanged=refreshVoices;refreshVoices()}else refreshVoices();
$('listen').addEventListener('click',()=>{if(!synth||!currentText||!voices.length)return;stop();const token=speechGeneration;const chunks=currentText.match(/[\s\S]{1,600}(?:\s|$)|[\s\S]{1,600}/g)||[];let at=0;
 function speak(){if(token!==speechGeneration)return;if(at>=chunks.length){$('speech-status').textContent='Page / section finished.';$('pause').disabled=true;$('stop').disabled=true;return}const u=new SpeechSynthesisUtterance(chunks[at++]);u.voice=voices[Number($('voice').value)]||voices[0];u.lang=u.voice.lang;u.rate=Number($('rate').value);u.onend=speak;u.onerror=e=>{if(token===speechGeneration){$('speech-status').textContent='Speech stopped: '+e.error+'. Try a different voice.';stop()}};synth.speak(u)}
 $('pause').disabled=false;$('stop').disabled=false;$('speech-status').textContent='Reading page / section '+page+' aloud…';speak();
});
$('pause').addEventListener('click',()=>{if(!synth)return;if(synth.paused){synth.resume();$('pause').textContent='Pause'}else{synth.pause();$('pause').textContent='Resume'}});$('stop').addEventListener('click',()=>{stop();$('speech-status').textContent='Listening stopped.'});
$('book-file').addEventListener('change',e=>openFile(e.target.files[0]));$('clear').addEventListener('click',reset);
$('previous').addEventListener('click',()=>showPage(page-1));$('next').addEventListener('click',()=>showPage(page+1));$('page-number').addEventListener('change',e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=total)showPage(n);else e.target.value=page});
$('text-toggle').addEventListener('click',()=>{if(busy||!pdf||!currentText)return;textView=!textView;updateView()});
$('font-size').addEventListener('change',e=>{if(busy||!currentText)return;$('page-text').style.fontSize=e.target.value+'px';if(pdf)textView=true;updateView()});
$('bookmark').addEventListener('click',()=>{try{localStorage.setItem(key,String(page));$('saved-place').textContent='Saved page / section '+page+' on this browser. Reopen the same book to resume. The book itself is not saved.'}catch{$('saved-place').textContent='This browser could not save your place.'}});
$('forget').addEventListener('click',()=>{try{localStorage.removeItem(key);$('saved-place').textContent='Saved position removed from this browser.'}catch{$('saved-place').textContent='Could not remove saved position.'}});
$('demo').addEventListener('click',()=>openFile(new File(['A book can begin a conversation. Chisomo brought a story to the reading group. Each reader chose a favourite sentence and explained why it mattered. They listened to different views and agreed to meet again.\n\nTry the text-size and listening controls. This sample is original ReadMalawi demonstration text.'],'ReadMalawi reading sample.txt',{type:'text/plain'})));
window.addEventListener('pagehide',event=>{stop();if(pdf&&!event.persisted)pdf.destroy()});
const id=new URLSearchParams(location.search).get('book');
$('retry-book').addEventListener('click',()=>openLibraryBook());
$('cancel-opening').addEventListener('click',reset);
$('close-audio').addEventListener('click',reset);
async function openLibraryBook(){
 if(!id||libraryLoading)return;
 reset();libraryLoading=true;const token=generation;
 $('file-panel').hidden=true;$('cancel-opening').hidden=false;$('privacy-note').textContent='Read a released ReadMalawi book. Page positions can be saved on this browser; no reading progress is sent to ReadMalawi.';say('Connecting to the library book…');
 try{
  if(!/^[0-9a-f-]{36}$/i.test(id))throw Error('Invalid book reference');
  const all=await loadPublicCatalogue(cfg);if(token!==generation)return;
  const raw=all.find(b=>b.id===id);if(!raw)throw Error('This book is not currently available');const book=cleanBook(raw);key='rm-library-place-'+id;
  const {getSupabaseModule}=await import('./supabase-loader.js');const mod=await getSupabaseModule();if(token!==generation)return;const client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
  const result=await client.storage.from('readmalawi-library').createSignedUrl(book.file_path,3600);if(token!==generation)return;if(result.error)throw result.error;const url=result.data.signedUrl;
  if(book.media_type==='audiobook'){
   const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=url;
   audio.addEventListener('error',()=>{if(token===generation){say('The audio could not load. Retry opening this library book, or contact info@readmalawi.fyi.');$('retry-book').hidden=false}});
   $('audio-player').replaceChildren(audio);$('library-audio').hidden=false;$('book-title').textContent=book.title;say('Use the audio controls to listen.');
  }else{
   if(/\.epub$/i.test(book.file_path)){
    const res=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!res.ok)throw Error('Book download unavailable');const buf=await res.arrayBuffer();if(token!==generation)return;if(buf.byteLength>50*1024*1024)throw Error('Book exceeds this reader’s 50 MB limit');
    const sections=await readEPUB(new Uint8Array(buf));if(token!==generation)return;parts=sections;total=parts.length;
   }else{
    const loaded=await loadPDF({url});if(token!==generation){loaded.destroy();return}pdf=loaded;total=pdf.numPages;
   }
   $('book-title').textContent=book.title;$('workspace').hidden=false;restore();await showPage(page);
  }
 }catch(e){if(token===generation){say('Book unavailable: '+e.message+'. Retry below, browse another title, or contact info@readmalawi.fyi.');$('retry-book').hidden=false;$('file-panel').hidden=false}}
 finally{if(token===generation){libraryLoading=false;$('cancel-opening').hidden=true}}
}
if(id)await openLibraryBook();
