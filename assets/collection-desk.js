import {getSupabaseModule} from "./supabase-loader.js";
import {showDownloadPanel} from "./download-panel.js?v=20261013-readable-preview";
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
// Rule-based local TEST plan. Reuses an existing row; stores no donor identity/contact data.
export function makeTestCollectionPlan(offer){
 const count=Number(offer?.book_count);
 const area=String(offer?.general_area||"").replace(/[\r\n\t]/g," ").slice(0,95);
 const valid=Number.isInteger(count)&&count>=1&&count<=50000&&area.length>=2;
 if(!valid)return "TEST plan unavailable: check the book count and general area.";
 return [
  "READMALAWI | PHYSICAL BOOK COORDINATION WORKSHEET",
  "PRELAUNCH TEST ONLY — NOT A COLLECTION ORDER, RECEIPT OR DISTRIBUTION RECORD",
  "No pickup, donation or school/prison handover has been confirmed.",
  "",
  "TEST OFFER",
  "Approximate books offered: "+count,
  "General town/area: "+area,
  "Current test stage: "+String(labels[offer.stage]||"Offer noted · TEST"),
  "",
  "01 — CONTACT AND CONSENT (PLANNING ONLY)",
  "[ ] Confirm a coordinator is authorised before any real donor follow-up.",
  "[ ] Do not copy WhatsApp contact details, donor names or private addresses into this plan.",
  "[ ] For a future live programme, discuss consent privately with the donor.",
  "",
  "02 — POSSIBLE COLLECTION LOGISTICS (NOT SCHEDULED)",
  "[ ] Check whether ReadMalawi has approved collectors and transport availability.",
  "[ ] Review a sensible route and storage plan for the general area.",
  "[ ] Do not promise a vehicle, collection date or free transport in testing mode.",
  "",
  "03 — SORTING / INVENTORY (FUTURE PROGRAMME)",
  "[ ] When legally operational, count actual books received separately from offered books.",
  "[ ] Check condition, mould/water damage, readability and age suitability.",
  "[ ] Prepare an independently verified real receipt and storage record.",
  "",
  "04 — POSSIBLE INSTITUTIONAL HANDOVER (NO COMMITMENT)",
  "[ ] Ask schools about the reading levels and languages they need.",
  "[ ] Obtain approval from prison authorities before any prison delivery.",
  "[ ] Document a genuine handover only after recipient acknowledgement.",
  "",
  "COORDINATOR REVIEW",
  "[ ] Safeguarding/privacy rules and programme operating status confirmed.",
  "[ ] Collection vehicle, volunteers, route and budget approved.",
  "[ ] Recipient institution and lawful permissions verified.",
  "Coordinator decision: NOT AUTHORISED — PRELAUNCH TEST",
  "Books actually collected: 0 VERIFIED THROUGH THIS TEST WORKSHEET",
  "Books actually distributed: 0 VERIFIED THROUGH THIS TEST WORKSHEET",
  "",
  "READMALAWI · TIYENI TIWELENGE · PRIVATE INTERNAL TEST"
 ].join("\n")+"\n";
}
function downloadLocalText(filename,content){
 const url=URL.createObjectURL(new Blob([content],{type:"text/plain;charset=utf-8"}));
 const link=document.createElement("a");link.href=url;link.download=filename;
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),15000);
}

export function exportRows(rows){
 const escaped=x=>{
  let value=String(x??"");
  // Quoting alone does not stop spreadsheet formula execution.
  if(/^[\s]*[=+@\-]/.test(value))value="'"+value;
  return '"'+value.replace(/"/g,'""')+'"';
 };
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
   const nextStage=stage.value;
   const nextNote=note.value.trim();
   const previousTimestamp=record.updated_at;
   button.disabled=true;sayFor(feedback,"Saving TEST follow-up…");
   try{
    // Reject conflicting browser tabs instead of silently overwriting newer notes.
    let query=api.from("readmalawi_physical_book_offers")
      .update({stage:nextStage,internal_note:nextNote,updated_at:new Date().toISOString()})
      .eq("id",record.id);
    if(previousTimestamp)query=query.eq("updated_at",previousTimestamp);
    const {data,error}=await query.select("id,stage,internal_note,updated_at").maybeSingle();
    if(error)throw error;
    if(!data)throw new Error("No matching row was saved. It may have changed in another tab; tap Refresh offers.");
    Object.assign(record,data);
    sayFor(feedback,"✓ TEST follow-up saved and verified. Stage: "+(labels[record.stage]||"TEST")+".");
    metrics();
    // Keep the selected filter consistent after changing a stage.
    const selectedFilter=$("stage-filter").value;
    if(selectedFilter!=="all"&&record.stage!==selectedFilter){
      display();
      say("desk-status","TEST follow-up saved. The updated offer is now outside the selected filter; choose All TEST offers to view it.");
    }else{
      say("desk-status","✓ TEST follow-up saved. No pickup or donation was recorded.");
    }
   }catch(e){sayFor(feedback,"Save failed: "+e.message,true)}
   finally{button.disabled=false}
  });
  const planButton=node("button","btn secondary","Prepare TEST collection plan");
  planButton.type="button";
  const planArea=node("div","plan-workspace");
  planArea.hidden=true;
  const previewLabel=node("label","field","Private editable TEST worksheet (local to this browser)");
  const preview=document.createElement("textarea");
  preview.rows=14;preview.className="plan-editor";preview.maxLength=12000;
  previewLabel.append(preview);
  const planNote=node("p","muted","Do not insert personal contacts or addresses. This text is not saved to the database or sent to WhatsApp.");
  const planActions=node("div","actions");
  const downloadPlan=node("button","btn secondary","Download TEST plan (.txt)");
  downloadPlan.type="button";
  const closePlan=node("button","btn secondary","Close plan");
  closePlan.type="button";
  const planStatus=node("p","feedback","");
  planStatus.setAttribute("role","status");planStatus.setAttribute("aria-live","polite");
  planButton.addEventListener("click",()=>{
   if(!planArea.hidden){planArea.hidden=true;planButton.textContent="Prepare TEST collection plan";return}
   if(preview.value.trim()==="")preview.value=makeTestCollectionPlan(record);
   planArea.hidden=false;
   planButton.textContent="Hide TEST collection plan";
  });
  downloadPlan.addEventListener("click",()=>{
   const content=preview.value.trim();
   if(!content){sayFor(planStatus,"Nothing to download. Prepare a plan first.",true);return}
   const guarded="READMALAWI TEST ONLY — NO COLLECTION OR DISTRIBUTION AUTHORISED\n"+
    "Do not use as a receipt, delivery note or pickup order.\n\n"+content+
    "\n\nEND OF READMALAWI PRIVATE TEST DOCUMENT.\n";
   const filename="ReadMalawi_TEST_Physical_Book_Plan.txt";
   const request=()=>downloadLocalText(filename,guarded);
   request();
   showDownloadPanel({filename,content:guarded,onDownload:request,trigger:downloadPlan});
   sayFor(planStatus,"Download requested. Use the file preview panel to inspect it. No WhatsApp message or database update occurred.");
  });
  closePlan.addEventListener("click",()=>{planArea.hidden=true;planButton.textContent="Prepare TEST collection plan";planButton.focus()});
  planActions.append(downloadPlan,closePlan);
  planArea.append(previewLabel,planNote,planActions,planStatus);
  card.append(control,noteControl,button,feedback,planButton,planArea);
  list.append(card);
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
 if(!authorised)return;
 const csv=exportRows(offers);
 const filename="ReadMalawi_TEST_Physical_Offers.csv";
 const request=()=>{
   const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
   const a=document.createElement("a");a.href=url;a.download=filename;
   document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),15000);
 };
 request();
 showDownloadPanel({filename,content:csv,onDownload:request,trigger:$("export-offers")});
 say("desk-status","TEST summary download requested. Review in the popup; account IDs and internal notes are excluded.");
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
  $("sample-plan").addEventListener("click",()=>{
   const label=$("sample-preview-label");
   const isOpening=label.hidden;
   label.hidden=!isOpening;
   $("sample-plan").textContent=isOpening?"Hide DEMO collection plan":"Preview DEMO collection plan · 1 tap";
   if(isOpening){
    $("sample-preview").value=makeTestCollectionPlan({book_count:15,general_area:"Lilongwe",stage:"offered_test"});
   }
  });
  $("offer-form").addEventListener("submit",submit);
  $("refresh-offers").addEventListener("click",reload);
  $("stage-filter").addEventListener("change",display);
  $("export-offers").addEventListener("click",download);
  await reload();
 }catch(e){say("desk-status","Unable to check librarian access: "+e.message,true)}
}
init();