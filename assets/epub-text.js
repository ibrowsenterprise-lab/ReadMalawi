// Extract text only; EPUB scripts, embedded frames and network resources are never rendered.
function xml(text){const d=new DOMParser().parseFromString(text,'application/xml');if(d.querySelector('parsererror'))throw Error('Invalid EPUB structure');return d}
export async function readEPUB(bytes,zipModule){
 const {unzip,strFromU8}=zipModule||await import('https://cdn.jsdelivr.net/npm/fflate@0.8.3/esm/browser.js');
 let expanded=0;const files=await new Promise((resolve,reject)=>unzip(bytes,{filter:f=>{expanded+=f.originalSize;if(expanded>30*1024*1024||f.originalSize>8*1024*1024)throw Error('EPUB expands beyond the safe reading limit');return /\.(xml|opf|xhtml|html|htm)$/i.test(f.name)}},(err,out)=>err?reject(err):resolve(out)));
 const read=name=>{if(!files[name])throw Error('EPUB section missing');return strFromU8(files[name])};
 const container=xml(read('META-INF/container.xml'));const root=container.getElementsByTagNameNS('*','rootfile')[0]?.getAttribute('full-path');if(!root)throw Error('EPUB content directory missing');
 const opf=xml(read(root)),base=root.includes('/')?root.slice(0,root.lastIndexOf('/')+1):'';
 const manifest=new Map([...opf.getElementsByTagNameNS('*','item')].map(n=>[n.getAttribute('id'),n.getAttribute('href')]));
 const sections=[];for(const item of [...opf.getElementsByTagNameNS('*','itemref')].slice(0,600)){
  if(item.getAttribute('linear')==='no')continue;const href=manifest.get(item.getAttribute('idref'));if(!href)continue;
  const url=new URL(base+href,'https://epub.invalid/');if(url.origin!=='https://epub.invalid')throw Error('External EPUB content is not supported');
  const path=decodeURIComponent(url.pathname.slice(1));const doc=new DOMParser().parseFromString(read(path),'text/html');
  doc.querySelectorAll('script,style,iframe,object,svg,nav').forEach(n=>n.remove());
  const blocks=[...doc.body.querySelectorAll('h1,h2,h3,p,li,blockquote,pre')].filter(n=>!n.parentElement?.closest('p,li,blockquote,pre')).map(n=>n.textContent.trim()).filter(Boolean);
  const content=blocks.join('\n\n')||doc.body.textContent.trim();if(content)for(let i=0;i<content.length;i+=12000)sections.push(content.slice(i,i+12000));
 }
 if(!sections.length)throw Error('No readable EPUB text found; the file may be protected');return sections;
}
