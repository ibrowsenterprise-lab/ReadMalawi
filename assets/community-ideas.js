import {getSupabaseModule} from './supabase-loader.js';
const $=id=>document.getElementById(id),cfg=window.READMALAWI_CONFIG||{};
let client=null,sending=false;
$('idea-body').addEventListener('input',()=>{$('idea-count').textContent=$('idea-body').value.length+' / 1,200 characters'});
$('idea-form').addEventListener('submit',async event=>{
 event.preventDefault();if(!client||sending||!$('idea-form').reportValidity())return;
 const body=$('idea-body').value.trim();
 if($('idea-website').value){$('idea-status').textContent='Thank you for your feedback.';return}
 if(body.length<20||body.length>1200){$('idea-status').textContent='Please write between 20 and 1,200 characters.';return}
 if(/https?:\/\/|www\.|@|\+?\d[\d ()-]{8,}\d/i.test(body)){$('idea-status').textContent='Please remove links, email addresses and phone numbers.';return}
 if(!$('idea-consent').checked)return;
 sending=true;$('idea-submit').disabled=true;$('idea-status').textContent='Sending your private feedback…';
 try{
  const {error}=await client.from('readmalawi_community_ideas').insert({category:$('idea-category').value,body,consent:true}).abortSignal(AbortSignal.timeout(15000));
  if(error)throw error;
  $('idea-form').reset();$('idea-count').textContent='0 / 1,200 characters';$('idea-status').textContent='Thank you! Your feedback has been received privately for administrator review. It will not appear publicly.';
 }catch(error){$('idea-status').textContent=error.code==='23505'?'This feedback has already been submitted privately. Thank you!':error.code==='P0001'?'Feedback is busy. Please try again later.':'We could not confirm receipt. Your text is still here. Before resending, email info@readmalawi.fyi to check whether it arrived.'}
 finally{sending=false;$('idea-submit').disabled=false}
});
try{const mod=await getSupabaseModule();client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);$('idea-submit').disabled=false;$('idea-status').textContent='Ready. Feedback is private to administrators, including after review.'}catch{$('idea-status').textContent='Feedback could not connect. Please refresh, or email info@readmalawi.fyi.'}
