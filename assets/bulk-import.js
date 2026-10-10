const $=id=>document.getElementById(id);
let work=[],draft=[],cancelled=false,active=false;
const valid=f=>/\.pdf$/i.test(f.name)&&f.size>0;
function selected(){const list=[...$("files").files,...$("folder").files].filter(valid);const seen=new Set();return list.filter(f=>{const key=[f.webkitRelativePath||f.name,f.size,f.lastModified].join(":");if(seen.has(key))return false;seen.add(key);return true})}
function summary(){$("selection").textContent=selected().length+" PDF files selected"}
$("files").addEventListener("change",summary);$("folder").addEventListener("change",summary);
$("cancel").addEventListener("click",()=>{cancelled=true;$("status").textContent="Stopping after the current PDF…"});
const displayName=n=>n.replace(/\.pdf$/i,"").replace(/[_]+/g," ").replace(/\s*\([^)]*\)(?=\s|$)/g," ").replace(/\s+/g," ").trim();
const sensible=s=>s&&s.trim().length>2&&!/^(microsoft word|adobe|untitled|document|scan|pdf|unknown|ebook|book|\d+)$/i.test(s.trim());
const categoryFrom=text=>{const t=text.toLowerCase();const words=[
["Technology",/computer|digital|programming|software|technology|artificial intelligence|data science/],
["Science",/science|biology|physics|chemistry|ecology|mathematics|geography/],
["History",/history|historical|colonial|malawi history|ancient/],
["Education",/education|school|textbook|teaching|curriculum|classroom|learning/],
["Children",/children|childhood|kids|nursery|fairy tale|young reader/],
["Poetry",/poetry|poems|verse|sonnet/],
["Biography",/biography|memoir|autobiography|life of/],
["Religion",/bible|christian|islam|quran|religion|theology|church/],
["Language",/chichewa|chitumbuka|chiyao|grammar|dictionary|language|linguistics/],
["Fiction",/fiction|novel|stories|romance|mystery|adventure/]];
return words.find(([_,re])=>re.test(t))?.[0]||"Other"};
const inferLang=(pdfMeta,text)=>{const s=(pdfMeta||"").toLowerCase();if(/^(en|en-|english)/.test(s))return"English";if(/^(ny|ny-|chichewa)/.test(s))return"Chichewa";if(/^(tum|tum-|tumbuka|chitumbuka)/.test(s))return"Chitumbuka";const t=" "+text.toLowerCase()+" ";if((t.match(/\b(ndi|kuti|anthu|buku|chifukwa|amene|pamene|ndipo)\b/g)||[]).length>=7)return"Chichewa";return"Unconfirmed"};
const clean=s=>(s||"").replace(/\s+/g," ").trim().slice(0,240);
async function scan(file,mod){
 const data=new Uint8Array(await file.arrayBuffer());let doc;
 try {
 doc=await mod.getDocument({data,disableFontFace:true,useSystemFonts:false}).promise;
 const info=await doc.getMetadata().catch(()=>({info:{},metadata:null}));
 const meta=info?.info||{},parts=[];
 for(let n=1;n<=Math.min(doc.numPages,2);n++){
  const page=await doc.getPage(n);
  const content=await page.getTextContent({normalizeWhitespace:true});
  parts.push(content.items.filter(i=>typeof i.str==="string").map(i=>i.str).join(" "));
  page.cleanup();
 }
 const first=clean(parts.join(" ")),cover=parts[0]||"";
 const by=cover.match(/\b(?:by|author\s*:?|written by)\s+([A-Z][\p{L}\p{M}\-'\. ]{3,65})(?:\s+ISBN|\s+edition|\s+copyright|\s+published|\s{3}|$)/iu);
 const titleMeta=clean(meta.Title),authorMeta=clean(meta.Author);
 const coverHead=cover.split(/[\n\r]+/).map(clean).find(s=>s.length>6&&s.length<100&&!/^isbn|www\.|http|by |copyright/i.test(s));
 const name=displayName(file.name);
 const title=sensible(titleMeta)?titleMeta:sensible(coverHead)&&coverHead.length<100?coverHead:name;
 const author=sensible(authorMeta)?authorMeta:by?clean(by[1]):"Unknown";
 const isbn=(first.match(/\bISBN(?:-1[03])?\s*[:#]?\s*((?:97[89][\s-]?)?[\d\s-]{9,20}[\dXx])\b/i)||[])[1]||"";
 const subject=clean(meta.Subject||meta.Keywords||"");
 const lang=inferLang(meta.Language,first);
 const score=(sensible(titleMeta)?2:0)+(author!=="Unknown"?2:0)+(isbn?1:0)+(lang!=="Unconfirmed"?1:0);
 const quality=first.length<35?"Review - scanned/empty":score>=4?"Good":score>=2?"Check":"Review";
 return {file_name:file.name,title,author,category:categoryFrom([title,subject,first.slice(0,300)].join(" ")),language:lang,isbn:clean(isbn),subject,year:"",pages:doc.numPages,file_size_bytes:file.size,quality,rights:"Unverified",publication:"Private draft",source:"PDF metadata and first pages"};
 }finally{await doc?.destroy().catch(()=>{})}
}
function showTable(){
 $("results").hidden=!draft.length;$("count").textContent=draft.length+" book entries drafted";
 const tbody=$("rows");tbody.replaceChildren();
 for(const [i,r] of draft.slice(0,60).entries()){
  const tr=document.createElement("tr");
  for(const key of ["title","author","category","language","isbn","quality"]){
    const td=document.createElement("td");td.textContent=r[key]||"";
    if(key!=="quality"){td.contentEditable="true";td.addEventListener("input",()=>{r[key]=td.textContent.trim()})}else td.className="confidence";
    tr.appendChild(td);
  }tbody.appendChild(tr);
 }
}
$("analyse").addEventListener("click",async()=>{
 if(active)return;work=selected();if(!work.length){$("status").textContent="Choose a PDF folder or select multiple PDFs first.";return}
 active=true;cancelled=false;draft=[];$("analyse").disabled=true;$("cancel").disabled=false;$("progress").hidden=false;$("progress").max=work.length;$("progress").value=0;
 let failed=0,mod;
 try{
  $("status").textContent="Loading local PDF extraction tools…";
  mod=await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.mjs");
  mod.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.mjs";
  for(const [i,f] of work.entries()){
   if(cancelled)break;
   $("status").textContent="Reading "+(i+1)+"/"+work.length+": "+f.name;
   try{const row=await scan(f,mod);draft.push(row)}
   catch(e){failed++;draft.push({file_name:f.name,title:displayName(f.name),author:"Unknown",category:"Other",language:"Unconfirmed",isbn:"",subject:"",year:"",pages:"",file_size_bytes:f.size,quality:"Review - unreadable PDF",rights:"Unverified",publication:"Private draft",source:"Filename only"})}
   $("progress").value=i+1;
   if(i%5===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  $("status").textContent=draft.length+" entries processed, "+failed+" need file inspection. "+(cancelled?"Stopped early. ":"")+"Download the CSV to keep your catalogue. No PDF was uploaded to ReadMalawi.";
  showTable();
 }catch(err){$("status").textContent="Could not start PDF analysis: "+err.message+". Check internet access for the PDF reader library."}
 finally{active=false;$("analyse").disabled=false;$("cancel").disabled=true}
});
$("clear").addEventListener("click",()=>{draft=[];showTable();$("progress").hidden=true;$("status").textContent="Draft cleared. The original PDFs remain on your computer."});
function cell(x){let s=String(x??"");if(/^[=+@\-\t\r]/.test(s))s="'"+s;return'"'+s.replace(/"/g,'""')+'"'}
$("download").addEventListener("click",()=>{
 if(!draft.length)return;
 const fields=["file_name","title","author","category","language","isbn","subject","year","pages","file_size_bytes","quality","rights","publication","source"];
 const csv="\uFEFF"+fields.join(",")+"\r\n"+draft.map(r=>fields.map(k=>cell(r[k])).join(",")).join("\r\n");
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="readmalawi-books-draft-"+new Date().toISOString().slice(0,10)+".csv";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
});
summary();