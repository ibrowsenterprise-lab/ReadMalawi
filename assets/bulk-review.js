// ReadMalawi: opt-in, audited batch publication. No automatic approvals.
import { getSupabaseModule } from "./supabase-loader.js";
const $=id=>document.getElementById(id);
const cfg=window.READMALAWI_CONFIG||{};
const PAGE_SIZE=50;
let client=null,admin=null,rows=[],page=0,total=0,busy=false;
let selected=new Set();

const restrictedTitle=title=>{
  const t=String(title||"").trim().toLowerCase();
  return t==="profile"||t.includes("readmalawi test")||
   /(vacanc(y|ies)|job advertis|company profile|government of malawi|malawi government|gazette|request for quotation|request for proposals|tender notice|invoice)/i.test(t);
};
const create=(tag,cls,value)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(value!==undefined)node.textContent=value;
  return node;
};
function status(message,error=false){
 const node=$("bulk-review-status");node.textContent=message;
 node.className=error?"status error":"status good";
}
function eligibility(row){return row.status==="pending"&&!row.verified_rights&&!restrictedTitle(row.title)}
function eligible(){return rows.filter(eligibility)}
function updateButtons(){
 const e=eligible();
 const n=e.filter(item=>selected.has(item.id)).length;
 $("bulk-review-selection").textContent=n+" selected on this page · "+e.length+
  " can be selected here · "+Math.max(0,rows.length-e.length)+" test/excluded record(s) require individual review.";
 $("bulk-review-select-all").disabled=busy||!admin||e.length===0;
 $("bulk-review-clear").disabled=busy||selected.size===0;
 $("bulk-review-selected").disabled=busy||n===0;
 $("bulk-review-all").disabled=busy||e.length===0;
 $("bulk-review-prev").disabled=busy||page===0;
 $("bulk-review-next").disabled=busy||(page+1)*PAGE_SIZE>=total;
 for(const id of ["bulk-review-rights","bulk-review-evidence","bulk-review-confirm"]){
  $(id).disabled=busy;
 }
}
function render(){
 const container=$("bulk-review-list");container.replaceChildren();
 if(!rows.length){container.append(create("p","hint","No pending books on this page."));}
 for(const book of rows){
  const allowed=eligibility(book),line=create("label","bulk-book-row");
  const check=document.createElement("input");
  check.type="checkbox";check.disabled=!allowed||busy;check.checked=selected.has(book.id);
  check.addEventListener("change",()=>{
   if(check.checked)selected.add(book.id);else selected.delete(book.id);
   updateButtons();
  });
  const info=create("span","bulk-book-info");
  info.append(create("strong","",book.title||"Untitled book"));
  const text=[book.author||"Unknown author",book.category||"Other",book.origin||"Unspecified"].join(" · ");
  info.append(create("small","hint",text+(allowed?" · Permission must be verified":
    " · BULK PUBLISHING BLOCKED: review separately")));
  line.append(check,info);
  container.append(line);
 }
 $("bulk-review-page").textContent=total?("Showing "+(page*PAGE_SIZE+1)+"–"+(page*PAGE_SIZE+rows.length)+" of "+total+" pending submissions"):
  "No pending submissions.";
 updateButtons();
}
async function load(){
 if(!admin||busy)return;
 status("Loading pending books for private selection…");
 const from=page*PAGE_SIZE;
 const result=await client.from("library_books")
   .select("id,title,author,category,origin,status,verified_rights,submitted_at",{count:"exact"})
   .eq("status","pending").order("submitted_at",{ascending:false})
   .range(from,from+PAGE_SIZE-1);
 if(result.error){status("Cannot load pending list: "+result.error.message,true);return}
 total=result.count??0;rows=result.data||[];
 if(!rows.length&&page>0){page=0;return load()}
 selected=new Set();
 render();
 status("Select reviewed titles, choose ONE shared permission basis, and provide specific evidence. No book publishes until final confirmation.");
}
async function initialize(){
 if(!cfg.supabaseUrl||!(cfg.supabasePublishableKey||cfg.supabaseAnonKey)){
  $("bulk-review-auth").textContent="Supabase public configuration unavailable.";
  return;
 }
 try{
  const lib=await getSupabaseModule();
  client=lib.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey||cfg.supabaseAnonKey);
  const result=await client.auth.getUser();
  if(result.error)throw result.error;
  const user=result.data?.user;
  if(!user){$("bulk-review-auth").textContent="Sign in on the library first.";return}
  const access=await client.from("readmalawi_admins").select("user_id").eq("user_id",user.id).maybeSingle();
  if(access.error)throw access.error;
  if(!access.data){$("bulk-review-auth").textContent="Bulk publication is available only to authorised librarians.";return}
  admin=user;
  $("bulk-review-auth").textContent="Authorised librarian · "+user.email+
    " · Publishing creates a private audit record of each approval.";
  $("bulk-review-panel").hidden=false;
  $("bulk-review-controls").hidden=false;
  await load();
 }catch(e){$("bulk-review-auth").textContent="Could not verify librarian sign-in: "+e.message}
}
async function publish(allOnPage){
 if(!admin||busy)return;
 const selectedRows=(allOnPage?eligible():eligible().filter(row=>selected.has(row.id)));
 const rights=$("bulk-review-rights").value,evidence=$("bulk-review-evidence").value.trim();
 if(!selectedRows.length){status("There are no selected eligible books to publish.",true);return}
 if(!["original_creator","authorised","open_licence","public_domain"].includes(rights)){
  status("Choose the verified permission category that applies to every selected book.",true);return;
 }
 if(evidence.length<20||evidence.length>500){
  status("Enter a specific evidence URL or permission-reference description (20–500 characters). It must apply to every selected book.",true);return;
 }
 if(!$("bulk-review-confirm").checked){
  status("Tick the confirmation only after checking rights for EACH selected work.",true);return;
 }
 const titles=selectedRows.map(r=>r.title);
 const preview=titles.slice(0,12).map((t,i)=>(i+1)+". "+t).join("\n");
 const suffix=titles.length>12?"\n… and "+(titles.length-12)+" more.":"";
 const phrase="PUBLISH "+selectedRows.length;
 const typed=prompt(
  "READMALAWI — PUBLIC RELEASE\n\n"+
  "These "+selectedRows.length+" PRIVATE PDFs will become PUBLIC and readable immediately:\n\n"+
  preview+suffix+"\n\n"+
  "Rights basis: "+$("bulk-review-rights").selectedOptions[0]?.textContent+
  "\nEvidence: "+evidence+
  "\n\nConfirm you have checked permission for EVERY listed book.\n"+
  "Type exactly "+phrase+" to proceed."
 );
 if(typed!==phrase){status("Bulk publication cancelled. No books were changed.");return}
 busy=true;render();updateButtons();
 status("Submitting this exact "+selectedRows.length+"-book batch to the secure librarian approval service…");
 try{
  const result=await client.rpc("readmalawi_publish_book_batch",{
   p_book_ids:selectedRows.map(row=>row.id),
   p_rights_basis:rights,
   p_evidence_reference:evidence,
   p_rights_confirmed:true
  });
  if(result.error)throw result.error;
  const n=Number(result.data);
  if(n!==selectedRows.length)throw Error("Unexpected published count; refresh and inspect before trying again.");
  status("Published "+n+" books successfully. The librarian rights-evidence audit was recorded.");
  $("bulk-review-confirm").checked=false;
  $("bulk-review-rights").value="";
  $("bulk-review-evidence").value="";
  // Refresh both the new selection view and the existing Book Review Desk.
  busy=false;
  await load();
  $("refresh")?.click();
 }catch(error){
  busy=false;
  status("No bulk success confirmed. "+(error?.message||"Unknown error")+". Refresh the list to inspect actual statuses before retrying.",true);
  render();
 }finally{busy=false;updateButtons()}
}
$("bulk-review-select-all").addEventListener("click",()=>{
 selected=new Set(eligible().map(row=>row.id));render();
 status("Selected every non-test pending book on this page. Publication still needs rights evidence and confirmation.");
});
$("bulk-review-clear").addEventListener("click",()=>{selected.clear();render()});
$("bulk-review-selected").addEventListener("click",()=>publish(false));
$("bulk-review-all").addEventListener("click",()=>publish(true));
$("bulk-review-prev").addEventListener("click",()=>{if(page>0){page--;load()}});
$("bulk-review-next").addEventListener("click",()=>{if((page+1)*PAGE_SIZE<total){page++;load()}});
$("bulk-review-refresh").addEventListener("click",()=>{page=0;load()});
initialize();
