const $=id=>document.getElementById(id);
const cfg=window.READMALAWI_CONFIG||{},params=new URLSearchParams(location.search);
const key=params.get("book")||"",title=(params.get("title")||"").trim().slice(0,240),author=(params.get("author")||"").trim().slice(0,180);
const supported=/^(?:member:[a-f0-9-]{36}|gutenberg:\d{1,12}|librivox:\d{1,12})$/.test(key) && title.length>=2;
let client=null,user=null,replyTo=null,offset=0,seen=[],loading=false;
$("book-title").textContent=title||"Book discussion";
$("book-author").textContent=author?"By "+author:"ReadMalawi Book Club";
const el=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
function msg(id,value){$(id).textContent=value}
function authView(){
 $("signin").hidden=!!user;$("signedin").hidden=!user;
 $("signedin-status").textContent=user?"Signed in privately. Your comments appear after a librarian reviews them.":"";
}
async function init(){
 if(!supported){msg("discussion-summary","Choose a book from the ReadMalawi library to start a discussion.");$("write").hidden=true;return}
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){msg("discussion-summary","Discussions are temporarily unavailable.");$("write").hidden=true;return}
 try{
  const module=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  client=module.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
  $("login-button").disabled=false;
  const a=await client.auth.getUser();
  user=a.data?.user||null;
  client.auth.onAuthStateChange((evt,s)=>{user=s?.user||null;authView()});
  authView();await fetchPage();
 }catch(err){msg("discussion-summary","Could not connect to book discussions. Please try again later.")}
}
function clearReply(){replyTo=null;$("reply-indicator").hidden=true;$("comment-body").placeholder="I liked this book because…"}
$("cancel-reply").addEventListener("click",clearReply);
function setReply(item){
 if(!user){msg("post-status","Please sign in to reply. A parent or guardian should help younger readers.");$("login-email").focus();document.getElementById("write").scrollIntoView({behavior:"smooth"});return}
 replyTo=item.id;$("reply-indicator").hidden=false;$("reply-label").textContent="Replying to a reader's comment";
 $("comment-body").placeholder="My reply is…";
 document.getElementById("write").scrollIntoView({behavior:"smooth"});$("comment-body").focus();
}
async function report(item){
 if(!user){msg("post-status","Please sign in to report a comment. A parent or guardian can help.");document.getElementById("write").scrollIntoView({behavior:"smooth"});return}
 if(!confirm("Send this comment to the librarian for a safety review?"))return;
 const {error}=await client.from("readmalawi_book_comment_reports").insert({comment_id:item.id,reason:"Please review"});
 alert(error?("Could not send report: "+(error.code==="23505"?"You already reported this comment.":error.message)):"Thank you. A librarian will review this comment privately.");
}
function commentCard(item,isReply=false){
 const outer=el("article",isReply?"reply":"comment");
 const head=el("div","row");
 head.append(el("strong","small","📖 Reader"),el("small","",new Date(item.created_at).toLocaleDateString()));
 outer.append(head,el("p","",item.body));
 const actions=el("div","row");
 if(!isReply){const reply=el("button","text-button","↩ Reply");reply.type="button";reply.addEventListener("click",()=>setReply(item));actions.append(reply)}
 const flag=el("button","text-button","Report");flag.type="button";flag.addEventListener("click",()=>report(item));actions.append(flag);
 outer.append(actions);return outer;
}
function draw(){
 const roots=seen.filter(x=>!x.reply_to);
 const container=$("discussion-list");container.replaceChildren();
 const grouped=new Map();
 for(const item of seen.filter(x=>x.reply_to)){const arr=grouped.get(item.reply_to)||[];arr.push(item);grouped.set(item.reply_to,arr)}
 for(const root of roots){
 const node=commentCard(root);
 for(const reply of grouped.get(root.id)||[])node.append(commentCard(reply,true));
 container.append(node);
 }
 for(const orphan of seen.filter(x=>x.reply_to&&!seen.some(y=>y.id===x.reply_to))){container.append(commentCard(orphan,true))}
 msg("discussion-summary",seen.length?(seen.length+" approved comment"+(seen.length===1?"":"s")+" loaded."):"No comments published yet. Share the first thought!");
}
async function fetchPage(){
 if(loading||!client)return;loading=true;$("load-more").disabled=true;
 const {data,error}=await client.from("readmalawi_book_comments")
 .select("id,body,reply_to,created_at,status").eq("book_key",key).eq("status","approved")
 .order("created_at",{ascending:true}).range(offset,offset+79);
 if(error)msg("discussion-summary","Unable to load comments: "+error.message);
 else{seen.push(...(data||[]));offset+=data?.length||0;draw();$("load-more").hidden=(data||[]).length<80}
 loading=false;$("load-more").disabled=false;
}
$("load-more").addEventListener("click",fetchPage);
$("login-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!client)return;
 $("login-button").disabled=true;msg("post-status","Sending your sign-in link…");
 const email=$("login-email").value.trim();
 const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.href.split("#")[0]}});
 msg("post-status",error?"Unable to sign in: "+error.message:"Check your email for a secure sign-in link. Then return here.");
 $("login-button").disabled=false;
});
$("comment-form").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!user||!client){msg("post-status","Please sign in before commenting.");return}
 const body=$("comment-body").value.trim();
 if(body.length<10||body.length>1200){msg("post-status","Write between 10 and 1,200 characters.");return}
 if(/https?:\/\/|www\.|@|(?:\+?\d[\d\s-]{8,}\d)/i.test(body)){msg("post-status","Please remove links, email addresses and phone numbers before posting.");return}
 $("post-button").disabled=true;msg("post-status","Sending your comment for review…");
 const row={book_key:key,book_title:title,book_author:author,body,reply_to:replyTo};
 const {error}=await client.from("readmalawi_book_comments").insert(row);
 if(error){msg("post-status","Could not post: "+error.message)}
 else{$("comment-form").reset();clearReply();msg("post-status","Thanks! Your message has been sent to the librarian for approval. It is not public yet.")}
 $("post-button").disabled=false;
});
init();