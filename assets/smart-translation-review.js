/* ReadMalawi private browser-side translation QA, no draft uploads. */
"use strict";
const $=id=>document.getElementById(id),cfg=window.READMALAWI_CONFIG||{};
const W="http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const unique=a=>[...new Set(a)];
let library=[],pairs=[],authorised=false;
const htmlEscape=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const key=s=>String(s||"").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
const note=(id,message)=>{$(id).textContent=message};
async function secure(){
  if(!cfg.supabaseUrl||!(cfg.supabasePublishableKey||cfg.supabaseAnonKey)){note("auth-status","Library configuration unavailable.");return;}
  try{
    const mod=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const db=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey||cfg.supabaseAnonKey);
    const auth=await db.auth.getUser(),user=auth.data?.user;
    if(!user){note("auth-status","Please sign in on the library page, then return.");return}
    const {data,error}=await db.from("readmalawi_admins").select("user_id").eq("user_id",user.id).maybeSingle();
    if(error||!data){note("auth-status","Only authorised ReadMalawi librarians can use this private review tool.");return}
    authorised=true;note("auth-status","Authorised ReadMalawi librarian: "+user.email);
    $("workspace").classList.remove("hide");
    await loadGlossary();
  }catch(err){note("auth-status","Unable to verify librarian access: "+err.message)}
}
async function loadGlossary(){
  try{
    const res=await fetch("chichewa-glossary.json",{cache:"no-store"});
    if(!res.ok)throw Error("Glossary unavailable");
    const payload=await res.json();
    if(!Array.isArray(payload.entries))throw Error("Vocabulary is invalid");
    library=payload.entries.filter(row=>Array.isArray(row)&&row.length===3).slice(0,800);
    renderGlossary();
  }catch(err){note("dictionary-count","The glossary could not be loaded: "+err.message)}
}
function renderGlossary(){
  const term=key($("dictionary-search").value),out=$("dictionary-results");
  out.replaceChildren();
  const list=library.filter(entry=>!term||entry.some((x,i)=>i<2&&key(x).includes(term))).slice(0,term?40:12);
  note("dictionary-count",library.length+" provisional English–Chichewa entries · Showing "+list.length+" · Not yet certified by a language editor.");
  for(const [en,ny,part] of list){
    const card=document.createElement("div");card.className="term";
    const left=document.createElement("b"),right=document.createElement("span"),label=document.createElement("small");
    left.textContent=en;right.textContent=ny;label.textContent=part+" · check sentence context";label.className="muted";
    card.append(left,right,label);out.append(card);
  }
  if(!list.length){out.textContent="No matching starter entry. A fluent speaker may need to add this word.";}
}
/* Extract word/document.xml directly from the DOCX ZIP using native browser APIs.
   The document never leaves the user's device. */
async function docxXml(file){
  const bytes=new Uint8Array(await file.arrayBuffer());
  const d=new DataView(bytes.buffer);
  let eocd=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){
    if(d.getUint32(i,true)===0x06054b50){eocd=i;break}
  }
  if(eocd<0)throw Error("Not a valid Word DOCX document.");
  let at=d.getUint32(eocd+16,true);
  const entries=d.getUint16(eocd+10,true);
  let start=-1,size=0,method=0;
  for(let n=0;n<entries;n++){
    if(at+46>bytes.length||d.getUint32(at,true)!==0x02014b50)throw Error("Damaged Word ZIP index.");
    const length=d.getUint16(at+28,true),extra=d.getUint16(at+30,true),comment=d.getUint16(at+32,true);
    const name=new TextDecoder().decode(bytes.subarray(at+46,at+46+length));
    if(name==="word/document.xml"){
      start=d.getUint32(at+42,true);
      size=d.getUint32(at+20,true);
      method=d.getUint16(at+10,true);break;
    }
    at+=46+length+extra+comment;
  }
  if(start<0||size>5*1024*1024)throw Error("Word document text not found or too large.");
  if(d.getUint32(start,true)!==0x04034b50)throw Error("Invalid DOCX ZIP header.");
  const nameLength=d.getUint16(start+26,true),extraLength=d.getUint16(start+28,true);
  const offset=start+30+nameLength+extraLength;
  if(offset+size>bytes.length)throw Error("DOCX content is incomplete.");
  const compressed=bytes.slice(offset,offset+size);
  let decompressed;
  if(method===0)decompressed=compressed;
  else if(method===8){
    if(typeof DecompressionStream==="undefined")throw Error("Your browser cannot read DOCX locally. Try a recent Chrome or Edge browser.");
    let stream;
    try{stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));}
    catch(e){throw Error("Your browser lacks ZIP decompression. Use recent Chrome or Edge.")}
    decompressed=new Uint8Array(await new Response(stream).arrayBuffer());
  }else throw Error("Unsupported Word compression method.");
  if(decompressed.byteLength>12*1024*1024)throw Error("Document is larger than the safe review limit.");
  return new TextDecoder("utf-8").decode(decompressed);
}
function textOf(node){
  return Array.from(node.getElementsByTagNameNS(W,"t")).map(x=>x.textContent||"").join("").trim();
}
function storyName(value){
  const text=value.replace(/^\d{1,2}\.\s*/,"").trim();
  return text.replace(/\s+\/+\s+.*/,"").trim();
}
function parseDocument(xml,filename){
  const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.querySelector("parsererror"))throw Error("Word text XML is not valid.");
  const body=doc.getElementsByTagNameNS(W,"body")[0];if(!body)throw Error("No Word document body was found.");
  const results=[];let story="Unsorted text";let section=0;
  for(const block of Array.from(body.children)){
    if(block.localName==="p"){
      const t=textOf(block).trim();
      if(/^\d{1,2}\.\s+.+/.test(t)&&t.length<130){story=storyName(t);section++;}
      continue;
    }
    if(block.localName!=="tbl")continue;
    const rows=Array.from(block.children).filter(x=>x.localName==="tr")
      .map(row=>Array.from(row.children).filter(x=>x.localName==="tc").map(textOf));
    if(rows.length<2)continue;
    const header=rows[0].map(key);
    const a=header.findIndex(x=>x.includes("english"));
    const b=header.findIndex(x=>x.includes("chichewa"));
    if(a<0||b<0)continue;
    for(const [i,row] of rows.entries()){
      if(i===0||!row[a]&&!row[b])continue;
      const english=(row[a]||"").trim(),chichewa=(row[b]||"").trim();
      if(!english&&!chichewa)continue;
      results.push({story,english,chichewa,file:filename,number:i,section});
    }
  }
  return results;
}
const named=["Chisomo","Tione","Memory","Thoko","Tadala","Chikondi","Peter","Thandi","Sella","Mwayi","Esnart","Ruth","Kamuzu","Patrick","Lina","Banda"];
function flags(row){
  const en=row.english,ny=row.chichewa;
  const out=[];
  if(!ny.trim())return ["Chichewa translation is missing"];
  if(!en.trim())return ["English source is missing"];
  if(key(en)===key(ny)&&en.length>20)out.push("The translation is identical to the English original");
  const enNums=en.match(/\b\d+\b/g)||[],nyNums=ny.match(/\b\d+\b/g)||[];
  if(enNums.length && enNums.some(n=>!nyNums.includes(n)))out.push("Check that all written numbers are preserved");
  for(const name of named){
    if(new RegExp("\\b"+name+"\\b","i").test(en)&&!new RegExp("\\b"+name+"\\b","i").test(ny))out.push("Name may be missing: "+name);
  }
  const ratio=ny.length/Math.max(1,en.length);
  if(en.length>45&&(ratio<0.43||ratio>2.3))out.push("Translation is much shorter or longer than the source");
  if(/[“”]/.test(en)&&!/[“”"«»]/.test(ny))out.push("Dialogue/quotation punctuation may be missing");
  const englishOnly=(ny.match(/\b(?:because|although|however|which|should|would|therefore|inside|outside|teacher|child|children|market|read|book|story)\b/gi)||[]);
  if(englishOnly.length>=2)out.push("Possible untranslated English words");
  if(en.length>150&&ny.length<40)out.push("Possible omitted sentence or paragraph");
  return unique(out);
}
function renderPairs(){
  const out=$("results");out.replaceChildren();if(!pairs.length)return;
  const which=$("filter").value,q=key($("pair-search").value);
  let showing=pairs.filter(x=>(which==="all"||(which==="flagged"?x.warnings.length>0:x.warnings.length===0))&&(!q||key([x.english,x.chichewa,x.story].join(" ")).includes(q)));
  const total=showing.length;showing=showing.slice(0,150);
  if(!showing.length){out.textContent="No passages match. Try “All paragraphs” to inspect a sample of the rest.";return}
  const legend=document.createElement("p");legend.className="small muted";
  legend.textContent="Showing "+showing.length+" of "+total+" matching passages. These checks do not verify grammar or meaning.";
  out.append(legend);
  for(const x of showing){
    const card=document.createElement("article");card.className="pair"+(x.warnings.length?" warn":"");
    const meta=document.createElement("div");meta.className="pair-meta";
    const a=document.createElement("span");a.textContent=x.story+" · row "+x.number;meta.append(a);
    const c=document.createElement("span");c.className="chip"+(x.warnings.length?" warn":"");
    c.textContent=x.warnings.length?x.warnings.length+" possible issue(s)":"No basic issues detected";meta.append(c);
    const body=document.createElement("div");body.className="two";
    const en=document.createElement("div"),ny=document.createElement("div");
    const eh=document.createElement("h3"),nh=document.createElement("h3");
    eh.textContent="English original";nh.textContent="Unreviewed Chichewa";
    const ep=document.createElement("p"),np=document.createElement("p");
    ep.textContent=x.english;np.textContent=x.chichewa;
    en.append(eh,ep);ny.append(nh,np);body.append(en,ny);
    card.append(meta,body);
    if(x.warnings.length){const reasons=document.createElement("p");reasons.className="reason";reasons.textContent=x.warnings.join(" · ");card.append(reasons);}
    out.append(card);
  }
}
async function scan(){
  if(!authorised)return;
  const files=Array.from($("word-files").files||[]);
  if(!files.length){note("scan-status","Select the Word review file(s) first.");return}
  if(files.length>10){note("scan-status","Please select no more than ten Word files.");return}
  $("scan").disabled=true;note("scan-status","Checking the English and Chichewa columns locally…");
  const all=[],errors=[];
  for(const file of files){
    if(!/\.docx$/i.test(file.name)||file.size>8*1024*1024){errors.push(file.name+": not a supported DOCX under 8 MB.");continue;}
    try{
      const extracted=parseDocument(await docxXml(file),file.name);
      if(!extracted.length)errors.push(file.name+": no bilingual Word tables detected.");
      all.push(...extracted);
    }catch(err){errors.push(file.name+": "+err.message);}
  }
  pairs=all.map((x,i)=>({...x,id:i+1,warnings:flags(x)}));
  const flagged=pairs.filter(x=>x.warnings.length);
  const stories=unique(pairs.map(x=>x.story));
  $("counts").classList.toggle("hide",!pairs.length);
  $("pair-count").textContent=String(pairs.length);
  $("flag-count").textContent=String(flagged.length);
  $("story-count").textContent=String(stories.length);
  $("export").disabled=!pairs.length;
  note("scan-status",pairs.length+" English–Chichewa pairs checked from "+files.length+" file(s). "+flagged.length+" flagged for closer review."+(errors.length?" Issues: "+errors.join(" "):""));
  $("scan").disabled=false;
  renderPairs();
}
function saveReport(){
  if(!pairs.length)return;
  const header=["File","Story","Row","English","Chichewa draft","Number of flags","Possible problems"];
  const safe=v=>{
    const s=String(v??"").replace(/[\t\r\n]+/g," ").trim();
    return /^[=+\-@]/.test(s)?"'"+s:s;
  };
  const tsv=[header,...pairs.map(p=>[p.file,p.story,p.number,p.english,p.chichewa,p.warnings.length,p.warnings.join("; ")])]
    .map(row=>row.map(safe).join("\t")).join("\r\n");
  const blob=new Blob(["\uFEFF",tsv],{type:"text/tab-separated-values;charset=utf-8"});
  const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="ReadMalawi_Chichewa_Review_Flags.tsv";
  link.click();setTimeout(()=>URL.revokeObjectURL(link.href),3000);
}
$("scan").addEventListener("click",scan);
$("filter").addEventListener("change",renderPairs);
$("pair-search").addEventListener("input",renderPairs);
$("dictionary-search").addEventListener("input",renderGlossary);
$("export").addEventListener("click",saveReport);
secure();
