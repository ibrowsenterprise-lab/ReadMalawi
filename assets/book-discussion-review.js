const $=id=>document.getElementById(id);
const cfg=window.READMALAWI_CONFIG||{};
const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
let client=null,authorised=false;
function status(message){$("auth-status").textContent=message}
async function init(){
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){status("Review tools are not configured.");return}
 try{
 const mod=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
 client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
 const result=await client.auth.getUser(),user=result.data?.user;
 if(!user){status("Please sign in on the library page, then return.");return}
 const {data,error}=await client.from("readmalawi_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(error||!data){status("This account is not an authorised librarian.");return}
 authorised=true;status("Authorised librarian — "+user.email);
 $("refresh").disabled=false;await load();
 }catch(e){status("Unable to connect: "+e.message)}
}
const action=(label,onClick,style="")=>{const n=el("button","button "+style,label);n.type="button";n.addEventListener("click",()=>onClick(n));return n};
async function changeCommentStatus(id,next,button){
 if(next!=="approved"&&!confirm("Keep this comment out of the public discussion?"))return;
 button.disabled=true;
 const {error}=await client.from("readmalawi_book_comments").update({status:next}).eq("id",id);
 if(error){alert("Could not save: "+error.message);button.disabled=false;return}
 await load();
}
function commentCard(c){
 const item=el("article","item");
 item.append(el("h3","",c.book_title||"Book discussion"));
 item.append(el("p","meta",[c.book_author||"","Status: "+c.status,new Date(c.created_at).toLocaleString()].filter(Boolean).join(" · ")));
 item.append(el("p","",c.body));
 if(c.reply_to)item.append(el("p","meta","This is a reply to another reader's comment."));
 const row=el("div","row");
 row.append(action("Approve & publish",b=>changeCommentStatus(c.id,"approved",b)));
 row.append(action("Reject",b=>changeCommentStatus(c.id,"rejected",b),"danger"));
 item.append(row);return item;
}
async function load(){
 if(!authorised)return;
 $("pending").replaceChildren();$("reports").replaceChildren();
 $("pending-count").textContent="Loading…";$("reports-count").textContent="Loading…";
 const [pending,flagged]=await Promise.all([
 client.from("readmalawi_book_comments").select("id,book_key,book_title,book_author,body,reply_to,status,created_at").eq("status","pending").order("created_at",{ascending:true}).limit(100),
 client.from("readmalawi_book_comment_reports").select("id,comment_id,reason,status,reported_at").eq("status","open").order("reported_at",{ascending:true}).limit(100)
 ]);
 if(pending.error){$("pending-count").textContent="Unable to fetch comments: "+pending.error.message}
 else{
 $("pending-count").textContent=pending.data.length+" awaiting review"+(pending.data.length===100?" · Showing first 100":"");
 if(!pending.data.length)$("pending").append(el("p","meta","Nothing waiting. New reader comments appear here."));
 for(const c of pending.data)$("pending").append(commentCard(c));
 }
 if(flagged.error){$("reports-count").textContent="Unable to fetch reports: "+flagged.error.message;return}
 const reports=flagged.data||[];
 $("reports-count").textContent=reports.length+" open report(s)"+(reports.length===100?" · Showing first 100":"");
 if(!reports.length){$("reports").append(el("p","meta","No reported comments at the moment."));return}
 const ids=[...new Set(reports.map(x=>x.comment_id))],related=await client.from("readmalawi_book_comments").select("id,book_title,body,status,created_at").in("id",ids);
 if(related.error){$("reports-count").textContent="Unable to see reported comments: "+related.error.message;return}
 const byId=new Map((related.data||[]).map(x=>[x.id,x]));
 for(const r of reports){
 const c=byId.get(r.comment_id),item=el("article","item");
 item.append(el("h3","",c?.book_title||"Book comment"));
 item.append(el("p","meta","Report: "+r.reason+" · "+new Date(r.reported_at).toLocaleString()+(c?" · Comment status: "+c.status:"")));
 item.append(el("p","",c?.body||"The comment is no longer available."));
 const row=el("div","row");
 if(c&&c.status==="approved")row.append(action("Hide comment",async b=>{
 if(!confirm("Hide this comment from all public readers?"))return;
 b.disabled=true;
 const {error}=await client.from("readmalawi_book_comments").update({status:"hidden"}).eq("id",c.id);
 if(error){alert("Unable to hide: "+error.message);b.disabled=false;return}
 await load();
 },"danger"));
 row.append(action("Mark report reviewed",async b=>{
 b.disabled=true;
 const {error}=await client.from("readmalawi_book_comment_reports").update({status:"reviewed"}).eq("id",r.id);
 if(error){alert("Unable to resolve report: "+error.message);b.disabled=false;return}
 await load();
 },"alt"));
 item.append(row);$("reports").append(item);
 }
}
$("refresh").addEventListener("click",load);
init();