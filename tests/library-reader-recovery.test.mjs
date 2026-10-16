import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {webcrypto} from 'node:crypto';import {parseHTML} from 'linkedom';
const id='45da6577-b38f-4fda-a026-61f014cfb5b6';
const html=fs.readFileSync(new URL('../assets/private-reader.html',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../assets/private-reader.js',import.meta.url),'utf8').replace(/^import .*;$/mg,'').replace("await import('./supabase-loader.js')",'await mockSDK()');
function setup(load){
 const {window,document}=parseHTML(html),get=id=>document.getElementById(id);
 for(const [key,value] of [['voice','0'],['rate','1'],['font-size','18'],['book-file',''],['page-number','1']])Object.defineProperty(get(key),'value',{value,writable:true,configurable:true});
 window.speechSynthesis={getVoices:()=>[],cancel(){}};
 const ctx={document,window,location:{search:'?book='+id},localStorage:{getItem:()=>null},crypto:webcrypto,File,TextDecoder,Uint8Array,URLSearchParams,AbortSignal,loadPublicCatalogue:load,cleanBook:b=>b,mockSDK:async()=>({getSupabaseModule:async()=>({createClient:()=>({storage:{from:()=>({createSignedUrl:async()=>({data:{signedUrl:'https://example.invalid/audio.mp3'}})})}})})})};
 const ready=vm.runInNewContext('(async()=>{'+source+'})()',ctx);
 return {get,ready,click:key=>get(key).dispatchEvent(new window.Event('click'))};
}
const book={id,title:'Library audio',media_type:'audiobook',file_path:'audio.mp3'};let attempts=0;
const a=setup(async()=>{if(++attempts===1)throw Error('Connection interrupted');return [book]});await a.ready;assert.equal(a.get('retry-book').hidden,false);assert.match(a.get('status').textContent,/Retry below/);
a.click('retry-book');a.click('retry-book');await new Promise(r=>setTimeout(r,0));assert.equal(attempts,2);assert.equal(a.get('library-audio').hidden,false);assert(a.get('book-file'));a.click('close-audio');assert.equal(a.get('library-audio').hidden,true);assert.equal(a.get('audio-player').children.length,0);a.click('demo');await new Promise(r=>setTimeout(r,30));assert.match(a.get('status').textContent,/ready/);
let resolveLoad;const b=setup(()=>new Promise(resolve=>resolveLoad=resolve));assert.equal(b.get('cancel-opening').hidden,false);b.click('cancel-opening');b.click('demo');await new Promise(r=>setTimeout(r,30));resolveLoad([book]);await b.ready;assert.equal(b.get('library-audio').hidden,true);assert.match(b.get('book-title').textContent,/reading sample/);assert.equal(b.get('retry-book').hidden,true);
console.log('PASS: failed library load can retry once; duplicate clicks blocked; audio closing preserves file reader; cancelled load cannot replace personal reading.');
