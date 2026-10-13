import {attachPilotPlanner} from "./pilot-planner.js?v=20261013-proposal1";
import {attachPilotCosting} from "./pilot-costing.js?v=20261013-proposal1";
import {attachInternalProposalBuilder} from "./proposal-builder.js?v=20261013-review-security2";
const $=id=>document.getElementById(id.startsWith("#")?id.slice(1):id);
const cfg=window.READMALAWI_CONFIG||{};
const statuses=["new","contacted","in_discussion","closed"];
const isTestRecord=x=>(x.message||"").startsWith("[READMALAWI TEST]")||(x.admin_notes||"").includes("[READMALAWI TEST]");
const siteIsTesting=cfg.sitePhase!=="production";
let client=null,user=null,allEnquiries=[],toastTimeout=null;
const TEST_LABEL="[READMALAWI TEST]";
function safeguardedNotes(value,record){
 const entered=String(value||"").trim().slice(0,4000);
 if(!siteIsTesting&&!isTestRecord(record))return entered;
 if(entered.includes(TEST_LABEL))return entered;
 return (TEST_LABEL+" Prelaunch test — no client contact, invoice or payment.\n"+entered).slice(0,4000);
}
function toast(text,error=false){
 const element=document.getElementById("save-toast");
 if(!element)return;
 element.textContent=text;
 element.className=error?"save-toast error":"save-toast";
 element.hidden=false;
 if(toastTimeout!==null)clearTimeout(toastTimeout);
 toastTimeout=setTimeout(()=>{element.hidden=true;toastTimeout=null},6500);
}
const h=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const status=message=>$("#status").textContent=message;
async function init(){
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){status("ReadMalawi configuration missing.");return}
 try{
 const mod=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
 client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
 const auth=await client.auth.getUser();user=auth.data?.user;
 if(!user){status("Sign in to the ReadMalawi library, then return here.");return}
 const permission=await client.from("readmalawi_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(permission.error||!permission.data){status("Only authorised ReadMalawi librarians can access partnership enquiries.");return}
 status("Authorised librarian: "+user.email);
 $("#refresh").disabled=false;$("#interest-filter").disabled=false;$("#status-filter").disabled=false;$("#record-filter").disabled=false;await load();
 }catch(e){status("Unable to open protected inbox: "+e.message)}
}
async function load(){
 $("#inbox").replaceChildren();
 const {data,error}=await client.from("readmalawi_partnership_enquiries").select("id,contact_name,contact_email,organisation,country,interest,message,status,created_at,admin_notes").order("created_at",{ascending:false}).limit(100);
 if(error){status("Could not load enquiries: "+error.message);return}
 allEnquiries=data||[];
 render();
}
function render(){
 const byInterest=$("#interest-filter").value;
 const byStatus=$("#status-filter").value;
 const byRecord=$("#record-filter").value;
 const filtered=allEnquiries.filter(x=>(byInterest==="all"||(byInterest==="other"?!["education_services","ai_services","author_services","sponsor"].includes(x.interest):x.interest===byInterest))&&(byStatus==="all"||x.status===byStatus)&&(byRecord==="all"||(byRecord==="test"?isTestRecord(x):!isTestRecord(x))));
 $("#inbox").replaceChildren();
 $("#filter-summary").textContent=filtered.length+" of "+allEnquiries.length+" private enquiries shown";
 status("Private enquiries: "+allEnquiries.length+" loaded · newest first");
 if(!filtered.length){$("#inbox").append(h("p","muted",allEnquiries.length?"No enquiries match these filters.":"No programme or partnership enquiries yet."));return}
 for(const x of filtered)$("#inbox").append(card(x));
}
function card(x){
 const root=h("article","item");
 root.append(h("h2","",x.contact_name+" · "+x.interest.replaceAll("_"," ")));
 if(siteIsTesting||isTestRecord(x))root.append(h("p","muted","TEST RECORD · Do not send real emails, quotes or invoices."));
 root.append(h("p","muted",[x.organisation,x.country,new Date(x.created_at).toLocaleDateString()].filter(Boolean).join(" · ")));
 const e=h("p");e.textContent="Email: ";const a=h(siteIsTesting||isTestRecord(x)?"span":"a","",x.contact_email);
 if(a.tagName==="A")a.href="mailto:"+encodeURIComponent(x.contact_email)+"?subject="+encodeURIComponent("ReadMalawi partnership enquiry");
 e.append(a);root.append(e);
 root.append(h("p","message",x.message));
 const state=h("select");
 for(const value of statuses){const option=document.createElement("option");option.value=value;option.textContent=value.replaceAll("_"," ");state.append(option)}state.value=x.status;
 const notes=h("textarea");notes.placeholder="Private follow-up notes";notes.value=x.admin_notes||"";
 const save=h("button","btn","Save follow-up");
 save.type="button";
 const msg=h("p","save-feedback","");
 msg.setAttribute("role","status");
 msg.setAttribute("aria-live","polite");
 const bar=h("div","actions");bar.append(state,save);
 const changed=()=>{msg.className="save-feedback pending";msg.textContent="Unsaved changes";};
 notes.addEventListener("input",changed);
 state.addEventListener("change",changed);
 save.addEventListener("click",async()=>{
  save.disabled=true;msg.className="save-feedback pending";msg.textContent="Saving changes…";
  const updatedNotes=safeguardedNotes(notes.value,x);
  try{
   const {data,error}=await client.from("readmalawi_partnership_enquiries")
    .update({status:state.value,admin_notes:updatedNotes})
    .eq("id",x.id)
    .select("id,status,admin_notes").maybeSingle();
   if(error)throw error;
   if(!data)throw new Error("No record was updated. Verify librarian access and retry.");
   x.status=data.status;
   x.admin_notes=data.admin_notes;
   notes.value=data.admin_notes;
   msg.className="save-feedback success";
   msg.textContent="✓ Saved successfully — status and private notes verified.";
   toast("Saved successfully. Test record updated.");
  }catch(err){
   msg.className="save-feedback error";
   msg.textContent="Save failed: "+(err?.message||"Please try again.");
   toast("Save failed. Check the message beside Save follow-up.",true);
  }finally{save.disabled=false}
 });
 root.append(notes,bar,msg);
 const scopeTool=attachPilotPlanner(root,x);
 const costingTool=attachPilotCosting(root,x);
 attachInternalProposalBuilder(root,x,{
  getDraft:()=>scopeTool?.getDraft?.()||"",
  getCostingSnapshot:()=>costingTool?.getCostingSnapshot?.()||{}
 });
 return root;
}
$("#refresh").addEventListener("click",load);
$("#interest-filter").addEventListener("change",render);
$("#status-filter").addEventListener("change",render);
$("#record-filter").addEventListener("change",render);
init();