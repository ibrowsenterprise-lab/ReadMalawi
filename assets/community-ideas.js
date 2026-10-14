import {getSupabaseModule} from './supabase-loader.js';
const $=id=>document.getElementById(id),cfg=window.READMALAWI_CONFIG||{};
const labels={books:'Books & authors',website:'Website improvements',learning:'Learning tools',community:'Reading community',other:'Other ideas'};
let client=null,offset=0,loading=false;
const text=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el};
$('idea-body').addEventListener('input',()=>{$('idea-count').textContent=$('idea-body').value.length+' / 1,200 characters'});
async function loadIdeas(reset=false){
 if(!client||loading)return;loading=true;$('idea-more').disabled=true;$('idea-retry').hidden=true;
 if(reset){offset=0;$('idea-list').replaceChildren()}
 try{
 const {data,error}=await client.from('readmalawi_community_ideas').select('id,category,body,response,created_at').eq('status','approved').order('created_at',{ascending:false}).range(offset,offset+9).abortSignal(AbortSignal.timeout(12000));
 if(error)throw error;
 if(!offset)$('idea-list').replaceChildren();
 if(!data.length&&!offset)$('idea-list').append(text('p','No shared ideas yet. Be the first to suggest an improvement.'));
 for(const idea of data){const card=document.createElement('article');card.className='idea-card';card.append(text('strong',labels[idea.category]||'Community idea'),text('p',idea.body));if(idea.response){const reply=text('p','ReadMalawi: '+idea.response);reply.className='reply';card.append(reply)}$('idea-list').append(card)}
 offset+=data.length;$('idea-more').hidden=data.length<10;
 }catch{if(!offset)$('idea-list').textContent='Shared ideas could not load. You can still submit your suggestion.';$('idea-retry').hidden=false}
 finally{loading=false;$('idea-more').disabled=false}
}
$('idea-more').addEventListener('click',()=>loadIdeas());$('idea-retry').addEventListener('click',()=>loadIdeas(true));
$('idea-form').addEventListener('submit',async event=>{
 event.preventDefault();if(!client||!$('idea-form').reportValidity())return;
 const body=$('idea-body').value.trim();
 if($('idea-website').value){$('idea-status').textContent='Thank you for your suggestion.';return}
 if(body.length<20||body.length>1200){$('idea-status').textContent='Please write between 20 and 1,200 characters.';return}
 if(/https?:\/\/|www\.|@|\+?\d[\d ()-]{8,}\d/i.test(body)){$('idea-status').textContent='Please remove links, email addresses and phone numbers.';return}
 $('idea-submit').disabled=true;$('idea-status').textContent='Sending your suggestion…';
 try{const {error}=await client.from('readmalawi_community_ideas').insert({category:$('idea-category').value,body,consent:$('idea-consent').checked});if(error)throw error;
 $('idea-form').reset();$('idea-count').textContent='0 / 1,200 characters';$('idea-status').textContent='Thank you! Your idea is saved privately for review. It will appear here only if approved.';
 }catch(error){$('idea-status').textContent=error.code==='23505'?'This idea has already been submitted. Thank you!':error.code==='P0001'?'Suggestions are busy. Please try again later.':'We could not save your suggestion. Your text is still here; please try again.'}
 finally{$('idea-submit').disabled=false}
});
try{const mod=await getSupabaseModule();client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);$('idea-submit').disabled=false;$('idea-status').textContent='Ready. New suggestions are private until reviewed.';await loadIdeas(true)}catch{$('idea-status').textContent='Suggestions could not connect. Please refresh to try again.';$('idea-list').textContent='Shared ideas are temporarily unavailable.'}
