import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {parseHTML} from 'linkedom';
const {window,document}=parseHTML(fs.readFileSync(new URL('../assets/community-ideas-review.html',import.meta.url),'utf8'));
const get=id=>document.getElementById(id);Object.defineProperty(get('review-filter'),'value',{value:'pending',writable:true});
let attempts=0,saved;
const client={auth:{getUser:async()=>({data:{user:{id:'admin'}}})},from:table=>{
 if(table==='readmalawi_admins')return {select:()=>({eq:()=>({maybeSingle:async()=>({data:{user_id:'admin'}})})})};
 return {select:()=>({eq:()=>({order:()=>({limit:()=>({abortSignal:async()=>{if(++attempts===1)throw Error('Network interrupted');return {data:[{id:'example',category:'website',body:'Please make browsing clearer.',response:'',status:'pending',created_at:'2026-10-16'}]}}})})})}),update:row=>({eq:()=>({select:()=>({abortSignal:async()=>{saved=row;return {data:[{id:'example'}]}}})})})};
}};
const source=fs.readFileSync(new URL('../assets/community-ideas-review.js',import.meta.url),'utf8').replace("import {getSupabaseModule} from './supabase-loader.js';",'');
await vm.runInNewContext('(async()=>{'+source+'})()',{document,window,AbortSignal,getSupabaseModule:async()=>({createClient:()=>client})});
assert.equal(get('review-tools').hidden,false);assert.match(get('review-status').textContent,/Could not load/);assert.equal(get('review-refresh').disabled,false);
get('review-refresh').click();await new Promise(r=>setTimeout(r,0));assert.equal(get('review-list').children.length,1);
get('review-list').querySelector('textarea').value='Discuss simpler browsing';const button=[...get('review-list').querySelectorAll('button')].find(b=>b.textContent==='Save private note');assert(button);button.click();await new Promise(r=>setTimeout(r,0));assert.deepEqual(JSON.parse(JSON.stringify(saved)),{status:'pending',response:'Discuss simpler browsing'});assert.equal(get('review-list').children.length,1);assert.match(get('review-list').textContent,/Nothing has been published/);assert.equal(button.disabled,false);
console.log('PASS: admin inbox recovers after failed load; notes save without changing status or removing feedback.');
