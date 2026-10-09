const $=id=>document.getElementById(id);
const cfg=window.READMALAWI_CONFIG||{};
const bookCategories=["Other","Children","Education","Fiction","History","Science","Biography","Poetry","Religion","Technology","Language"];
const countries=["Unspecified","Malawian","International"];
const licenceOptions=[["unknown","Permission not established"],["original_creator","Original rights holder authorised publication"],["authorised","Permission granted by rights holder"],["open_licence","Verified open licence"],["public_domain","Verified public domain"]];
let client=null,user=null,admin=false;
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function field(label,current,options,onChange){
 const container=el("label","field");container.append(el("span","",label));
 const node=options?document.createElement("select"):document.createElement("input");
 if(options){for(const [value,name] of options){const option=document.createElement("option");option.value=value;option.textContent=name;node.append(option)}}
 else{node.value=current||"";node.maxLength=240}
 if(options)node.value=current||options[0][0];
 node.addEventListener("change",()=>onChange(node.value));node.addEventListener("input",()=>onChange(node.value));
 container.append(node);return {container,node};
}
function status(node,message,good=true){node.textContent=message;node.className="status "+(good?"good":"error")}
async function init(){
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){$("#auth-status").textContent="Library backend is not configured.";return}
 try{
  const mod=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
  const s=await client.auth.getUser();user=s.data?.user||null;
  if(!user){$("#auth-status").textContent="Please sign in on the library page, then return here.";return}
  const lookup=await client.from("readmalawi_admins").select("user_id").eq("user_id",user.id).maybeSingle();
  if(lookup.error||!lookup.data){$("#auth-status").textContent="Signed in, but this account does not have librarian permission.";return}
  admin=true;$("#auth-status").textContent="Signed in as "+user.email+" · Authorised librarian";
  $("#refresh").disabled=false;$("#moderation").classList.remove("hide");
  await load();
 }catch(e){$("#auth-status").textContent="Could not connect to the secure library: "+e.message}
}
async function load(){
 if(!admin)return;
 $("#summary").textContent="Loading private submissions…";
 const {data,error}=await client.from("library_books").select("id,title,author,description,category,language,origin,media_type,access_mode,file_path,status,submitted_at,verified_rights").eq("status","pending").order("submitted_at",{ascending:false}).limit(100);
 if(error){$("#summary").textContent="Cannot load reviews: "+error.message;return}
 $("#summary").textContent=(data||[]).length+" pending submission(s)"+((data||[]).length===100?" · Showing first 100":"");
 const out=$("#book-list");out.replaceChildren();
 if(!data?.length){out.append(el("p","hint","Nothing waiting right now. Thank you for reviewing contributions!"));return}
 for(const book of data)out.append(render(book));
}
function render(book){
 const card=el("article","book"),title=el("h3","",book.title||"Unlabelled book");card.append(title);
 card.append(el("p","meta",[book.media_type==="audiobook"?"🎧 Audiobook":"📖 E-book",new Date(book.submitted_at).toLocaleDateString(),book.origin].join(" · ")));
 const form=el("div","fields");
 let edit={title:book.title,author:book.author,category:book.category,language:book.language,origin:book.origin,access_mode:book.access_mode,rights_basis:"unknown",rights_url:""};
 const put=(name,label,current,opts)=>{const f=field(label,current,opts,value=>edit[name]=value);form.append(f.container);return f.node};
 put("title","Book title",edit.title);put("author","Author or rights holder",edit.author);
 put("category","Category",edit.category,bookCategories.map(x=>[x,x]));
 put("language","Language",edit.language);
 put("origin","Origin (review carefully)",edit.origin,countries.map(x=>[x,x]));
 put("access_mode","Reader access",edit.access_mode,[["online_only","Read or listen online only"],["download","Download eligibility (not enabled yet)"]]);
 put("rights_basis","Verified publication permission",edit.rights_basis,licenceOptions);
 put("rights_url","Evidence URL, if available",edit.rights_url);
 card.append(form);
 const agreed=el("label","check");const check=document.createElement("input");check.type="checkbox";
 agreed.append(check,el("span","","I personally checked that ReadMalawi is allowed to make this work publicly available. The contribution itself is not proof of permission."));
 card.append(agreed);
 const actions=el("div","row"),preview=el("button","btn secondary","Preview privately"),save=el("button","btn secondary","Save details"),approve=el("button","btn","Approve & publish"),reject=el("button","btn danger","Reject");
 for(const b of [preview,save,approve,reject])b.type="button";
 actions.style.marginTop="17px";actions.append(preview,save,approve,reject);card.append(actions);
 const note=el("div","status");note.setAttribute("role","status");card.append(note);
 const loading=(busy)=>{for(const b of [preview,save,approve,reject])b.disabled=busy};
 const values=()=>({title:edit.title.trim().slice(0,240)||"Untitled book",author:edit.author.trim().slice(0,180)||"Unknown",category:edit.category,language:edit.language.trim().slice(0,80)||"Unconfirmed",origin:edit.origin,access_mode:edit.access_mode,rights_basis:edit.rights_basis,rights_url:edit.rights_url.trim()||null});
 preview.addEventListener("click",async()=>{
  loading(true);
  try{const r=await client.storage.from("readmalawi-library").createSignedUrl(book.file_path,120);
   if(r.error)throw r.error;if(!r.data?.signedUrl)throw Error("Preview URL unavailable");
   window.open(r.data.signedUrl,"_blank","noopener,noreferrer");status(note,"Private preview link issued for 2 minutes.");
  }catch(e){status(note,"Preview failed: "+e.message,false)}finally{loading(false)}
 });
 save.addEventListener("click",async()=>{loading(true);try{
  const v=values();delete v.rights_basis;delete v.rights_url;
  const r=await client.from("library_books").update(v).eq("id",book.id);
  if(r.error)throw r.error;title.textContent=v.title;status(note,"Details saved. The file remains private and pending.");
 }catch(e){status(note,"Save failed: "+e.message,false)}finally{loading(false)}});
 approve.addEventListener("click",async()=>{
  if(edit.rights_basis==="unknown"||!check.checked){status(note,"Verify publication rights first, select a valid permission basis and tick the confirmation.",false);return}
  if(!confirm("Publish this book to the public ReadMalawi catalogue? You must have verified distribution rights."))return;
  loading(true);
  try{const v={...values(),status:"approved",verified_rights:true,reviewed_at:new Date().toISOString(),reviewer_id:user.id};
   const r=await client.from("library_books").update(v).eq("id",book.id);
   if(r.error)throw r.error;status(note,"Published successfully.");await load();
  }catch(e){status(note,"Approval failed: "+e.message,false)}finally{loading(false)}
 });
 reject.addEventListener("click",async()=>{if(!confirm("Reject this submission? The file will stay private."))return;loading(true);
  try{const r=await client.from("library_books").update({status:"rejected",verified_rights:false,reviewed_at:new Date().toISOString(),reviewer_id:user.id}).eq("id",book.id);
   if(r.error)throw r.error;await load();
  }catch(e){status(note,"Could not reject: "+e.message,false)}finally{loading(false)}
 });
 return card;
}
$("#refresh").addEventListener("click",load);
init();