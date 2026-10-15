import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
const {document,window}=parseHTML(await readFile(new URL('../assets/private-reader.html',import.meta.url),'utf8'));
globalThis.document=document;globalThis.window=window;globalThis.location={search:''};globalThis.DOMParser=window.DOMParser;
const state=new Map();globalThis.localStorage={getItem:k=>state.get(k)||null,setItem:(k,v)=>state.set(k,v)};
for(const [id,v]of [['voice','0'],['rate','1'],['page-number','1'],['font-size','18'],['book-file','']])Object.defineProperty(document.getElementById(id),'value',{value:v,writable:true,configurable:true});
let spoken=[];window.speechSynthesis={getVoices:()=>[{name:'Test English',lang:'en-GB',localService:true}],cancel(){},speak(u){spoken.push(u.text);queueMicrotask(()=>u.onend?.())},pause(){},resume(){}};globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
globalThis.fetch=()=>{throw Error('Personal text reading must not fetch or upload files')};
await import('../assets/private-reader.js');
const $=id=>document.getElementById(id),click=id=>$(id).dispatchEvent(new window.Event('click'));
async function waitFor(fn){for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,5))}throw Error('Timed out: '+$('status').textContent)}
click('demo');await waitFor(()=>$('status').textContent.includes('ready.'));assert.equal($('workspace').hidden,false);assert.match($('page-text').textContent,/Chisomo/);click('listen');await waitFor(()=>spoken.length>0);assert.match(spoken.join(''),/Chisomo/);
click('bookmark');assert.equal(state.size,1);click('clear');assert.equal($('workspace').hidden,true);assert.equal($('page-text').textContent,'');
const text='<script>UNTRUSTED</script> '+('A paragraph about reading. '.repeat(500));const file=new File([text],'test.txt',{type:'text/plain'});Object.defineProperty($('book-file'),'files',{value:[file],configurable:true});$('book-file').dispatchEvent(new window.Event('change'));await waitFor(()=>$('status').textContent.includes('ready.'));assert.equal($('page-text').querySelector('script'),null);assert.equal($('page-total').textContent,'of 2');click('next');await waitFor(()=>$('status').textContent.startsWith('Page / section 2'));click('bookmark');click('clear');Object.defineProperty($('book-file'),'files',{value:[file],configurable:true});$('book-file').dispatchEvent(new window.Event('change'));await waitFor(()=>$('status').textContent.startsWith('Page / section 2'));assert.match($('saved-place').textContent,/Resumed/);
click('clear');Object.defineProperty($('book-file'),'files',{value:[{name:'huge.pdf',size:51*1024*1024}],configurable:true});$('book-file').dispatchEvent(new window.Event('change'));assert.match($('status').textContent,/smaller than 50 MB/);
console.log('PASS: personal text stays local, safe text rendering, speech selection, multi-section navigation, save/resume, clear and file-size validation');
