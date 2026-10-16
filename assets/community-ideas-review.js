import {getSupabaseModule} from './supabase-loader.js';
const $=id=>document.getElementById(id),cfg=window.READMALAWI_CONFIG||{};
let client=null,admin=false,loading=false;
const element=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el};
async function load(){
 if(!admin||loading)return;
 loading=true;$('review-refresh').disabled=true;$('review-filter').disabled=true;$('review-status').textContent='Loading private feedback…';
 try{
  const {data,error}=await client.from('readmalawi_community_ideas').select('id,category,body,response,status,created_at').eq('status',$('review-filter').value).order('created_at',{ascending:true}).limit(100).abortSignal(AbortSignal.timeout(12000));
  if(error)throw error;
  $('review-list').replaceChildren();$('review-status').textContent=data.length?data.length+' private submissions in this view.':'No private feedback in this view.';
  for(const idea of data){
   const card=document.createElement('article');card.className='idea-card';
   card.append(element('strong',idea.category+' · '+new Date(idea.created_at).toLocaleDateString()),element('p',idea.body));
   const label=element('label','Private administrator note (optional)'),reply=document.createElement('textarea');reply.maxLength=600;reply.rows=3;reply.value=idea.response||'';label.append(reply);card.append(label);
   const row=document.createElement('div');row.className='review-row';const note=element('p','');note.setAttribute('role','status');let saving=false;
   async function save(status,keepCard=false){
    if(saving)return;saving=true;for(const b of row.children)b.disabled=true;note.textContent='Saving privately…';
    try{
     const result=await client.from('readmalawi_community_ideas').update({status,response:reply.value.trim()}).eq('id',idea.id).select('id').abortSignal(AbortSignal.timeout(15000));
     if(result.error||!result.data?.length)throw Error();
     if(keepCard)note.textContent='Private note saved. Nothing has been published.';
     else{card.remove();$('review-status').textContent='Feedback updated privately. Refresh to update the list and count.'}
    }catch{note.textContent='Could not confirm the save. Your note is still here. Refresh to check the stored version before retrying; remove links or contact details if present.'}
    finally{saving=false;for(const b of row.children)b.disabled=false}
   }
   const saveNote=element('button','Save private note');saveNote.type='button';saveNote.addEventListener('click',()=>save(idea.status,true));row.append(saveNote);
   for(const [status,name] of [['approved','Mark reviewed'],['declined','Close feedback'],['pending','Return to queue']]){
    if(status===idea.status)continue;const btn=element('button',name);btn.type='button';btn.addEventListener('click',()=>save(status));row.append(btn);
   }
   card.append(row,note);$('review-list').append(card);
  }
 }catch{$('review-status').textContent='Could not load private feedback. Use Refresh to retry. Previously loaded feedback, if any, remains below.'}
 finally{loading=false;$('review-refresh').disabled=false;$('review-filter').disabled=false}
}
$('review-filter').addEventListener('change',load);$('review-refresh').addEventListener('click',load);
try{
 const mod=await getSupabaseModule();client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);const current=await client.auth.getUser();const user=current.data?.user;
 if(!user)$('review-status').textContent='Sign in on the library page with your librarian account, then return here.';
 else{
  const check=await client.from('readmalawi_admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(check.error||!check.data)$('review-status').textContent='This account does not have administrator access.';
  else{admin=true;$('review-tools').hidden=false;await load()}
 }
}catch{$('review-status').textContent='Could not check access. Please refresh.'}
