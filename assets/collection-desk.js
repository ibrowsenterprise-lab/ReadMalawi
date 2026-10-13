import {getSupabaseModule} from "./supabase-loader.js";
// Authenticated ReadMalawi librarian TEST coordination. Never a proof of donated books.
const cfg=window.READMALAWI_CONFIG||{}, $=id=>document.getElementById(id);
const labels={offered_test:"Offer noted · TEST",followup_test:"For follow-up · TEST",potential_pickup_test:"Potential collection planning · TEST",closed_test:"Closed without collection · TEST"};
let api=null,authorised=false,offers=[];
const node=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e};
const say=(id,message,bad=false)=>{const e=$(id);if(e){e.textContent=message;e.className=bad?"feedback error":"feedback success"}};
export function validateOffer(raw,location){
 const v=String(raw??"").trim(),n=Number(v),area=String(location||"").replace(/\s+/g," ").trim();
 if(!/^[0-9]+$/.test(v)||!Number.isSafeInteger(n)||n<1||n>50000)return {valid:false,error:"Enter a whole number from 1 to 50,000."};
 if(area.length<2||area.length>95)return {valid:false,error:"Enter a general town/area (2–95 characters), without a street address."};
 return {valid:true,book_count:n,general_area:area};
}
export function summarize(rows){
 const items=Array.isArray(rows)?rows:[];
 return {number:items.length,potentialBooks:items.reduce((s,x)=>s+(Number(x.book_count)||0),0),
 followups:items.filter(x=>x.stage==="followup_test").length,
 plans:items.filter(x=>x.stage==="potential_pickup_test").length};
}
export function exportRows(rows){
 const escaped=x=>'"'+String(x??"").replace(/"/g,'""')+'"';
 return ["test_stage,offered_books,general_area,created_at",
 ...(Array.isArray(rows)?rows:[]).map(x=>[x.stage,x.book_count,x.general_area,x.created_at].map(escaped).join(","))].join("\r\n")+"\r\n";
}
function metrics(){
 const m=summarize(offers);
 $("total-offers").textContent=m.number;
 $("total-books").textContent=m.potentialBooks.toLocaleString("en-MW");
 $("total-followups").textContent=m.followups;
 $("total-plans").textContent=m.plans;
}
function display(){
 metrics();
 const list=$("offer-list");list.replaceChildren();
 const filter=$("stage-filter").value,shown=offers.filter(x=>filter==="all"||x.stage===filter);
 $("offer-count").textContent=shown.length+" of "+offers.length+" private TEST offers";
 if(!shown.length){
  list.append(node("p","muted",offers.length?"No offers match the filter.":"No test offers logged. No physical collections or school/prison distributions have taken place."));
  return;
 }
 for(const record of shown){
  const card=node("article","record");
  card.append(node("h3","",record.book_count+" books · "+record.general_area));
  const date=new Date(record.created_at);
  card.append(node("p","muted",(Number.isNaN(date.getTime())?"Date unavailable":date.toLocaleDateString("en-MW"))+" · TEST ONLY · Not collected"));
  const control=node("label","field","Follow-up stage");
  const stage=document.createElement("select");
  for(const [key,label] of Object.entries(labels)){const option=document.createElement("option");option.value=key;option.textContent=label;stage.append(option)}
  stage.value=record.stage;control.append(stage);
  const noteControl=node("label","field","Internal planning note (optional)");
  const note=document.createElement("textarea");note.maxLength=800;note.rows=3;
  note.placeholder="No donor names, phone numbers or full addresses. Only a short logistics reminder.";
  note.value=record.internal_note||"";noteControl.append(note);
  const button=node("button","btn","Save TEST follow-up");button.type="button";
  const feedback=node("p","feedback","");feedback.setAttribute("aria-live","polite");
  const mark=()=>{feedback.textContent="Unsaved changes";feedback.className="feedback pending"};
  stage.addEventListener("change",mark);note.addEventListener("input",mark);
  button.addEventListener("click",async()=>{
   if(!authorised)return;
   button.disabled=true;sayFor(feedback,"Saving…");
   try{
    const {data,error}=await api.from("readmalawi_physical_book_offers").update({
      stage:stage.value,internal_note:note.value.trim(),updated_at:new Date().toISOString()
    }).eq("id",record.id).select("id,stage,internal_note,updated_at").maybeSingle();
    if(error)throw error;
    if(!data)throw new Error("No matching authorised record was updated.");
    Object.assign(record,data);sayFor(feedback,"✓ TEST follow-up saved and verified.");metrics();
   }catch(e){sayFor(feedback,"Save failed: "+e.message,true)}finally{button.disabled=false}
  });
  card.append(control,noteControl,button,feedback);list.append(card);
 }
}
function sayFor(el,message,bad=false){el.textContent=message;el.className=bad?"feedback error":"feedback success"}
async function reload(){
 if(!authorised)return;
 $("refresh-offers").disabled=true;say("desk-status","Loading private test offers…");
 try{
  const {data,error}=await api.from("readmalawi_physical_book_offers")
   .select("id,book_count,general_area,stage,internal_note,is_test,created_at,updated_at")
   .order("created_at",{ascending:false}).limit(200);
  if(error)throw error;
  offers=data||[];display();
  say("desk-status","TEST register loaded. These are proposed offers, not completed donations.");
 }catch(e){say("desk-status","Could not load TEST register: "+e.message,true)}
 finally{$("refresh-offers").disabled=false}
}
async function submit(event){
 event.preventDefault();if(!authorised)return;
 const result=validateOffer($("books").value,$("area").value);
 if(!result.valid){say("entry-feedback",result.error,true);return}
 $("save-offer").disabled=true;say("entry-feedback","Saving TEST offer…");
 try{
  const {data,error}=await api.from("readmalawi_physical_book_offers")
   .insert({book_count:result.book_count,general_area:result.general_area})
   .select("id,is_test,stage").single();
  if(error)throw error;
  if(data?.is_test!==true||data?.stage!=="offered_test")throw new Error("Test record flag could not be verified");
  $("offer-form").reset();say("entry-feedback","✓ TEST offer saved. No collection or donor contact was confirmed.");await reload();
 }catch(e){say("entry-feedback","Save failed: "+e.message,true)}
 finally{$("save-offer").disabled=false}
}
function download(){
 const csv=exportRows(offers);
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="ReadMalawi_TEST_Physical_Offers.csv";
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),15000);
 say("desk-status","TEST summary download requested; no personal contacts or internal notes included.");
}
async function init(){
 if(cfg.sitePhase!=="testing"){say("desk-status","TEST coordination register unavailable outside development mode.",true);return}
 try{
  if(!cfg.supabasePublishableKey||!cfg.supabaseUrl)throw new Error("Site configuration missing");
  const m=await getSupabaseModule();api=m.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
  const {data,error}=await api.auth.getUser();if(error)throw error;
  const person=data?.user;
  if(!person){say("desk-status","Sign in as an authorised ReadMalawi librarian to access this register.");return}
  const perm=await api.from("readmalawi_admins").select("user_id").eq("user_id",person.id).maybeSingle();
  if(perm.error||!perm.data){say("desk-status","Access restricted to authorised ReadMalawi librarians.",true);return}
  authorised=true;$("desk").hidden=false;
  $("offer-form").addEventListener("submit",submit);
  $("refresh-offers").addEventListener("click",reload);
  $("stage-filter").addEventListener("change",display);
  $("export-offers").addEventListener("click",download);
  await reload();
 }catch(e){say("desk-status","Unable to check librarian access: "+e.message,true)}
}
init();