import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {parseHTML} from 'linkedom';
const {document,window}=parseHTML(fs.readFileSync(new URL('../assets/partner-inbox.html',import.meta.url),'utf8')),get=id=>document.getElementById(id),tick=()=>new Promise(r=>setTimeout(r,0));
for(const [id,value] of [['interest-filter','all'],['status-filter','all'],['record-filter','unmarked']])Object.defineProperty(get(id),'value',{value,writable:true,configurable:true});
window.READMALAWI_CONFIG={sitePhase:'production',supabaseUrl:'https://example.invalid',supabasePublishableKey:'public'};
let loads=0,saves=0,resolveSave;const row={id:'test',contact_name:'Example Partner',contact_email:'example@example.com',interest:'sponsor',message:'An example enquiry',status:'new',admin_notes:'',created_at:'2026-10-16'};
const client={auth:{getUser:async()=>({data:{user:{id:'admin',email:'admin@example.com'}}})},from:table=>{
 if(table==='readmalawi_admins')return {select:()=>({eq:()=>({maybeSingle:async()=>({data:{user_id:'admin'}})})})};
 return {select:()=>({order:()=>({limit:()=>({abortSignal:async()=>{if(++loads===2)throw Error('Offline');return {data:[row]}}})})}),update:change=>{saves++;return {eq:()=>({select:()=>({maybeSingle:()=>({abortSignal:()=>new Promise(resolve=>resolveSave=resolve)})})})}}};
}};
let source=fs.readFileSync(new URL('../assets/partner-inbox.js',import.meta.url),'utf8').replace(/^import .*;$/mg,'').replace('await import("./supabase-loader.js")','await mockSDK()');
vm.runInNewContext(source,{document,window,URLSearchParams,AbortSignal,setTimeout:()=>0,clearTimeout(){},mockSDK:async()=>({getSupabaseModule:async()=>({createClient:()=>client})}),attachPilotPlanner(){},attachPilotCosting(){},attachInternalProposalBuilder(){}});await tick();
assert.equal(get('inbox').children.length,1);get('refresh').click();await tick();assert.match(get('status').textContent,/Could not refresh/);assert.equal(get('inbox').children.length,1);assert.equal(get('refresh').disabled,false);
const button=get('inbox').querySelector('button'),notes=get('inbox').querySelector('textarea');notes.value='Follow up later';button.click();button.click();assert.equal(saves,1);assert.equal(notes.disabled,true);resolveSave({error:Error('Offline')});await tick();assert.equal(button.disabled,false);assert.equal(notes.disabled,false);assert.equal(notes.value,'Follow up later');assert.match(get('inbox').textContent,/Save failed/);
console.log('PASS: enquiry refresh failure preserves loaded records; duplicate saves blocked; failed notes remain editable and recoverable.');
