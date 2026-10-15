import { cleanBook, loadPublicCatalogue, scoreBooks } from "./catalogue-tools.js";
(function(){
"use strict";
const find=id=>document.getElementById(id);
const messages=find("messages"),form=find("chat-form"),field=find("question"),quick=find("quick");
const route={
 books:["../library.html#library","Find a book →"],
 kids:["../library.html?section=kids#library","Children's books →"],
 language:["../library.html#library","Search by language →"],
 audio:["../library.html#library","Find audiobooks →"],
 club:["../library.html#book-club","Book Club →"],
 upload:["physical-books.html","Offer physical books →"],
 ask:["../library.html#whatsapp-forum","Ask on WhatsApp →"],
 founder:["../index.html#founder","Meet the founder →"],
 learn:["../library.html?section=kids#library","Kids & beginners →"],
 partner:["partners.html","Partner with ReadMalawi →"],
 plans:["learning-services.html","Learning tools →"]
};
function item(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function bubble(txt,speaker,links){
 const box=item("div","bubble "+speaker,txt);
 if(links&&links.length){const row=item("div","links");for(const link of links){const a=item("a","",link[1]);a.href=link[0];a.target="_top";row.append(a)}box.append(row)}
 messages.append(box);messages.scrollTop=messages.scrollHeight;
}
const normalized=value=>String(value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
const topics=["Fiction","Education","History","Religion","Science","Biography","Poetry","Technology","Language","Other"];
const topicLinks=()=>topics.map(category=>({category,count:approved.filter(book=>book.category===category).length})).filter(topic=>topic.count>0).map(topic=>["../library.html?category="+encodeURIComponent(topic.category)+"#library",topic.category+" ("+topic.count+") →"]);
function respond(phrase){
 const s=normalized(phrase);
 if(/\b(how|where)\b.*\b(read|open|listen)\b|how to read/.test(s))return ["Choose a book in Books, then tap “Read here”. It opens in the reader. If your phone shows a blank reader, use “Open this book in a new tab”. Reading is free and needs no sign-in.",[route.books]];
 if(/\b(comment|comments|discuss|discussion|review|reviews)\b|book club/.test(s))return ["Choose “Reader comments” directly on a book’s card. You can read published comments freely. To write a thought or question about that book, sign in by email. Comments appear after review.",[route.club]];
 if(/\b(whatsapp|missing|request)\b|can t find|cannot find/.test(s))return ["If a book is missing from our collection, ask the ReadMalawi WhatsApp community for a recommendation or reading source. The link prepares a message; you choose the group and send it yourself.",[route.ask]];
 if(/^(kids|children|child|beginners|kids books|children s books)$/.test(s))return ["Kids & beginners is a separate collection of short stories with simple questions.",[route.kids]];
 if(/\b(topics|categories|category)\b|choose a topic/.test(s))return catalogueReady?["Choose a topic available in our collection. Or type an author or book title above.",topicLinks()]:["Topics couldn’t load right now. Browse Books to try again.",[route.books]];
 if(/\b(audio|audiobooks|listen)\b/.test(s))return ["The collection currently focuses on e-books. The Audiobooks filter shows only listening titles actually available; some short stories also offer your device’s read-aloud voice.",[route.books,route.kids]];
 if(/\b(chichewa|chitumbuka|chiyao|chilomwe|chisena|chitonga|language|languages|translate)\b/.test(s))return ["Use the Language field in Books to check available titles. Most current books are in English. Choosing a language filters the collection; it does not translate a book.",[route.language]];
 if(/\b(donate|donation|give|offer)\b.*\b(physical|books)\b/.test(s))return ["For physical books, share the approximate number and your general area. Collection is discussed separately on WhatsApp.",[route.upload]];
 if(/\b(upload|submit|pdf)\b/.test(s))return ["You can open your own PDF, EPUB or text file privately and use device read-aloud. Personal files are not published to the library.",[["private-reader.html","Open my book →"],route.upload]];
 if(/\b(pay|price|download|membership|subscription)\b/.test(s))return ["Reading our books is free. There is no active paid membership or payment checkout.",[route.books]];
 if(/\b(study|learning|learn|quiz|challenge)\b/.test(s))return ["Smart Study Sprint turns your own short notes into a study routine. Kids & beginners has short stories with questions.",[route.plans,route.kids]];
 if(/\b(founder|jones|nalikungwi)\b/.test(s))return ["Jones Nalikungwi started ReadMalawi. Read the founder’s story here.",[route.founder]];
 if(/\b(partner|sponsor|support)\b/.test(s))return ["Partnership and programme forms accept real enquiries for private follow-up. A request is not a booking or payment.",[route.partner]];
 if(/^(hello|hi|hey|moni|help|find books|start|what can you do)$/.test(s))return ["Type a book title, author or topic—for example, “James Allen”, “fiction” or “history”. I’ll show matches from our collection. I can also explain how reading and comments work.",[route.books]];
 return null;
}
const cfg=window.READMALAWI_CONFIG||{};
const aiRoute="readmalawi-reading-ai";
let aiReady=false,aiMode=false,aiBusy=false,client=null,reader=null;
let dialogue=[];
let approved=[];
const aiStatus=text=>find("ai-status").textContent=text;
const modeLabel=()=>find("chat-mode").textContent=aiMode?"✨ AI reading help (10 questions per day)":"Book help · No sign-in needed";
let catalogueReady=false;
function catalogueSuggestion(phrase){
 const matches=scoreBooks(approved,phrase);if(!matches.length)return null;
 const links=matches.slice(0,5).map(({book})=>["../library.html?q="+encodeURIComponent(book.title)+"#library",book.title+" · "+(book.author&&!/^unknown/i.test(book.author)?book.author:"author not verified")+" →"]);
 const qualifications=[];
 if(/\b(short|beginner|beginners|easy)\b/i.test(phrase))qualifications.push("Book lengths and reading levels have not yet been verified, so I cannot guarantee these are short or beginner-friendly.");
 if(/\b(africa|african|malawi|malawian)\b/i.test(phrase))qualifications.push("Regional coverage is incomplete; these are catalogue matches, not a verified regional reading list.");
 return ["Here are matching books based on their catalogue titles, subjects and descriptions. "+qualifications.join(" "),links];
}
async function send(text){
 const phrase=text.trim().slice(0,750);
 if(!phrase||aiBusy)return;
 bubble(phrase,"me");
 if(!aiMode){
  let help=respond(phrase);
  if((!help||/\b(topics|categories|category)\b/.test(normalized(phrase)))&&!catalogueReady){
   const checking=item("div","bubble bot","Checking our book collection…");messages.append(checking);
   await cataloguePromise;checking.remove();help=respond(phrase);
  }
  const match=help||catalogueSuggestion(phrase);
  const [reply,links]=match||(catalogueReady?[
    "I could not find a reliable catalogue match. Try a title, author or subject, or choose Topics. I will not invent a recommendation.",
    [["../library.html?q="+encodeURIComponent(phrase)+"#library","Search this title in Books →"],route.ask]
  ]:["The book collection couldn’t connect right now. You can still browse Books or use the site-help buttons.",[route.books,route.ask]]);
  bubble(reply,"bot",links);
  return;
 }
 if(!aiReady||!client||!reader){
   bubble("Advanced AI is not available yet. I can still help you find books on ReadMalawi.","bot",[route.books]);
   aiMode=false;modeLabel();return;
 }
 aiBusy=true;find("chat-form").querySelector("button[type=submit]").disabled=true;
 const thinking=item("div","bubble bot","Reading Buddy is thinking…");messages.append(thinking);messages.scrollTop=messages.scrollHeight;
 try{
   const session=await client.auth.getSession();
   const token=session.data?.session?.access_token;
   if(!token)throw Error("Please sign in again to ask AI.");
   const response=await fetch(cfg.supabaseUrl+"/functions/v1/"+aiRoute,{
     method:"POST",
     headers:{"Content-Type":"application/json","apikey":cfg.supabasePublishableKey,"Authorization":"Bearer "+token},
     body:JSON.stringify({question:phrase,history:dialogue.slice(-6)}),
     signal:AbortSignal.timeout(25000)
   });
   const data=await response.json();
   if(!response.ok)throw Error(data?.message||(
      response.status===429?"Please wait a moment or come back tomorrow.":
      "Advanced AI could not answer right now. Try again later."
   ));
   if(typeof data.answer!=="string")throw Error("No answer received.");
   thinking.remove();
   bubble(data.answer,"bot");
   dialogue.push({role:"user",content:phrase},{role:"assistant",content:data.answer.slice(0,750)});
   dialogue=dialogue.slice(-6);
 }catch(error){
   thinking.remove();
   bubble(error.message||"Advanced AI is temporarily unavailable. You can still use guided help.","bot",[route.books,route.learn]);
 }finally{
   aiBusy=false;find("chat-form").querySelector("button[type=submit]").disabled=false;field.focus();
 }
}
async function initBookSearch(){
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){find("catalogue-status").textContent="Book search unavailable · Site help still works";return;}
 try{
  const rows=await loadPublicCatalogue(cfg);
  approved=rows.map(cleanBook);catalogueReady=true;
  find("catalogue-status").textContent="Search "+approved.length+" released books · Free to read";

 }catch{} finally {
  if(!catalogueReady)find("catalogue-status").textContent="Book search unavailable · Site help still works";
 }
}
function updateAISignIn(){
 find("ai-user").hidden=!reader;
 if(reader)find("ai-user").textContent="Signed in for AI reading: "+reader.email;
 find("ai-signin-form").hidden=!!reader || !aiReady;
 find("ai-enable").hidden=!aiReady;
 find("ai-enable").textContent=reader?"✨ Ask AI":"✨ Sign in to ask AI";
 if(aiReady&&!aiMode){
   aiStatus(reader?"Advanced AI is ready. You can ask reading questions.":"Advanced AI is available after private email sign-in.");
 }
}
async function initAI(){
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){
   aiStatus("Guided Reading Buddy is ready. Advanced AI is not configured.");return;
 }
 try{
  const ping=await fetch(cfg.supabaseUrl+"/functions/v1/"+aiRoute,{
   headers:{"apikey":cfg.supabasePublishableKey},
   signal:AbortSignal.timeout(6500)
  });
  const data=await ping.json();
  aiReady=ping.ok && data?.ai_enabled===true;
  if(!aiReady){
    aiStatus("Guided help works now. Advanced AI is awaiting activation.");
    return;
  }
  const {getSupabaseModule}=await import("./supabase-loader.js");
  const module=await getSupabaseModule();
  client=module.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
  const current=await client.auth.getUser();reader=current.data?.user||null;
  client.auth.onAuthStateChange((event,session)=>{
    reader=session?.user||null;
    if(!reader&&aiMode){aiMode=false;find("ai-basic").hidden=true;modeLabel()}
    updateAISignIn();
  });
  updateAISignIn();find("ai-panel").hidden=false;
 }catch(error){
  aiStatus("Guided help is available. Advanced AI could not connect.");
 }
}
find("ai-enable").addEventListener("click",()=>{
 if(!aiReady)return;
 if(!reader){
   find("ai-signin-form").hidden=false;
   find("ai-email").focus();
   aiStatus("Enter your email and open the secure sign-in link in your inbox.");
   return;
 }
 aiMode=true;find("ai-basic").hidden=false;find("ai-enable").hidden=true;modeLabel();
 aiStatus("AI is ready. Please share only short, lawful reading excerpts.");
 bubble("✨ AI mode is ready! Ask me to explain a word, practise reading or talk about a story. I may make mistakes, so check important answers.","bot");
 field.focus();
});
find("ai-basic").addEventListener("click",()=>{
 aiMode=false;find("ai-basic").hidden=true;dialogue=[];
 updateAISignIn();modeLabel();bubble("Back to simple guided book help.","bot",[route.books]);
});
find("ai-signin-form").addEventListener("submit",async event=>{
 event.preventDefault();
 if(!client)return;
 const button=find("ai-signin-submit"),email=find("ai-email").value.trim();
 button.disabled=true;aiStatus("Sending your sign-in email…");
 try{
  const sent=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.href.split("#")[0]}});
  if(sent.error)throw sent.error;
  aiStatus("Check your email for a secure sign-in link, then return to Reading Buddy.");
 }catch(e){aiStatus("Couldn't sign in: "+e.message)}
 finally{button.disabled=false}
});
const cataloguePromise=initBookSearch();
initAI();
const presets=[["Topics","Choose a topic"],["How to read","How to read"],["Reader comments","Book comments"],["Ask on WhatsApp","WhatsApp"]];
for(const [label,q] of presets){const b=item("button","",label);b.type="button";b.addEventListener("click",()=>send(q));quick.append(b)}
form.addEventListener("submit",e=>{e.preventDefault();send(field.value);field.value="";field.focus()});
bubble("Moni! Search by title, author or topic. Try “James Allen” or “fiction”, or use a help button above. I find books in ReadMalawi; I don’t read whole PDFs or answer general questions in book-help mode.","bot",[route.books]);
})();

