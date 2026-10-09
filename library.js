const $=s=>document.querySelector(s);
const app={kind:"all",local:[],remote:[],client:null,user:null,requests:[],backend:false};
const cfg=window.READMALAWI_CONFIG||{};
const types={book:"E-book",audio:"Audiobook"};
const show=(id,text,good)=>{const el=$(id);el.textContent=text;el.className="status "+(good?"ok":"err")};
const langCode=code=>({en:"English",ny:"Chichewa",tum:"Chitumbuka",ya:"Chiyao",yao:"Chiyao",lom:"Chilomwe",seh:"Chisena",toi:"Chitonga",fr:"French",es:"Spanish",pt:"Portuguese",sw:"Swahili",ar:"Arabic",de:"German",hi:"Hindi",zh:"Chinese",ja:"Japanese",ko:"Korean",ru:"Russian",it:"Italian",nl:"Dutch",af:"Afrikaans",zu:"Zulu",xh:"Xhosa",sn:"Shona"}[String(code||"").toLowerCase().split("-")[0]]||String(code||"Unconfirmed"));
const categoryFrom=subjects=>{const a=(subjects||[]).join(" ").toLowerCase();if(/children|juvenile|fairy/.test(a))return"Children";if(/history|historical/.test(a))return"History";if(/science|chemistry|physics|biology/.test(a))return"Science";if(/poetry|poems/.test(a))return"Poetry";if(/biography|autobiography|memoir/.test(a))return"Biography";if(/language|linguistic/.test(a))return"Language";if(/education|learning|textbook/.test(a))return"Education";return"Fiction"};
const secureURL=url=>{try{const u=new URL(url);return u.protocol==="https:"?u.href:null}catch(e){return null}};
const entry=data=>{
 const card=document.createElement("article");card.className="card book-tile";
 const pict=document.createElement("div");pict.className="book-pict "+(data.kind==="audio"?"audio-icon":"ebook-icon");
 pict.textContent=data.kind==="audio"?"🎧":data.category==="Children"?"📗":"📖";
 pict.setAttribute("aria-hidden","true");card.append(pict);
 const h=document.createElement("h3");h.textContent=data.title||"Untitled book";h.title=h.textContent;card.append(h);
 const author=document.createElement("p");author.className="book-author";author.textContent=data.author&&data.author!=="Unknown"&&data.author!=="Unknown author"?data.author:"Author not listed";card.append(author);
 const tags=document.createElement("p");tags.className="book-label";tags.textContent=[data.language&&data.language!=="Unconfirmed"?data.language:null,data.category].filter(Boolean).join(" · ")||"Book";card.append(tags);
 const link=document.createElement("a");link.className="btn book-action";
 const isHosted=data.source==="member";
 link.textContent=isHosted?(data.kind==="audio"?"Listen free":"Read free"):(data.kind==="audio"?"Listen at source":"Open source");
 if(isHosted){
  link.href="#";link.addEventListener("click",async e=>{
   e.preventDefault();if(!app.client)return;
   const previous=link.textContent;link.textContent="Opening…";
   try{
    const result=await app.client.storage.from("readmalawi-library").createSignedUrl(data.storage_path,120);
    if(result.error)throw result.error;const url=secureURL(result.data?.signedUrl);
    if(!url)throw Error("Approved book link unavailable");openReader(url,data);
   }catch(err){alert("Unable to open this book: "+err.message)}
   finally{link.textContent=previous}
  });
 }else{link.href=secureURL(data.url)||"#";link.target="_blank";link.rel="noopener noreferrer";link.title="Open original provider. ReadMalawi cannot embed every external work."}
 card.append(link);return card;
};

function openReader(url,book){
  document.querySelector("#readmalawi-viewer")?.remove();
  const box=document.createElement("section");box.id="readmalawi-viewer";box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");box.setAttribute("aria-label","Online reading");
  box.style.cssText="position:fixed;inset:0;z-index:1000;background:#092e2bf2;display:flex;flex-direction:column;padding:16px;gap:12px";
  const top=document.createElement("div");top.style.cssText="display:flex;justify-content:space-between;align-items:center;gap:12px;color:white";
  const title=document.createElement("strong");title.textContent=(book.title||"ReadMalawi")+" · "+(book.access_mode==="online_only"?"Online only":"Online preview");
  const close=document.createElement("button");close.className="btn secondary";close.textContent="Close reader";close.addEventListener("click",()=>{box.remove();document.removeEventListener("keydown",onEscape)});
  function onEscape(e){if(e.key==="Escape")close.click()} document.addEventListener("keydown",onEscape);
  top.append(title,close);box.append(top);
  const container=document.createElement("div");container.style.cssText="flex:1;min-height:0;background:white;border-radius:10px;overflow:auto";box.append(container);
  if(book.kind==="audio"){const audio=document.createElement("audio");audio.controls=true;audio.preload="metadata";audio.controlsList="nodownload";audio.style.cssText="display:block;width:100%;margin:35px auto";audio.src=url;container.append(audio);}
  else if(/\.epub$/i.test(book.storage_path||"")) {
    const target=document.createElement("div");target.style.cssText="height:100%;min-height:360px";container.append(target);
    const lib=document.createElement("script");lib.src="https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js";lib.onload=()=>{try{window.ePub(url).renderTo(target,{width:"100%",height:"100%"}).display()}catch(e){target.textContent="EPUB preview unavailable. Contact the library moderator."}};lib.onerror=()=>target.textContent="EPUB viewer unavailable right now.";document.head.append(lib);
  } else {const pdf=document.createElement("iframe");pdf.src=url+"#toolbar=0&navpanes=0";pdf.title="ReadMalawi PDF reader";pdf.style.cssText="height:100%;min-height:360px;width:100%;border:0";container.append(pdf)}
  const foot=document.createElement("p");foot.style.cssText="color:#e9f4ed;font-size:.8rem;margin:0";foot.textContent="No site download option for online-only works. Browser tools and recording may still copy content; this is not DRM.";box.append(foot);document.body.append(box);close.focus();
}

function filterAndRender(){
 const term=$("#search").value.trim().toLowerCase();
 const cat=$("#category").value;
 const lang=$("#language").value.trim().toLowerCase();
 const sort=$("#sort").value;
 const items=app.local.concat(app.remote).filter(book=>
   (app.kind==="all"||book.kind===app.kind)
   &&(cat==="all"||book.category===cat)
   &&(!lang||String(book.language||"").toLowerCase().includes(lang))
   &&(!term||[book.title,book.author,book.category,book.language,book.description].join(" ").toLowerCase().includes(term)));
 items.sort((a,b)=>sort==="recent"?(b.rank||0)-(a.rank||0):(a.title||"").localeCompare(b.title||""));
 const target=$("#catalogue");target.replaceChildren();
 if(!items.length){const notice=document.createElement("div");notice.className="notice";notice.textContent="No matching books yet. Try another language or search for a title.";target.append(notice)}
 else items.forEach(book=>target.append(entry(book)));
 $("#count").textContent=items.length+" listing"+(items.length===1?"":"s")+" shown";
}
const preselectedCategory=new URLSearchParams(location.search).get("category");
if(preselectedCategory&&Array.from($("#category").options).some(opt=>opt.value===preselectedCategory))$("#category").value=preselectedCategory;
for(const id of ["search","category","language","sort"]){$("#"+id).addEventListener(["search","language"].includes(id)?"input":"change",filterAndRender)}
document.querySelectorAll("[data-kind]").forEach(btn=>btn.addEventListener("click",()=>{app.kind=btn.dataset.kind;document.querySelectorAll("[data-kind]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));filterAndRender()}));
const fetchJSON=async (url,timeout=9500)=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{const r=await fetch(url,{signal:controller.signal,headers:{"Accept":"application/json"}});if(!r.ok)throw Error(String(r.status));return await r.json()}finally{clearTimeout(timer)}};
async function loadCatalogue(){
 const books=fetchJSON("https://gutendex.com/books/?copyright=false");
 const audio=fetchJSON("https://librivox.org/api/feed/audiobooks/?format=json&limit=18");
 const results=await Promise.allSettled([books,audio]);let found=0;
 if(results[0].status==="fulfilled"){
   const list=results[0].value.results||[];
   for(const x of list){if(!x.id||x.copyright!==false)continue;app.remote.push({title:x.title,author:(x.authors||[]).map(a=>a.name).join(", ")||"Unknown author",category:categoryFrom(x.subjects),kind:"book",language:langCode((x.languages||[])[0]),source:"gutenberg",url:"https://www.gutenberg.org/ebooks/"+x.id,rank:1});found++}
 }
 if(results[1].status==="fulfilled"){
   for(const x of results[1].value.books||[]){const url=secureURL(x.url_librivox)||"https://librivox.org/";app.remote.push({title:x.title,author:(x.authors||[]).map(a=>[a.first_name,a.last_name].filter(Boolean).join(" ")).join(", ")||"Unknown author",category:"Fiction",kind:"audio",language:langCode(x.language||""),source:"librivox",url,rank:1});found++}
 }
 if(!found)$("#fetch-message").textContent="Live catalogue sources could not be reached. You can still use the source-directory links above and try again later.";
 else $("#fetch-message").textContent="External listings are retrieved automatically. These are links to source websites, not books hosted or sold by ReadMalawi.";
 filterAndRender();
}
async function backend(){
 if(!cfg.supabaseUrl||!(cfg.supabasePublishableKey||cfg.supabaseAnonKey))return;
 try{
 const mod=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
 app.client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey||cfg.supabaseAnonKey);
 app.backend=true;
 $("#service-message").className="notice";
 $("#service-message").textContent="Community submissions are enabled. Submitted files remain private until administrator approval.";
 $("#login-btn").disabled=false;
 const session=await app.client.auth.getSession();
 updateUser(session.data?.session?.user||null);
 app.client.auth.onAuthStateChange((_evt,s)=>{updateUser(s?.user||null)});
 await Promise.all([loadApproved(),loadRequests()]);
 }catch(err){$("#service-message").textContent="Storage could not be connected. Uploads remain paused. "+err.message}
}
function updateUser(user){
 app.user=user;
 $("#user-status").textContent=user?"Signed in as "+user.email:"Sign in with email to share books and stories.";
 $("#logout-btn").classList.toggle("hide",!user);
 $("#upload-submit").disabled=!user||uploadRunning;
 $("#request-submit").disabled=!user;
 updateAdminLink(user);
}
async function updateAdminLink(user){
 const link=$("#admin-link");link.classList.add("hide");if(!user||!app.client)return;
 try{
  const {data,error}=await app.client.from("readmalawi_admins").select("user_id").eq("user_id",user.id).maybeSingle();
  if(!error&&data&&app.user?.id===user.id)link.classList.remove("hide");
 }catch(_){}
}
$("#login-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!app.client)return;
 const email=$("#email").value.trim();
 try{
  const r=await app.client.auth.signInWithOtp({email,options:{emailRedirectTo:location.href.split("#")[0]}});
  if(r.error)throw r.error;
  $("#user-status").textContent="Check your inbox for your secure sign-in link.";
 }catch(err){$("#user-status").textContent="Sign-in unsuccessful: "+err.message}
});
$("#logout-btn").addEventListener("click",async()=>{if(app.client)await app.client.auth.signOut()});
async function loadApproved(){
 if(!app.client)return;
 const {data,error}=await app.client.from("library_books").select("id,title,author,description,media_type,category,language,file_path,access_mode").eq("status","approved").order("submitted_at",{ascending:false}).limit(100);
 if(error){$("#fetch-message").textContent="Approved member catalogue unavailable: "+error.message;return}
 app.local=(data||[]).map(b=>({...b,kind:b.media_type==="audiobook"?"audio":"book",storage_path:b.file_path,source:"member",rank:2}));filterAndRender();
}
let uploadRunning=false;
const uploadExtensions={pdf:["ebook","application/pdf"],epub:["ebook","application/epub+zip"],mp3:["audiobook","audio/mpeg"],m4a:["audiobook","audio/mp4"]};
const titleFromFilename=name=>{
 const base=name.replace(/\.(pdf|epub|mp3|m4a)$/i,"").replace(/[_]+/g," ").replace(/\s+/g," ").trim();
 return (base||"Untitled book").slice(0,240);
};
$("#upload-file").addEventListener("change",()=>{
 const files=Array.from($("#upload-file").files||[]);
 $("#upload-selection").textContent=files.length===0?"No books selected yet.":files.length===1?
  "Selected: "+files[0].name:files.length+" books ready to share: "+files.slice(0,3).map(x=>x.name).join(", ")+(files.length>3?" and more…":"");
});
$("#upload-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!app.client||!app.user||uploadRunning)return;
 const files=Array.from($("#upload-file").files||[]);if(!files.length){show("#upload-status","Choose your books first.",false);return}
 const progress=$("#upload-progress");progress.hidden=false;progress.max=files.length;progress.value=0;
 uploadRunning=true;$("#upload-submit").disabled=true;
 let done=0,failed=[];
 for(const [i,file] of files.entries()){
  const ext=(file.name.split(".").pop()||"").toLowerCase(),def=uploadExtensions[ext];
  if(!def||file.size<1||file.size>50*1024*1024){
   failed.push(file.name+" (unsupported file or over 50 MB)");progress.value=i+1;continue;
  }
  show("#upload-status","Adding book "+(i+1)+" of "+files.length+": "+file.name+"…",true);
  const path=app.user.id+"/"+crypto.randomUUID()+"."+ext;
  try{
   const uploaded=await app.client.storage.from("readmalawi-library").upload(path,file,{upsert:false,contentType:def[1]});
   if(uploaded.error)throw uploaded.error;
   const row={
    uploaded_by:app.user.id,title:titleFromFilename(file.name),author:"Unknown",
    media_type:def[0],category:"Other",language:"Unconfirmed",origin:"Unspecified",
    access_mode:"online_only",rights_basis:"unknown",rights_url:null,attested_rights:false,
    file_path:path,mime_type:def[1],description:""
   };
   const {error}=await app.client.from("library_books").insert(row);
   if(error)throw error;
   done++;
  }catch(err){failed.push(file.name+" ("+(err.message||"upload failed")+")")}
  progress.value=i+1;
 }
 uploadRunning=false;$("#upload-submit").disabled=!app.user;$("#upload-form").reset();
 $("#upload-selection").textContent="No books selected yet.";
 if(failed.length){
  show("#upload-status",done+" book(s) received. "+failed.length+" could not be submitted. "+failed.slice(0,3).join("; ")+(failed.length>3?" and others":""),false);
 }else{
  show("#upload-status","Thank you! "+done+" book"+(done===1?"":"s")+" received. Our librarian will organise the details and check which can be shared publicly.",true);
 }
});
$("#request-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!app.client||!app.user)return;
 $("#request-submit").disabled=true;
 try{const {error}=await app.client.from("book_requests").insert({requested_by:app.user.id,title:$("#request-title").value.trim(),author:$("#request-author").value.trim(),notes:$("#request-notes").value.trim(),status:"open"});
 if(error)throw error;$("#request-form").reset();show("#request-status","Request published. Other members can now offer a lawful source.",true);await loadRequests()
 }catch(err){show("#request-status","Could not publish request: "+err.message,false)}
 finally{$("#request-submit").disabled=!app.user}
});
async function loadRequests(){
 if(!app.client)return;const {data,error}=await app.client.from("book_requests").select("id,title,author,notes,status,created_at").order("created_at",{ascending:false}).limit(30);
 if(error){$("#requests-list").textContent="Requests unavailable.";return}
 const parent=$("#requests-list");parent.replaceChildren();
 if(!data?.length){const p=document.createElement("p");p.className="muted";p.textContent="No public requests yet. Be the first to suggest a title.";parent.appendChild(p);return}
 for(const r of data){const block=document.createElement("article");block.className="request";const h=document.createElement("h3");h.textContent=r.title;block.appendChild(h);const p=document.createElement("p");p.textContent=[r.author?"Author: "+r.author:"",r.notes||"", "Status: "+r.status].filter(Boolean).join(" · ");block.appendChild(p);if(r.status==="open"){const b=document.createElement("button");b.type="button";b.className="btn secondary";b.textContent="I can help";b.addEventListener("click",()=>offer(r.id));block.appendChild(b)}parent.appendChild(block)}
}
async function offer(id){
 if(!app.client||!app.user){alert("Please sign in first. Your private details will not be posted publicly.");return}
 const note=prompt("Share a legal source link or explain how you can help. Do not offer pirated files.");if(!note||!note.trim())return;
 if(note.length>800){alert("Please keep your message under 800 characters.");return}
 const {error}=await app.client.from("book_request_offers").insert({request_id:id,offered_by:app.user.id,message:note.trim()});
 alert(error?"Could not submit your offer: "+error.message:"Thank you. Your offer was recorded privately for administrator coordination.");
}
filterAndRender();loadCatalogue().catch(()=>{});backend().catch(()=>{});
