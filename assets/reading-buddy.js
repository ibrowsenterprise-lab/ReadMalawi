(function(){
"use strict";
const find=id=>document.getElementById(id);
const messages=find("messages"),form=find("chat-form"),field=find("question"),quick=find("quick");
const route={
 books:["../library.html#library","Find a book →"],
 kids:["../library.html?category=Children#library","Children's books →"],
 language:["../library.html#library","Search by language →"],
 audio:["../library.html#library","Find audiobooks →"],
 club:["../library.html#book-club","Book Club →"],
 upload:["../library.html#contribute","Share a book →"],
 ask:["../library.html#requests","Request a book →"],
 founder:["../index.html#founder","Meet the founder →"],
 learn:["../index.html#challenge","Reading challenge →"],
 partner:["partners.html","Partner with ReadMalawi →"],
 plans:["../library.html#support","Reading plans →"]
};
function item(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function bubble(txt,speaker,links){
 const box=item("div","bubble "+speaker,txt);
 if(links&&links.length){const row=item("div","links");for(const link of links){const a=item("a","",link[1]);a.href=link[0];row.append(a)}box.append(row)}
 messages.append(box);messages.scrollTop=messages.scrollHeight;
}
const has=(s,arr)=>arr.some(w=>s.includes(w));
function respond(phrase){
 const s=phrase.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
 if(has(s,["chichewa","chitumbuka","chiyao","chilomwe","chisena","chitonga","swahili","language","translate"]))return ["ReadMalawi welcomes Malawian and other languages. Choose a language when searching the library. Full translations are still being reviewed.",[route.language]];
 if(has(s,["moni","mabuku","ndikufuna","buku","kuwerenga","werenga"]))return ["Moni! Tiyeni tiwelenge. Let's find a book to read right here on ReadMalawi.",[route.books,route.kids]];
 if(has(s,["kids","kid","children","child","baby","young","fairy","picture book"]))return ["Let's find a story for younger readers. A grown-up can help you share comments.",[route.kids,route.learn]];
 if(has(s,["audio","listen","hearing a book","spoken"]))return ["You can look for audiobooks in our library. Choose the Audiobooks filter.",[route.audio]];
 if(has(s,["comment","discuss","book club","forum","reply","talk about","discussion","review"]))return ["You can discuss a book with other readers. Choose a title, then tap “Discuss this book.” A librarian checks comments before they appear.",[route.club]];
 if(has(s,["upload","share a book","submit","contribute","give a book","donate books","pdf"]))return ["You can share books privately with ReadMalawi. A librarian must first check permission to publish them.",[route.upload]];
 if(has(s,["request","can't find","cannot find","missing","ask for book"]))return ["Can't find a book? Use our Request a Book form.",[route.ask]];
 if(has(s,["school","science","history","maths","math","novel","story","stories","poem","poetry","fiction","technology","book","read","find"]))return ["Let's find a book in our ReadMalawi collection. You can search by title, author, language or subject.",[route.books]];
 if(has(s,["jones","founder","dd phiri","nalikungwi","about readmalawi","who started"]))return ["Jones Nalikungwi founded ReadMalawi. Read our story to learn about the project and its beginnings.",[route.founder]];
 if(has(s,["support","partner","sponsor","investor","donation","fund","help readmalawi"]))return ["You can enquire about supporting ReadMalawi. Financial contributions are not active through this website.",[route.partner]];
 if(has(s,["pay","price","download","plan","membership","subscription"]))return ["Reading approved books online is free. Download memberships are planned but not yet active.",[route.plans]];
 if(has(s,["learn","challenge","quiz","game"]))return ["Let's practise reading with a short story and one question!",[route.learn]];
 if(has(s,["hello","hi","hey","help","what can you do","start"]))return ["Hello! 👋 I can help you find books, join the Book Club, or practise reading. What would you like to do?",[route.books,route.club,route.learn]];
 return ["I can help you find books and explore ReadMalawi. For now I can't answer every open-ended question. Choose one of these to begin!",[route.books,route.club,route.learn]];
}
const cfg=window.READMALAWI_CONFIG||{};
const aiRoute="readmalawi-reading-ai";
let aiReady=false,aiMode=false,aiBusy=false,client=null,reader=null;
let dialogue=[];
let approved=[{title:"The Book on the Bench",author:"ReadMalawi",category:"Children",language:"English",media_type:"original"}];
const aiStatus=text=>find("ai-status").textContent=text;
const modeLabel=()=>find("chat-mode").textContent=aiMode?"✨ AI reading help (10 questions per day)":"📚 Guided book help";
function catalogueSuggestion(phrase){
 const q=phrase.toLowerCase().replace(/\b(find|show|book|books|stories|story|read|looking|please|give|me|do|you|have|available|what|is|about|the|a|an)\b/g," ").replace(/\s+/g," ").trim();
 if(q.length<3)return null;
 const found=approved.filter(book=>{
  const title=String(book.title||"").toLowerCase(),author=String(book.author||"").toLowerCase();
  return title.includes(q)||author.includes(q)||(q.length>=7&&q.includes(title)&&title.length>6);
 }).slice(0,3);
 if(!found.length)return null;
 return ["I found "+found.length+" book"+(found.length===1?"":"s")+" you can read on ReadMalawi:",found.map(book=>["../library.html?q="+encodeURIComponent(book.title)+"#library",book.title+" →"])];
}
async function send(text){
 const phrase=text.trim().slice(0,750);
 if(!phrase||aiBusy)return;
 bubble(phrase,"me");
 if(!aiMode){
  const match=catalogueSuggestion(phrase);
  const [reply,links]=match||respond(phrase);
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
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey)return;
 try{
  const response=await fetch(cfg.supabaseUrl+"/rest/v1/library_books?select=title,author,category,language,media_type&status=eq.approved&verified_rights=eq.true&limit=200",{
   headers:{"apikey":cfg.supabasePublishableKey},
   signal:AbortSignal.timeout(6500)
  });
  if(!response.ok)return;
  const rows=await response.json();
  if(Array.isArray(rows))approved=[...approved,...rows.filter(x=>x&&typeof x.title==="string")];
 }catch{} // Book recommendations remain available for the original story.
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
  const module=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  client=module.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
  const current=await client.auth.getUser();reader=current.data?.user||null;
  client.auth.onAuthStateChange((event,session)=>{
    reader=session?.user||null;
    if(!reader&&aiMode){aiMode=false;find("ai-basic").hidden=true;modeLabel()}
    updateAISignIn();
  });
  updateAISignIn();
 }catch(error){
  aiStatus("Guided help is available. Advanced AI could not connect.");
 }
}
find("ai-enable").addEventListener("click",()=>{
 if(!aiReady)return;
 if(!reader){
   find("ai-signin-form").hidden=false;
   find("ai-email").focus();
   aiStatus("Enter an adult's email. Check that inbox for a secure sign-in link.");
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
initBookSearch();
initAI();
const presets=[["📚 Find books","Find books"],["🧒 Kids' stories","Children's books"],["💬 Book Club","Book Club"],["🌍 Languages","Chichewa"]];
for(const [label,q] of presets){const b=item("button","",label);b.type="button";b.addEventListener("click",()=>send(q));quick.append(b)}
form.addEventListener("submit",e=>{e.preventDefault();send(field.value);field.value="";field.focus()});
bubble("Moni! 👋 I'm Reading Buddy. I can help you find a book, join a book discussion, or start a reading challenge. What would you like to do?","bot",[route.books]);
})();