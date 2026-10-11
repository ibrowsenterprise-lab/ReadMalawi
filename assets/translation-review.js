/* ReadMalawi private human-approval tracker: no public translation text or publication action. */
"use strict";
const $=id=>document.getElementById(id);
const cfg=window.READMALAWI_CONFIG||{};
let client=null,admin=false;
const statuses=[
  ["needs_reviewer","Needs a reviewer"],
  ["under_review","Being reviewed"],
  ["changes_needed","Corrections needed"],
  ["approved","Human reviewed — ready for separate publication"]
];
const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
function field(title,tag,value,limit){
  const box=e("label","field");box.append(e("span","",title));
  const input=e(tag);
  if(tag==="textarea"){input.rows=3;input.maxLength=limit||5000;}
  if(tag==="input"){input.type="text";input.maxLength=limit||140;}
  input.value=value||"";
  box.append(input);
  return {box,input};
}
function mark(txt,initial){
  const label=e("label"),input=e("input");input.type="checkbox";input.checked=!!initial;
  label.append(input,e("span","",txt));return {label,input};
}
async function init(){
  if(!cfg.supabaseUrl||!(cfg.supabasePublishableKey||cfg.supabaseAnonKey)){
    $("auth-status").textContent="Review database is not configured.";return;
  }
  try{
    const mod=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey||cfg.supabaseAnonKey);
    const auth=await client.auth.getUser(),user=auth.data?.user;
    if(!user){$("auth-status").textContent="Please sign in on the library page, then return here.";return;}
    const check=await client.from("readmalawi_admins").select("user_id").eq("user_id",user.id).maybeSingle();
    if(check.error||!check.data){$("auth-status").textContent="Signed in, but this account is not an authorised ReadMalawi librarian.";return;}
    admin=true;$("auth-status").textContent="Authorised librarian: "+user.email;
    $("review-workspace").classList.remove("hide");
    $("refresh").disabled=false;await load();
  }catch(err){$("auth-status").textContent="Unable to open private reviews: "+err.message;}
}
async function load(){
  if(!admin)return;
  $("summary").textContent="Loading the ten private review records…";
  $("review-list").replaceChildren();
  const {data,error}=await client.from("readmalawi_translation_reviews")
    .select("story_key,title_en,title_ny_draft,status,reviewer_name,reviewer_notes,meaning_checked,language_checked,quiz_checked,corrected_copy_received,review_date,updated_at")
    .order("title_en",{ascending:true});
  if(error){$("summary").textContent="Reviews could not be loaded: "+error.message;return;}
  const records=data||[];
  const done=records.filter(x=>x.status==="approved").length;
  const active=records.filter(x=>x.status==="under_review").length;
  $("summary").textContent=done+" of "+records.length+" human-approved · "+active+" being reviewed · "+(records.length-done)+" not yet approved. No translated pages have been published.";
  if(!records.length){$("review-list").append(e("p","muted","No review records available yet."));return;}
  for(const item of records)$("review-list").append(render(item));
}
function render(record){
  const root=e("article","panel");
  const top=e("div","story-header");
  const names=e("div");
  names.append(e("h2","",record.title_en));
  names.append(e("p","muted small","Suggested draft title: "+record.title_ny_draft));
  const current=e("span","pill",statuses.find(s=>s[0]===record.status)?.[1]||"Needs a reviewer");
  top.append(names,current);root.append(top);
  const details=e("details");
  const openTitle=e("summary","",record.status==="approved"?"View review record":"Review this story");
  details.append(openTitle);
  const form=e("form","fields");
  const person=field("Fluent reviewer name","input",record.reviewer_name,140);
  const status=e("label","field");status.append(e("span","","Review stage"));
  const select=e("select");
  statuses.forEach(([id,label])=>{const option=e("option","",label);option.value=id;select.append(option);});
  select.value=record.status;status.append(select);
  const notes=field("Corrections / comments (private)","textarea",record.reviewer_notes,5000);
  notes.box.classList.add("wide");
  form.append(person.box,status,notes.box);
  const checks=e("div","checks field wide");
  checks.append(e("strong","","Review checks — all required before approval"));
  const meaning=mark("English and Chichewa meaning checked",record.meaning_checked);
  const fluency=mark("Natural spelling, wording and age-appropriate language checked",record.language_checked);
  const quiz=mark("Story question and answer choices checked",record.quiz_checked);
  const copy=mark("Corrected Chichewa Word copy received and safely kept",record.corrected_copy_received);
  [meaning,fluency,quiz,copy].forEach(x=>checks.append(x.label));
  form.append(checks);
  const controls=e("div","field wide");
  const row=e("div");row.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap";
  const save=e("button","","Save review");save.type="submit";
  const feedback=e("span","feedback","");
  feedback.setAttribute("role","status");
  row.append(save,feedback);controls.append(row);
  controls.append(e("small","muted","Saving an approved status does not publish a translation. The final corrected Word document must be checked separately before a story page is created."));
  form.append(controls);
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!admin)return;
    const stage=select.value;
    const flags=[meaning.input.checked,fluency.input.checked,quiz.input.checked,copy.input.checked];
    const name=person.input.value.trim().slice(0,140);
    if(stage==="approved"){
      if(name.length<2||flags.some(x=>!x)){
        feedback.textContent="Approval requires a named fluent reviewer, all four checks and the corrected Word file.";return;
      }
      if(!confirm("Confirm the named fluent reviewer has checked the corrected Word text and quiz? This records approval only; it will NOT publish the translation."))return;
    }
    save.disabled=true;feedback.textContent="Saving…";
    const payload={
      status:stage,
      reviewer_name:name,
      reviewer_notes:notes.input.value.trim().slice(0,5000),
      meaning_checked:flags[0],
      language_checked:flags[1],
      quiz_checked:flags[2],
      corrected_copy_received:flags[3],
      review_date:stage==="approved"?new Date().toISOString().slice(0,10):null,
      updated_at:new Date().toISOString()
    };
    try{
      const {data,error}=await client.from("readmalawi_translation_reviews")
        .update(payload).eq("story_key",record.story_key).select("story_key,status").single();
      if(error)throw error;
      feedback.textContent="Review saved. Public English story unchanged.";
      current.textContent=statuses.find(s=>s[0]===data.status)?.[1]||data.status;
      if(stage==="approved")openTitle.textContent="View review record";
    }catch(err){feedback.textContent="Could not save: "+err.message;}
    finally{save.disabled=false;}
  });
  details.append(form);root.append(details);
  return root;
}
$("refresh").addEventListener("click",load);
init();
