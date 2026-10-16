import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {parseHTML} from 'linkedom';import {cleanBook,scoreBooks} from '../assets/catalogue-tools.js';
const tick=()=>new Promise(r=>setTimeout(r,0));
function page(path){const {document,window}=parseHTML(fs.readFileSync(new URL('../assets/'+path,import.meta.url),'utf8'));return {document,window,get:id=>document.getElementById(id)}}
{
 const {document,window,get}=page('learning-services.html');get('study-result').scrollIntoView=()=>{};
 for(const [id,value] of [['study-minutes','5'],['study-notes','PrivateExampleWord: plants need sunlight and water to grow. A gardener observes the soil and checks the leaves every morning.'],['study-own-summary','']])Object.defineProperty(get(id),'value',{value,writable:true,configurable:true});
 let exports=0;const ctx={document,window,Blob,URL:{createObjectURL(){exports++;return 'blob:test'},revokeObjectURL(){}},setTimeout,clearInterval,setInterval};
 vm.runInNewContext(fs.readFileSync(new URL('../assets/learning-services.js',import.meta.url),'utf8'),ctx);
 get('study-build').click();assert.equal(get('study-result').hidden,false);assert.match(get('study-quote').textContent,/PrivateExampleWord/);
 const total=[...get('study-plan').querySelectorAll('strong')].reduce((n,x)=>n+Number(x.textContent.match(/(\d+) min/)[1]),0);assert.equal(total,5);
 get('study-clear').click();assert.equal(get('study-result').hidden,true);assert.equal(get('study-notes').value,'');assert.equal(get('study-terms').children.length,0);assert.equal(get('study-quote').textContent,'');assert(!document.body.textContent.includes('PrivateExampleWord'));get('study-export').click();assert.equal(exports,0);
}
{
 const {document,window,get}=page('reading-buddy.html');Object.defineProperty(get('question'),'value',{value:'',writable:true});window.READMALAWI_CONFIG={supabaseUrl:'https://example.invalid',supabasePublishableKey:'public'};
 const src=fs.readFileSync(new URL('../assets/reading-buddy.js',import.meta.url),'utf8').replace(/^import .*;$/mg,'');
 vm.runInNewContext(src,{document,window,AbortSignal,URLSearchParams,location:{href:'https://readmalawi.fyi/assets/reading-buddy.html'},cleanBook,scoreBooks,loadPublicCatalogue:async()=>[],fetch:async()=>({ok:true,json:async()=>({ai_enabled:false})})});await tick();
 for(const [q,expected] of [['I want to donate money for books','support-readmalawi.html'],['I want to donate physical books','physical-books.html'],['Where can I send website feedback?','community-ideas.html'],['How can I listen to my book?','private-reader.html']]){get('question').value=q;get('chat-form').dispatchEvent(new window.Event('submit',{cancelable:true}));await tick();const last=get('messages').lastElementChild;assert.equal(last.querySelector('a').getAttribute('href'),expected,q)}
 assert.equal(get('ai-panel').hidden,true);
}
{
 const {document,window}=parseHTML('<html><body><div class="by">Original story</div><p>A story about sharing books.</p><div class="end">The end</div></body></html>');
 let voices=[],voiceChange,spoken=[];window.SpeechSynthesisUtterance=class{};window.speechSynthesis={getVoices:()=>voices,cancel(){},speak:u=>spoken.push(u),addEventListener:(_,fn)=>voiceChange=fn};
 vm.runInNewContext(fs.readFileSync(new URL('../assets/read-aloud.js',import.meta.url),'utf8'),{document,window,SpeechSynthesisUtterance:class{constructor(text){this.text=text}}});
 const play=document.querySelector('button'),status=document.querySelector('[role=status]');assert.equal(play.disabled,true);play.click();assert.equal(spoken.length,0);
 voices=[{lang:'fr-FR',localService:true}];voiceChange();assert.equal(play.disabled,true);
 voices=[{lang:'en-GB',localService:false}];voiceChange();assert.equal(play.disabled,false);assert.match(status.textContent,/online English/);play.click();assert.equal(spoken.length,1);assert.equal(spoken[0].voice.lang,'en-GB');spoken[0].onend();assert.match(status.textContent,/Finished/);
}
{
 const {document,window}=parseHTML('<html><head></head><body></body></html>');
 vm.runInNewContext(fs.readFileSync(new URL('../assets/readmalawi-chat-widget.js',import.meta.url),'utf8'),{document,location:{pathname:'/library.html'}});
 const panel=document.getElementById('readmalawi-chat-panel'),launch=document.getElementById('readmalawi-chat-launch'),frame=document.querySelector('iframe');
 const inside=parseHTML('<html><body><input></body></html>');Object.defineProperty(frame,'contentDocument',{value:inside.document});frame.dispatchEvent(new window.Event('load'));launch.click();assert.equal(panel.hidden,false);
 const escape=new inside.window.Event('keydown',{cancelable:true});Object.defineProperty(escape,'key',{value:'Escape'});inside.document.dispatchEvent(escape);assert.equal(panel.hidden,true);assert.equal(launch.getAttribute('aria-expanded'),'false');
}
console.log('PASS: study clearing, cash/physical-book Buddy routing, English speech availability and Escape inside the Buddy frame.');
