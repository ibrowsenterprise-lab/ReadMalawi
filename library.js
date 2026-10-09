const $=s=>document.querySelector(s);
const app={kind:"all",local:[],remote:[],client:null,user:null,requests:[],backend:false};
const cfg=window.READMALAWI_CONFIG||{};
const types={book:"E-book",audio:"Audiobook"};
const show=(id,text,good)=>{const el=$(id);el.textContent=text;el.className="status "+(good?"ok":"err")};
const langCode=code=>code==="en"?"English":code==="ny"?"Chichewa":code==="tum"?"Chitumbuka":code==="yao"?"Chiyao":"Other";
const categoryFrom=subjects=>{const a=(subjects||[]).join(" ").toLowerCase();if(/children|juvenile|fairy/.test(a))return"Children";if(/history|historical/.test(a))return"History";if(/science|chemistry|physics|biology/.test(a))return"Science";if(/poetry|poems/.test(a))return"Poetry";if(/biography|autobiography|memoir/.test(a))return"Biography";if(/language|linguistic/.test(a))return"Language";if(/education|learning|textbook/.test(a))return"Education";return"Fiction"};
const secureURL=url=>{try{const u=new URL(url);return u.protocol==="https:"?u.href:null}catch(e){return null}};
const entry=(data)=>{
 const card=document.createElement("article");card.className="card";
 const meta=document.createElement("div");meta.className="meta";
 const type=document.createElement("span");type.className="tag "+(data.kind==="audio"?"audio":"");type.textContent=types[data.kind]||"E-book";meta.appendChild(type);
 for(const m of [data.category,data.language]){const tag=document.createElement("span");tag.className="tag";tag.textContent=m||"Other";meta.appendChild(tag)} card.appendChild(meta);
 const h=document.createElement("h3");h.textContent=data.title||"Untitled";card.appendChild(h);
 const who=document.createElement("p");who.textContent="By "+(data.author||"Unknown author");card.appendChild(who);
 const source=document.createElement("p");source.textContent=data.source==="member"?"ReadMalawi community · Approved":data.source==="librivox"?"LibriVox · External source":"Project Gutenberg · External source";card.appendChild(source);
 const note=document.createElement("p");note.textContent=data.source==="member"?"Submitted with declared sharing rights; admin-approved.":data.source==="gutenberg"?"US public-domain catalogue; verify copyright status in Malawi.":"Open audiobook catalogue hosted by LibriVox.";card.appendChild(note);
 const actions=document.createElement("div");actions.className="card-actions";
 const link=document.createElement("a");link.className="btn";link.textContent=data.kind==="audio"?"Listen / details":"Read / details";
 if(data.source==="member"){
   link.href="#";link.textContent=data.kind==="audio"?"Listen online":"Read online";link.addEventListener("click",async e=>{e.preventDefault();if(!app.client)return;link.textContent="Opening…";try{const result=await app.client.storage.from("readmalawi-library").createSignedUrl(data.storage_path,120);if(result.error)throw result.error;const url=secureURL(result.data?.signedUrl);if(!url)throw Error("Cannot safely open the approved book");openReader(url,data)}catch(err){alert("Unable to open this book yet: "+err.message)}finally{link.textContent=data.kind==="audio"?"Listen online":"Read online"}});
 }else{link.href=secureURL(data.url)||"#";link.target="_blank";link.rel="noopener noreferrer";}
 actions.appendChild(link);card.appendChild(actions);return card;
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
 const term=$("#search").value.trim().toLowerCase(),cat=$("#category").value,lang=$("#language").value,sort=$("#sort").value;
 const items=app.local.concat(app.remote).filter(b=>(app.kind==="all"||b.kind===app.kind)&&(cat==="all"||b.category===cat)&&(lang==="all"||b.language===lang)&&(!term||[b.title,b.author,b.category,b.language,b.description].join(" ").toLowerCase().includes(term)));
 items.sort((a,b)=>sort==="recent"?(b.rank||0)-(a.rank||0):(a.title||"").localeCompare(b.title||""));
 const target=$("#catalogue");target.replaceChildren();
 if(!items.length){const blank=document.createElement("div");blank.className="notice";blank.textContent="No matching books yet. Try another category or search phrase, or request a title below.";target.appendChild(blank)}
 else items.forEach(b=>target.appendChild(entry(b)));
 $("#count").textContent=items.length+" listing"+(items.length===1?"":"s")+" shown";
}
for(const id of ["search","category","language","sort"]){$( "#"+id).addEventListener(id==="search"?"input":"change",filterAndRender)}
document.querySelectorAll("[data-kind]").forEach(btn=>btn.addEventListener("click",()=>{app.kind=btn.dataset.kind;document.querySelectorAll("[data-kind]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));filterAndRender()}));
const fetchJSON=async (url,timeout=9500)=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{const r=await fetch(url,{signal:controller.signal,headers:{"Accept":"application/json"}});if(!r.ok)throw Error(String(r.status));return await r.json()}finally{clearTimeout(timer)}};
async function loadCatalogue(){
 const books=fetchJSON("https://gutendex.com/books/?copyright=false&languages=en");
 const audio=fetchJSON("https://librivox.org/api/feed/audiobooks/?format=json&limit=18");
 const results=await Promise.allSettled([books,audio]);let found=0;
 if(results[0].status==="fulfilled"){
   const list=results[0].value.results||[];
   for(const x of list){if(!x.id||x.copyright!==false)continue;app.remote.push({title:x.title,author:(x.authors||[]).map(a=>a.name).join(", ")||"Unknown author",category:categoryFrom(x.subjects),kind:"book",language:langCode((x.languages||[])[0]),source:"gutenberg",url:"https://www.gutenberg.org/ebooks/"+x.id,rank:1});found++}
 }
 if(results[1].status==="fulfilled"){
   for(const x of results[1].value.books||[]){const url=secureURL(x.url_librivox)||"https://librivox.org/";app.remote.push({title:x.title,author:(x.authors||[]).map(a=>[a.first_name,a.last_name].filter(Boolean).join(" ")).join(", ")||"Unknown author",category:"Fiction",kind:"audio",language:langCode(x.language==="English"?"en":""),source:"librivox",url,rank:1});found++}
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
 $("#service-message").className="message";
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
 $("#user-status").textContent=user?"Signed in as "+user.email:"Sign in by email to propose a book or request a title.";
 $("#logout-btn").classList.toggle("hide",!user);
 $("#upload-submit").disabled=!user;
 $("#request-submit").disabled=!user;
}
$("#login-form").addEventListener("submit",async e=>{e.preventDefault();if(!app.client)return;const email=$("#email").value.trim();try{const r=await app.client.auth.signInWithOtp({email,options:{emailRedirectTo:location.href.split("#")[0]}});if(r.error)throw r.error;$("#user-status").textContent="Check your email for the secure sign-in link."}catch(err){$("#user-status").textContent="Sign-in unsuccessful: "+err.message}});
$("#logout-btn").addEventListener("click",async()=>{if(app.client)await app.client.auth.signOut()});
async function loadApproved(){
 if(!app.client)return;
 const {data,error}=await app.client.from("library_books").select("id,title,author,description,media_type,category,language,file_path,access_mode").eq("status","approved").order("created_at",{ascending:false}).limit(100);
 if(error){$("#fetch-message").textContent="Approved member catalogue unavailable: "+error.message;return}
 app.local=(data||[]).map(b=>({...b,kind:b.media_type==="audiobook"?"audio":"book",storage_path:b.file_path,source:"member",rank:2}));filterAndRender();
}
$("#upload-kind").addEventListener("change",()=>{$("#upload-file").value=""});
$("#upload-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!app.client||!app.user)return;
 const f=$("#upload-file").files[0];if(!f)return;
 const kind=$("#upload-kind").value;const ext=(f.name.split(".").pop()||"").toLowerCase();const formats=kind==="audio"?["mp3","m4a"]:["pdf","epub"];const cap=kind==="audio"?50:20;
 if(!formats.includes(ext)||f.size>cap*1024*1024){show("#upload-status","Invalid format or file size. Choose "+formats.join("/")+" under "+cap+" MB.",false);return}
 if(!$("#upload-consent").checked){show("#upload-status","Permission confirmation is required.",false);return}
 $("#upload-submit").disabled=true;
 const path=app.user.id+"/"+crypto.randomUUID()+"."+ext;const bucket="readmalawi-library";
 try{
  const uploaded=await app.client.storage.from(bucket).upload(path,f,{upsert:false,contentType:f.type||undefined});
  if(uploaded.error)throw uploaded.error;
  const rightsBasis=$("#upload-rights").value;const row={uploaded_by:app.user.id,title:$("#upload-title").value.trim(),author:$("#upload-author").value.trim(),media_type:kind==="audio"?"audiobook":"ebook",category:$("#upload-category").value,language:$("#upload-language").value,origin:$("#upload-origin").value,access_mode:$("#upload-access").value,rights_basis:rightsBasis,rights_url:$("#upload-evidence").value.trim(),attested_rights:rightsBasis!=="unknown",file_path:path,mime_type:({pdf:"application/pdf",epub:"application/epub+zip",mp3:"audio/mpeg",m4a:"audio/mp4"})[ext],description:""};
  const result=await app.client.from("library_books").insert(row);
  if(result.error)throw result.error;
  $("#upload-form").reset();show("#upload-status","Submitted successfully. Your file remains private until rights checks are completed. Every Malawian work requires moderator approval.",true);
 }catch(err){show("#upload-status","Submission could not be completed: "+err.message+". If the file uploaded before this error, contact the administrator for cleanup.",false)}
 finally{$("#upload-submit").disabled=!app.user}
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
