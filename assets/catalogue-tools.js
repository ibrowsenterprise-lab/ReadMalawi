// Shared, deterministic catalogue tools. No AI claims or publication changes.
export const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
export function cleanBook(raw){
 const b={...raw};b.original_title=raw.title||'';
 b.title=String(raw.title||'Untitled book').replace(/\.(pdf|epub)$/i,'').replace(/\(BookFi\)/gi,'').replace(/_/g,' ').replace(/\s+/g,' ').trim();
 const bracket=b.title.match(/^\[([^\]]+)\]\s*(.+)$/);
 // Preserve an unverified author in the review suggestion, not as verified metadata.
 if(bracket){b.suggested_author=bracket[1];b.title=bracket[2]}
 if((b.title.match(/-/g)||[]).length>=3&&!/\s-\s/.test(b.title))b.title=b.title.replace(/-/g,' ');
 if(b.title.length>5&&b.title===b.title.toUpperCase())b.title=b.title.toLowerCase().replace(/\b\p{L}/gu,c=>c.toUpperCase());
 b.author=String(b.author||'').replace(/_/g,' ').trim();
 return b;
}
export async function loadPublicCatalogue(cfg){
 const all=[];let offset=0;const seen=new Set();
 // A small page handles server-side response caps without silently truncating the collection.
 for(let page=0;page<200;page++){
  const query=new URLSearchParams({select:'id,title,author,description,media_type,category,language,file_path,access_mode,origin',status:'eq.approved',order:'id.asc',offset:String(offset),limit:'100'});
  const r=await fetch(cfg.supabaseUrl+'/rest/v1/library_books?'+query,{headers:{apikey:cfg.supabasePublishableKey||cfg.supabaseAnonKey},signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error('Catalogue connection unavailable');
  const data=await r.json();if(!Array.isArray(data))throw Error('Invalid catalogue response');
  if(!data.length)return all;
  let added=0;for(const row of data)if(row?.id&&!seen.has(row.id)){seen.add(row.id);all.push(row);added++}
  if(!added)throw Error('Catalogue pagination did not advance');
  offset+=data.length;
 }
 throw Error('Collection is too large to load safely; contact the librarian.');
}
const filler=new Set('i we you me my our want need would like find show looking look for a an the and or to of in on with please books book read reading recommend recommendations suggest something about available can do have is it that this beginner beginners short long novel novels explain why give some'.split(' '));
export function scoreBooks(books,phrase){
 let q=norm(phrase).replace(/novels?/g,'fiction').replace(/business|entrepreneurship|entrepreneur/g,'business').replace(/nyanja/g,'chichewa');
 const words=[...new Set(q.split(' ').filter(w=>w.length>1&&!filler.has(w)))];
 const asksAfrican=/\b(african|africa|malawian|malawi)\b/.test(q);
 const terms=words.filter(w=>!['african','africa','malawian','malawi'].includes(w));
 return books.map(book=>{
 const title=norm(book.title),author=norm(book.author),category=norm(book.category),language=norm(book.language),desc=norm(book.description);
 let hits=0,score=0;
 for(const w of terms){const n=title.includes(w)?6:author.includes(w)?5:language.includes(w)?5:category.includes(w)?3:desc.includes(w)?1:0;if(n){hits++;score+=n}}
 // Explicit editorial provenance only; never infer origin from a person's name.
 const african=book.origin==='Malawian'||book.region==='Africa'||/\bafrica|malawi\b/.test(title+' '+desc);
 if(asksAfrican&&african)score+=4;
 const threshold=terms.length<=2?terms.length:Math.ceil(terms.length*.55);
 const matches=terms.length?hits>=threshold:asksAfrican?african:false;
 return {book,score,matches:matches&&(!asksAfrican||african)};
 }).filter(x=>x.matches&&x.score>0).sort((a,b)=>b.score-a.score||a.book.title.localeCompare(b.book.title));
}
export function reviewIssues(b){
 const issues=[];if(!b.author||/^unknown(?: author)?$/i.test(b.author.trim()))issues.push('Author needs verification');
 if(!b.description?.trim())issues.push('Description needs a source-text review');
 if(!b.language||b.language==='Unconfirmed')issues.push('Language unconfirmed');
 const cleaned=cleanBook(b);if(cleaned.title!==b.title)issues.push('Title contains filename formatting');
 if(cleaned.suggested_author)issues.push('Author appears in filename; verify against title page');
 if(!b.verified_rights)issues.push('Publication permission evidence needs librarian review');
 return issues;
}
