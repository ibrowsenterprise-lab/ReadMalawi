import { getSupabaseModule } from "./assets/supabase-loader.js";
const $=s=>document.querySelector(s);
const sampleBook={title:"The Book on the Bench",author:"ReadMalawi",description:"An original short practice story about sharing a book.",category:"Children",language:"English",kind:"book",source:"original",discussion_key:"readmalawi:bench",url:"assets/the-book-on-the-bench.html",rank:100};
const originalStories=[
  sampleBook,
  {title:"The Seed Jar",author:"ReadMalawi",description:"Memory plants seeds and learns why patience matters.",category:"Children",language:"English",kind:"book",source:"original",discussion_key:"readmalawi:seedjar",url:"assets/the-seed-jar.html",rank:99},
  {title:"The Rainy Day Book Club",author:"ReadMalawi",description:"Four friends start a book club and make everyone feel welcome.",category:"Children",language:"English",kind:"book",source:"original",discussion_key:"readmalawi:rainclub",url:"assets/the-rainy-day-book-club.html",rank:98},
  {title:"Thoko and the Clean Stream",author:"ReadMalawi",description:"Thoko finds a safe way to help keep her community clean.",category:"Education",language:"English",kind:"book",source:"original",discussion_key:"readmalawi:cleanstream",url:"assets/thoko-and-the-clean-stream.html",rank:97},
  {"title":"A Library in a Bag","author":"ReadMalawi","description":"A travelling bag of stories brings a new reading idea to a classroom.","category":"Children","language":"English","kind":"book","source":"original","discussion_key":"readmalawi:librarybag","url":"assets/a-library-in-a-bag.html","rank":96},
  {"title":"Tadala's Market Puzzle","author":"ReadMalawi","description":"Tadala solves a counting problem while helping at a market stall.","category":"Education","language":"English","kind":"book","source":"original","discussion_key":"readmalawi:marketpuzzle","url":"assets/tadalas-market-puzzle.html","rank":95},
  {"title":"The Blue Rain Notebook","author":"ReadMalawi","description":"Two friends discover how careful observations become useful evidence.","category":"Science","language":"English","kind":"book","source":"original","discussion_key":"readmalawi:rainnotebook","url":"assets/the-blue-rain-notebook.html","rank":94},
  {"title":"Grandmother's Word Basket","author":"ReadMalawi","description":"A family learns that a story can travel between languages with care.","category":"Language","language":"English","kind":"book","source":"original","discussion_key":"readmalawi:wordbasket","url":"assets/grandmothers-word-basket.html","rank":93},
  {"title":"The Message That Asked for a Code","author":"ReadMalawi","description":"Sella learns about suspicious messages and account codes.","category":"Education","language":"English","kind":"book","source":"original","discussion_key":"readmalawi:secretcode","url":"assets/the-message-that-asked-for-a-code.html","rank":92},
  {"title":"The Missing Pencil","author":"ReadMalawi","description":"A misplaced pencil teaches a class not to jump to conclusions.","category":"Children","language":"English","kind":"book","source":"original","discussion_key":"readmalawi:missingpencil","url":"assets/the-missing-pencil.html","rank":91}
];

/*
 * Curated original-provider links: these entries are NOT uploaded or copied to ReadMalawi.
 * Catalogue metadata is editorial; it does not certify redistribution rights in Malawi.
 * Keep source names and specific editions distinct from privately submitted PDFs.
 */
const officialSourceBooks=[
 {title:"Getting Motivated to Change",author:"N. G. Bartholomew, D. F. Dansereau & D. D. Simpson",
  description:"University training material; check its terms for any reuse.",provider:"Texas Christian University",
  category:"Education",language:"English",url:"https://ibr.tcu.edu/manuals/description-getting-motivated-to-change/"},
 {title:"PM² Project Management Methodology Guide",author:"European Commission",
  description:"Official project-management guidance; edition-specific reuse terms apply.",provider:"European Commission",
  category:"Education",language:"English",url:"https://pm2.europa.eu/pm2-methodologies/pm2-project-management_en"},
 {title:"Project Management from Simple to Complex",author:"Russel Darnall & John Preston",
  description:"Open Textbook Library edition (CC BY-NC-SA). Read licensing terms on its original page.",provider:"Open Textbook Library",
  category:"Education",language:"English",url:"https://open.umn.edu/opentextbooks/textbooks/project-management-from-simple-to-complex"},
 {title:"Project Management — 2nd Edition",author:"Adrienne Watt",
  description:"BCcampus open textbook. Specific chapters and images may have additional terms.",provider:"BCcampus Open Education",
  category:"Education",language:"English",url:"https://opentextbc.ca/projectmanagement/"},
 {title:"The Critique of Pure Reason",author:"Immanuel Kant · J. M. D. Meiklejohn translation",
  description:"Historical translated edition. Copyright status depends on jurisdiction.",provider:"Project Gutenberg",
  category:"Other",language:"English",url:"https://www.gutenberg.org/ebooks/4280"},
 {title:"The Light That Failed",author:"Rudyard Kipling",
  description:"Read the Project Gutenberg historical edition directly.",provider:"Project Gutenberg",
  category:"Fiction",language:"English",url:"https://www.gutenberg.org/ebooks/2876"},
 {title:"Moby-Dick; or, The Whale",author:"Herman Melville",
  description:"Historical American edition offered by Project Gutenberg.",provider:"Project Gutenberg",
  category:"Fiction",language:"English",url:"https://www.gutenberg.org/ebooks/15"},
 {title:"The Man Who Knew Too Much",author:"G. K. Chesterton",
  description:"Original-source historical collection of stories.",provider:"Project Gutenberg",
  category:"Fiction",language:"English",url:"https://www.gutenberg.org/ebooks/1720"},
 {title:"The Art of War",author:"Sun Tzu · Lionel Giles translation",
  description:"Historical Lionel Giles translation, not the commercial 2011 edition.",provider:"Project Gutenberg",
  category:"History",language:"English",url:"https://www.gutenberg.org/ebooks/17405"},
 {title:"The Almanack of Naval Ravikant",author:"Eric Jorgenson",
  description:"The editor offers free reading on the official website; this is not permission to rehost a PDF.",provider:"Official editor website",
  category:"Education",language:"English",url:"https://www.navalmanack.com/"}
].map((book,index)=>({...book,kind:"book",source:"official",rank:80-index}));

const app={collection:"books",page:1,pageSize:12,catalogueReady:false,kind:"all",sourceFilter:"all",local:originalStories.concat(officialSourceBooks),remote:[],client:null,user:null,requests:[],backend:false};
const cfg=window.READMALAWI_CONFIG||{};
const types={book:"E-book",audio:"Audiobook"};
const show=(id,text,good)=>{const el=$(id);el.textContent=text;el.className="status "+(good?"ok":"err")};
const langCode=code=>({en:"English",ny:"Chichewa",tum:"Chitumbuka",ya:"Chiyao",yao:"Chiyao",lom:"Chilomwe",seh:"Chisena",toi:"Chitonga",fr:"French",es:"Spanish",pt:"Portuguese",sw:"Swahili",ar:"Arabic",de:"German",hi:"Hindi",zh:"Chinese",ja:"Japanese",ko:"Korean",ru:"Russian",it:"Italian",nl:"Dutch",af:"Afrikaans",zu:"Zulu",xh:"Xhosa",sn:"Shona"}[String(code||"").toLowerCase().split("-")[0]]||String(code||"Unconfirmed"));
const categoryFrom=subjects=>{
 const s=(subjects||[]).join(" ").toLowerCase();
 if(/children|juvenile|fairy|kids|young readers/.test(s))return "Children";
 if(/poetry|poems|verse|epic poems|epic poetry/.test(s))return "Poetry";
 if(/biography|autobiography|memoir/.test(s))return "Biography";
 if(/bible|scripture|religion|theology|qur.?an|christian|islam/.test(s))return "Religion";
 if(/language|linguistics|dictionary|grammar/.test(s))return "Language";
 if(/education|learning|textbook|school/.test(s))return "Education";
 if(/science|chemistry|physics|biology|mathematics/.test(s))return "Science";
 // Project Gutenberg often labels novels "historical fiction": classify those as fiction.
 if(/fiction|novel|romances|short stories|tales|literary collections/.test(s))return "Fiction";
 if(/history|historical|chronicle/.test(s))return "History";
 return "Fiction";
};
const secureURL=url=>{try{const u=new URL(url);return u.protocol==="https:"?u.href:null}catch(e){return null}};
const entry=data=>{
 const row=document.createElement("article");
 row.className="card book-tile";
 const pict=document.createElement("div");
 pict.className="book-pict "+(data.kind==="audio"?"audio-icon":"ebook-icon");
 pict.textContent=data.kind==="audio"?"🎧":data.category==="Children"?"📗":"📖";
 pict.setAttribute("aria-hidden","true");
 const details=document.createElement("div");details.className="book-info";
 const heading=document.createElement("h3");heading.textContent=data.title||"Untitled book";
 heading.title=heading.textContent;
 const author=document.createElement("p");author.className="book-author";
 author.textContent=data.author&&data.author!=="Unknown"&&data.author!=="Unknown author"?data.author:"Author not listed";
 const meta=document.createElement("p");meta.className="book-label";
 meta.textContent=[data.language&&data.language!=="Unconfirmed"?data.language:null,data.category,
  data.source==="official"?"Publisher website":data.source==="original"?"Short story":"Read on ReadMalawi"]
  .filter(Boolean).join(" · ")||"Book";
 details.append(heading,author,meta);
 const extra=document.createElement("details");extra.className="book-more";
 const summary=document.createElement("summary");summary.textContent="More";extra.append(summary);
 if(data.source==="official"){
   const desc=document.createElement("p");
   desc.className="small muted";desc.textContent=data.description||"Read on the original provider's website.";
   desc.style.cssText="margin:4px 0 7px;line-height:1.45";
   extra.append(desc);
 }
 const bookKey=data.discussion_key;
 if(bookKey){
   const talk=document.createElement("a");
   talk.className="book-discuss";
   talk.textContent="💬 Reader comments";
   const p=new URLSearchParams({book:bookKey,title:(data.title||"Untitled book").slice(0,240),author:(data.author||"").slice(0,180)});
   talk.href="assets/book-discussions.html?"+p.toString();
   talk.setAttribute("aria-label","Discuss "+(data.title||"this book")+" with other readers");
   extra.append(talk);
 }
 // Invite readers to ASK for a lawful source in the existing WhatsApp forum.
 // This does not automatically post or claim that a copyrighted book may be distributed.
 if(window.ReadMalawiWhatsApp?.createRequestLink){
   const ask=window.ReadMalawiWhatsApp.createRequestLink(data.title,data.author);
   extra.append(ask);

 }
 if(extra.children.length>1)details.append(extra);
 const link=document.createElement("a");link.className="book-action";
 const isHosted=data.source==="member",isAudio=data.kind==="audio",isOfficial=data.source==="official";
 link.textContent=isOfficial?"Read at publisher ↗":isHosted?(isAudio?"Listen here ›":"Read here ›"):"Read story ›";
 link.setAttribute("aria-label",(isOfficial?"Open original source for: ":isAudio?"Listen on ReadMalawi: ":"Read on ReadMalawi: ")+(data.title||"Untitled book"));
 if(isOfficial){
   link.href=secureURL(data.url)||"assets/official-reading.html";
   link.target="_blank";link.rel="noopener noreferrer";
 }else if(data.source==="original"){
   link.href=data.url;
 }else if(isHosted){
   link.href="#";
   link.addEventListener("click",async e=>{
     e.preventDefault();if(!app.client)return;
     const previous=link.textContent;link.textContent="Opening…";
     try{
       const result=await app.client.storage.from("readmalawi-library").createSignedUrl(data.storage_path,120);
       if(result.error)throw result.error;
       const url=secureURL(result.data?.signedUrl);
       if(!url)throw Error("Approved book link unavailable");
       openReader(url,data);
     }catch(err){alert("Unable to open this book: "+err.message)}
     finally{link.textContent=previous}
   });
 }
 row.append(pict,details,link);
 row.addEventListener("click",event=>{
   if(event.target.closest("a,button,input,select,textarea,summary,details"))return;
   link.click();
 });
 return row;
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

function filterAndRender(resetPage=true){
 if(resetPage)app.page=1;
 const term=$("#search").value.trim().toLowerCase();
 const cat=$("#category").value;
 const lang=$("#language").value.trim().toLowerCase();
 const sort=$("#sort").value;
 const items=app.local.concat(app.remote).filter(book=>
   (app.collection==="kids"?book.source==="original":app.collection==="external"?book.source==="official":book.source==="member")
   &&(app.kind==="all"||book.kind===app.kind)
   &&(cat==="all"||book.category===cat)
   &&(!lang||String(book.language||"").toLowerCase().includes(lang))
   &&(!term||[book.title,book.author,book.category,book.language,book.description].join(" ").toLowerCase().includes(term)));
 items.sort((a,b)=>sort==="recent"?(b.rank||0)-(a.rank||0):(a.title||"").localeCompare(b.title||""));
 const target=$("#catalogue");target.replaceChildren();
 if(!items.length){const notice=document.createElement("div");notice.className="notice";notice.textContent=app.collection==="books"&&!app.catalogueReady?"Loading our books…":"No matching titles. Try another category, language or search.";target.append(notice)}
 else {
 const pages=Math.ceil(items.length/app.pageSize);app.page=Math.max(1,Math.min(app.page,pages));
 items.slice((app.page-1)*app.pageSize,app.page*app.pageSize).forEach(book=>target.append(entry(book)));
 }
 const totalPages=Math.max(1,Math.ceil(items.length/app.pageSize));
 $("#count").textContent=app.collection==="books"&&!app.catalogueReady?"Loading catalogue…":items.length?((app.page-1)*app.pageSize+1)+"–"+Math.min(app.page*app.pageSize,items.length)+" of "+items.length+" titles":"No matching titles";
 $("#page-status").textContent="Page "+app.page+" of "+totalPages;
 $("#page-prev").disabled=app.page<=1;$("#page-next").disabled=app.page>=totalPages;
 $("#catalogue-pages").hidden=items.length<=app.pageSize;
}
$("#page-prev").addEventListener("click",()=>{app.page--;filterAndRender(false);$("#library").scrollIntoView({behavior:"smooth",block:"start"})});
$("#page-next").addEventListener("click",()=>{app.page++;filterAndRender(false);$("#library").scrollIntoView({behavior:"smooth",block:"start"})});
document.querySelectorAll("[data-collection]").forEach(button=>button.addEventListener("click",()=>{
 app.collection=button.dataset.collection;$("#category").value="all";$("#search").value="";$("#language").value="";
 document.querySelectorAll("[data-collection]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.collection===app.collection)));
 $("#catalogue-heading").textContent=app.collection==="kids"?"Kids & beginners":app.collection==="external"?"More reading sources":"Browse our books";
 $("#catalogue-intro").textContent=app.collection==="kids"?"Short stories with simple questions for younger readers and beginners.":app.collection==="external"?"Extra titles to read on the original publisher’s website.":"Search by title or author, or choose a category. Tap Read to open a book here.";
 filterAndRender();
}));
const searchParams=new URLSearchParams(location.search);
if(searchParams.get("section")==="kids"||searchParams.get("category")==="Children")document.querySelector('[data-collection="kids"]').click();
const preselectedCategory=searchParams.get("category");
const preselectedQuery=searchParams.get("q");
if(preselectedQuery)$("#search").value=preselectedQuery.slice(0,120);
const preselectedLanguage=searchParams.get("lang");
if(preselectedLanguage)$("#language").value=preselectedLanguage.slice(0,65);
if(preselectedCategory&&Array.from($("#category").options).some(opt=>opt.value===preselectedCategory))$("#category").value=preselectedCategory;
for(const id of ["search","category","language","sort"]){$("#"+id).addEventListener(["search","language"].includes(id)?"input":"change",filterAndRender)}

document.querySelectorAll("[data-kind]").forEach(btn=>btn.addEventListener("click",()=>{app.kind=btn.dataset.kind;document.querySelectorAll("[data-kind]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));filterAndRender()}));
const fetchJSON=async (url,timeout=9500)=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{const r=await fetch(url,{signal:controller.signal,headers:{"Accept":"application/json"}});if(!r.ok)throw Error(String(r.status));return await r.json()}finally{clearTimeout(timer)}};
function loadCatalogue(){
 $("#fetch-message").textContent="";
 filterAndRender();
}
async function backend(){
  const state=$("#service-message"),signIn=$("#login-btn"),userStatus=$("#user-status");
  if(!cfg.supabaseUrl||!(cfg.supabasePublishableKey||cfg.supabaseAnonKey)){
    state.textContent="Sign-in settings are unavailable. Please contact the ReadMalawi librarian.";
    userStatus.textContent="Secure sign-in is not ready.";
    return;
  }
  state.textContent="Connecting secure email sign-in…";
  try{
    const mod=await getSupabaseModule();
    app.client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey||cfg.supabaseAnonKey);
    app.backend=true;
    state.className="notice";
    state.textContent="Secure sign-in is ready. Enter your email and tap Email sign-in.";
    signIn.disabled=false;
    userStatus.textContent="Checking if you are already signed in…";
    app.client.auth.onAuthStateChange((_event,session)=>{updateUser(session?.user||null)});
    // Do not leave the email button blocked if restoring an old session is slow.
    try{
      const session=await Promise.race([
        app.client.auth.getSession(),
        new Promise((_,reject)=>setTimeout(()=>reject(new Error("Session check timed out")),9000))
      ]);
      updateUser(session.data?.session?.user||null);
    }catch(e){
      userStatus.textContent="You can still enter your email and request a secure sign-in link.";
    }
    await loadApproved();
  }catch(err){
    state.className="notice";
    state.textContent="Sign-in connection unavailable: "+err.message;
    userStatus.textContent="Please refresh this page to try again. If it persists, try Chrome without browser-blocking extensions.";
  }
}
function updateUser(user){
 app.user=user;
 $("#user-status").textContent=user?"Signed in as "+user.email:"Sign in for book discussions or library administration.";
 $("#logout-btn").classList.toggle("hide",!user);
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
 app.catalogueReady=true;
 if(error){$("#fetch-message").textContent="Book catalogue unavailable: "+error.message;return}
 app.local=[...originalStories,...officialSourceBooks,...(data||[]).map(b=>({...b,kind:b.media_type==="audiobook"?"audio":"book",storage_path:b.file_path,source:"member",discussion_key:"member:"+b.id,rank:2}))];filterAndRender();
}
// The catalogue renderer is synchronous; it has no Promise to catch.
// Start authentication independently so a catalogue rendering fault cannot disable sign-in.
backend().catch(error=>{
  const state=$("#service-message");
  if(state)state.textContent="Library sign-in could not start. Please refresh or open this page in Chrome.";
});
try {
  loadCatalogue();
} catch(error) {
  const message=$("#fetch-message");
  if(message)message.textContent="The book list could not load. Email sign-in is still available.";
}
