// ReadMalawi curated reading-list filter.
// All parsing and matching happen locally in the browser; importing a CSV does NOT upload it.
export function parseCatalogueCSV(text){
 const rows=[];let row=[],field="",quoted=false;
 const str=String(text||"").replace(/^\uFEFF/,"");
 for(let i=0;i<str.length;i++){
  const c=str[i];
  if(quoted){
   if(c==='"' && str[i+1]==='"'){field+='"';i++}
   else if(c==='"')quoted=false;
   else field+=c;
  }else if(c==='"'){if(field)throw Error("Malformed CSV quotes");quoted=true}
  else if(c===","){row.push(field);field=""}
  else if(c==="\n"||c==="\r"){
   if(c==="\r"&&str[i+1]==="\n")i++;
   row.push(field);field="";
   if(row.some(x=>x.trim()!==""))rows.push(row);
   row=[];
  }else field+=c;
 }
 if(quoted)throw Error("Unclosed CSV quotation");
 if(field!==""||row.length){row.push(field);if(row.some(x=>x.trim()!==""))rows.push(row)}
 if(!rows.length)throw Error("The catalogue CSV is empty");
 const fields=rows[0].map(s=>s.trim().toLowerCase());
 const required=["file_name","file_size_bytes","title","author"];
 for(const column of required)if(!fields.includes(column))throw Error("Missing required CSV column: "+column);
 if(rows.length>15000)throw Error("Catalogue is too large for this browser tool");
 return rows.slice(1).map((values,i)=>{
  const rec={};
  fields.forEach((key,k)=>rec[key]=String(values[k]??"").trim());
  rec._csv_row=i+2;
  return rec;
 });
}
function cleanExcelPrefix(value){
 let s=String(value??"").trim();
 if(s.startsWith("'")&&/^[=+@\-\t\r]/.test(s.slice(1)))s=s.slice(1);
 return s;
}
export function catalogueKey(name,bytes){
 const n=cleanExcelPrefix(name).normalize("NFKC").trim().toLocaleLowerCase("en-US");
 return n+"\u001F"+String(bytes);
}
export function makeCatalogueAllowlist(text){
 const records=parseCatalogueCSV(text),byKey=new Map();
 let invalid=0;
 for(const r of records){
  const bytes=Number(r.file_size_bytes);
  if(!/\.pdf$/i.test(cleanExcelPrefix(r.file_name))||!Number.isSafeInteger(bytes)||bytes<1||bytes>50*1024*1024){invalid++;continue}
  const key=catalogueKey(r.file_name,bytes);
  if(!byKey.has(key))byKey.set(key,[]);
  byKey.get(key).push(r);
 }
 if(!byKey.size)throw Error("No usable PDF filename and size combinations in this catalogue");
 return {byKey,records:records.length,valid:records.length-invalid,invalid};
}
export function matchCatalogueFiles(items,allowlist){
 const tally=new Map(),accepted=[],excluded=[];
 for(const item of items){
  const f=item.file;
  const key=catalogueKey(f.name,f.size);
  const allowed=allowlist.byKey.get(key)||[];
  const index=tally.get(key)||0;
  if(index<allowed.length){
   const meta=allowed[index];
   tally.set(key,index+1);
   accepted.push({...item,meta});
  }else excluded.push(item);
 }
 return {accepted,excluded,total:items.length};
}
