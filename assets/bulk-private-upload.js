// ReadMalawi bulk PDF intake. Opt-in only; never publish from this page.
import { getBulkUploadCandidates } from "./bulk-import.js?v=20261011-private-bulk";
import { getSupabaseModule } from "./supabase-loader.js";

const $=id=>document.getElementById(id);
const cfg=window.READMALAWI_CONFIG||{};
let client=null,authorised=false,user=null,running=false,pauseRequested=false;
const completed=new Set(),report=[];
const identities=file=>[file.webkitRelativePath||file.name,file.size,file.lastModified].join(":");
function say(message){$("bulk-upload-status").textContent=message}
function setAuth(message){$("bulk-auth-status").textContent=message}
function files(){return getBulkUploadCandidates()}
function validFile(file){return /\.pdf$/i.test(file.name)&&file.size>0&&file.size<=50*1024*1024}
function refreshButtons(){
 const selectable=files().some(x=>!completed.has(identities(x.file)));
 $("bulk-upload-start").disabled=running||!authorised||!user||!client||!$("bulk-agree").checked||!selectable;
 $("bulk-upload-stop").disabled=!running;
 $("bulk-upload-report").disabled=!report.length;
 $("bulk-refresh-auth").disabled=running;
}
function selectedSummary(){
 refreshButtons();
 if(!running){
  const all=files(),remaining=all.filter(x=>!completed.has(identities(x.file)));
  const mb=all.reduce((n,x)=>n+x.file.size,0)/(1024*1024);
  say(all.length?all.length+" PDFs selected ("+mb.toFixed(1)+" MB). "+remaining.length+
    " await a batch attempt. Upload requires an authorised librarian and explicit confirmation.":
    "Select multiple PDFs or a folder above. Scanning is optional; no upload happens until you press the private upload button.");
 }
}
async function auth(){
 if(running)return;
 authorised=false;user=null;refreshButtons();
 if(!cfg.supabaseUrl||!(cfg.supabasePublishableKey||cfg.supabaseAnonKey)){
  setAuth("Private library sign-in is not configured. Do not upload files.");
  return;
 }
 setAuth("Checking your existing ReadMalawi librarian session…");
 try{
  const module=await getSupabaseModule();
  if(!client)client=module.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey||cfg.supabaseAnonKey);
  const result=await Promise.race([
   client.auth.getUser(),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error("Sign-in check timed out")),12000))
  ]);
  if(result.error)throw result.error;
  const candidate=result.data?.user||null;
  if(!candidate){setAuth("Not signed in. Use the ReadMalawi sign-in link above, then return and choose Refresh sign-in status.");return}
  const check=await client.from("readmalawi_admins").select("user_id").eq("user_id",candidate.id).maybeSingle();
  if(check.error)throw check.error;
  if(!check.data){
   setAuth("Signed in, but bulk intake is currently reserved for ReadMalawi librarians. Use the normal Donate books form for individual submissions.");
   return;
  }
  authorised=true;user=candidate;
  setAuth("Authorised librarian signed in: "+candidate.email+". Bulk files will stay PRIVATE and PENDING.");
 }catch(e){
  setAuth("Cannot confirm librarian access: "+(e.message||"network error")+". Sign in on ReadMalawi or try Chrome, then refresh.");
 }finally{refreshButtons()}
}
function csvCell(value){
 let s=String(value??"");
 if(/^[=+@\-\t\r]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
function exportReport(){
 if(!report.length)return;
 const columns=["file_name","file_size_bytes","result","details","book_id"];
 const csv="\uFEFF"+columns.join(",")+"\r\n"+report.map(x=>columns.map(k=>csvCell(x[k])).join(",")).join("\r\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="readmalawi-private-bulk-upload-"+new Date().toISOString().slice(0,10)+".csv";
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function prepareRow(item,path){
 const row=item.meta||{},file=item.file;
 const cleanedName=file.name.replace(/\.pdf$/i,"").replace(/[_]+/g," ").replace(/\s+/g," ").trim();
 const text=(s,max,fallback)=>String(s||fallback).trim().slice(0,max)||fallback;
 const categories=["Other","Children","Education","Fiction","History","Science","Biography","Poetry","Religion","Technology","Language"];
 return {
  uploaded_by:user.id,
  title:text(row.title,240,cleanedName||"Untitled book"),
  author:text(row.author,180,"Unknown"),
  category:categories.includes(row.category)?row.category:"Other",
  language:text(row.language,80,"Unconfirmed"),
  media_type:"ebook",mime_type:"application/pdf",origin:"Unspecified",
  access_mode:"online_only",rights_basis:"unknown",rights_url:null,attested_rights:false,
  file_path:path,description:""
 };
}
async function getBookAt(path){
 const res=await client.from("library_books").select("id,status").eq("file_path",path).eq("uploaded_by",user.id).maybeSingle();
 if(res.error)throw res.error;
 return res.data;
}
async function handleOne(item){
 const file=item.file;
 if(!validFile(file))return {result:"failed",details:"Unsupported, empty or over 50 MB"};
 if(!crypto?.subtle)throw Error("Secure file hashing unavailable. Open ReadMalawi over HTTPS.");
 const digest=await crypto.subtle.digest("SHA-256",await file.arrayBuffer());
 const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,"0")).join("");
 const path=user.id+"/bulk/v1/"+hash+".pdf";
 const found=await getBookAt(path);
 if(found)return {result:"duplicate",details:"Already submitted for "+found.status+" review",book_id:found.id};
 const stored=await client.storage.from("readmalawi-library")
  .upload(path,file,{contentType:"application/pdf",upsert:false});
 if(stored.error){
  const m=String(stored.error.message||"");
  const conflict=Number(stored.error.statusCode)===409||Number(stored.error.status)===409||/already exists|duplicate|resource already exists/i.test(m);
  if(!conflict)throw stored.error;
  // An earlier interrupted attempt may have uploaded this blob but not its private metadata.
 }
 const inserted=await client.from("library_books").insert(prepareRow(item,path)).select("id,status").single();
 if(inserted.error){
  // A simultaneous batch might have created the same catalogue record.
  const existing=await getBookAt(path).catch(()=>null);
  if(existing)return {result:"duplicate",details:"Previously submitted for "+existing.status+" review",book_id:existing.id};
  throw Error("Private file stored but the catalogue entry failed: "+inserted.error.message+"; re-select and retry to recover the entry");
 }
 if(inserted.data?.status!=="pending")throw Error("Unexpected publication status; stop this batch and contact the librarian.");
 return {result:"pending",details:"Saved privately; librarian approval required",book_id:inserted.data.id};
}
async function upload(){
 if(running||!authorised||!user||!client||!$("bulk-agree").checked)return;
 const queue=files().filter(item=>!completed.has(identities(item.file)));
 if(!queue.length){say("There are no unprocessed selected PDFs.");return}
 if(!confirm("Send "+queue.length+" selected PDF(s) to PRIVATE ReadMalawi storage for librarian review? No files will become public through this upload."))return;
 running=true;pauseRequested=false;refreshButtons();
 const progress=$("bulk-upload-progress");progress.hidden=false;progress.max=queue.length;progress.value=0;
 let saved=0,duplicates=0,failed=0;
 for(const [i,item] of queue.entries()){
  if(pauseRequested)break;
  say("Private bulk transfer: "+(i+1)+"/"+queue.length+" — "+item.file.name+"\n"+
      saved+" submitted · "+duplicates+" duplicates · "+failed+" failed. Keep this tab open.");
  let result;
  try{result=await handleOne(item)}
  catch(error){result={result:"failed",details:(error?.message||"Upload error").slice(0,350)}}
  report.push({file_name:item.file.name,file_size_bytes:item.file.size,result:result.result,details:result.details,book_id:result.book_id||""});
  if(result.result==="pending"){saved++;completed.add(identities(item.file))}
  else if(result.result==="duplicate"){duplicates++;completed.add(identities(item.file))}
  else failed++;
  progress.value=i+1;
  refreshButtons();
  await new Promise(resolve=>setTimeout(resolve,0));
 }
 running=false;refreshButtons();
 const unfinished=files().filter(item=>!completed.has(identities(item.file))).length;
 say((pauseRequested?"Paused safely. ":"Batch attempt finished. ")+
  saved+" newly pending, "+duplicates+" previously submitted, "+failed+" failed. "+
  unfinished+" selected file(s) can be retried. "+
  "Download the batch report. Never approve files without confirming distribution rights.");
}
$("files").addEventListener("change",selectedSummary);
$("folder").addEventListener("change",selectedSummary);
$("bulk-agree").addEventListener("change",refreshButtons);
$("bulk-refresh-auth").addEventListener("click",auth);
$("bulk-upload-start").addEventListener("click",upload);
$("bulk-upload-stop").addEventListener("click",()=>{pauseRequested=true;say("Pausing after the current file is processed…")});
$("bulk-upload-report").addEventListener("click",exportReport);
auth();
