// ReadMalawi free Smart Study Sprint: rule-based, private, on-device.
// This is not generative AI and never sends reader text to a server.
const $=id=>document.getElementById(id);
const stopWords=new Set("about above after again against almost along already also although among another around because become before being between beyond book both could during each either enough every finally first found from further gave have having however into itself just keep known later learn learning least little made make many might more most much must never often once only other over people place read reader really same should since some still such than that their them there these they thing think those through together under until very want were what when where which while with without would your yourself".split(" "));
let generated="";
let phases=[],timer=null,remaining=0,deadline=0,phaseIndex=0,running=false;
function stopTimer(){clearInterval(timer);timer=null;running=false}
function showTimer(){
 const seconds=Math.max(0,Math.ceil(remaining/1000));
 $("study-clock").textContent=Math.floor(seconds/60)+":"+String(seconds%60).padStart(2,"0");
 $("study-timer-toggle").textContent=running?"Pause":remaining>0?"Resume":"Start sprint";
}
function resetTimer(){
 stopTimer();phaseIndex=0;remaining=0;$("study-clock").textContent="Ready";
 $("study-phase").textContent="Start your timed Read → Explain → Recall routine.";
 $("study-timer-toggle").textContent="Start sprint";
}
function tick(){
 remaining=Math.max(0,deadline-Date.now());
 const elapsed=phases.reduce((sum,p)=>sum+p.minutes*60000,0)-remaining;
 let boundary=0;phaseIndex=phases.length-1;
 for(let i=0;i<phases.length;i++){boundary+=phases[i].minutes*60000;if(elapsed<boundary){phaseIndex=i;break}}
 if(remaining===0){stopTimer();$("study-phase").textContent="Sprint complete. Check your summary against your notes.";$("study-timer-toggle").textContent="Start again";$("study-clock").textContent="0:00";return}
 const instruction=phases[phaseIndex].name+": "+phases[phaseIndex].instruction;
 if($("study-phase").textContent!==instruction)$("study-phase").textContent=instruction;
 showTimer();
}
$("study-timer-toggle").addEventListener("click",()=>{
 if(!generated||!phases.length)return;
 if(running){remaining=Math.max(0,deadline-Date.now());stopTimer();showTimer();return}
 if(remaining<=0)remaining=phases.reduce((sum,p)=>sum+p.minutes*60000,0);
 running=true;deadline=Date.now()+remaining;tick();timer=setInterval(tick,250);
});
$("study-timer-reset").addEventListener("click",resetTimer);
function invalidateGuide(){
 if(!generated)return;
 resetTimer();generated="";$("study-result").hidden=true;
 $("study-status").textContent="Notes or time changed. Create a new guide to use the updated version.";
}
$("study-notes").addEventListener("input",invalidateGuide);
$("study-minutes").addEventListener("change",invalidateGuide);
window.addEventListener("pagehide",resetTimer);
function element(tag,text,cls){
 const e=document.createElement(tag); if(text!==undefined)e.textContent=text;
 if(cls)e.className=cls;return e;
}
function keyTerms(text){
 const matches=(text.toLowerCase().match(/[\p{L}][\p{L}\p{M}’-]{4,}/gu)||[]);
 const counts=new Map();
 for(const w of matches){
  const term=w.replace(/^[’'-]+|[’'-]+$/g,"");
  if(term.length<5||stopWords.has(term)||/^\d/.test(term))continue;
  counts.set(term,(counts.get(term)||0)+1);
 }
 return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
  .slice(0,6).map(([word])=>word);
}
function makeGuide(){
 resetTimer();
 generated="";$("study-result").hidden=true;
 const notes=$("study-notes").value.trim().replace(/\s+/g," ");
 const status=$("study-status");
 if(notes.length<80){status.textContent="Add at least 80 characters from your own notes or a passage you have permission to use.";return}
 if(notes.length>3000){status.textContent="Please shorten the passage to 3,000 characters or fewer.";return}
 const words=(notes.match(/[\p{L}\p{M}]+(?:[-’'][\p{L}\p{M}]+)*/gu)||[]);
 const length=words.length;
 const mins=Number($("study-minutes").value);
 if(![5,10,15].includes(mins)){status.textContent="Choose a 5-, 10- or 15-minute sprint.";return}
 const sentences=notes.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
 const usable=sentences.map(x=>x.trim()).filter(x=>x.length>=35);
 const quotation=(usable.find(x=>x.length<=220)||usable[0]||notes.slice(0,220)).slice(0,220);
 const terms=keyTerms(notes);
 const result=$("study-result");
 result.hidden=false;
 $("study-summary").replaceChildren();
 const main=element("p",length+" words · about "+Math.max(1,Math.ceil(length/150))+
    " minute(s) for a first read. Your "+mins+"-minute practice plan is ready.");
 $("study-summary").append(main);
 const items=[
  ["Read",Math.max(2,Math.round(mins*.4))+" min","Read your passage carefully. Find the main idea and highlight unfamiliar terms."],
  ["Explain",Math.max(1,Math.round(mins*.35))+" min","Without looking, explain its main idea in your own words."],
  ["Recall",Math.max(1,mins-Math.max(2,Math.round(mins*.4))-Math.max(1,Math.round(mins*.35)))+" min","Use the key terms below to remember important information."]
 ];
 const plan=$("study-plan");plan.replaceChildren();
 phases=items.map(([name,time,instruction])=>({name,minutes:Number.parseInt(time,10),instruction}));
 for(const [title,time,desc] of items){
  const card=element("li");
  card.append(element("strong",title+" · "+time),element("span",desc));
  plan.append(card);
 }
 const termBox=$("study-terms");termBox.replaceChildren();
 if(!terms.length)termBox.append(element("span","No strong repeated terms found. Read the passage to choose your own key words.","muted"));
 else for(const term of terms)termBox.append(element("span",term,"term"));
 $("study-quote").textContent=quotation;
 $("study-own-summary").value="";
 $("study-word-count").textContent="0 words entered · aim for 15–35 words.";
 generated="ReadMalawi Smart Study Sprint\n\n"+
  "Source: reader-provided notes, processed only in the browser\n"+
  "Length: "+length+" words\n"+
  "Practice time: "+mins+" minutes\n\n"+
  "Key terms: "+(terms.join(", ")||"choose from your own text")+"\n\n"+
  "Sentence to reflect on:\n"+quotation+"\n\n"+
  "Study plan:\n"+items.map(x=>"- "+x.join(" — ")).join("\n")+"\n\n"+
  "My own summary:\n";
 status.textContent="Study guide created on this device. Nothing was uploaded or stored by ReadMalawi.";
 result.scrollIntoView({behavior:"smooth",block:"start"});
}
$("study-build").addEventListener("click",makeGuide);
$("study-clear").addEventListener("click",()=>{
 resetTimer();phases=[];
 $("study-notes").value="";$("study-own-summary").value="";
 $("study-result").hidden=true;$("study-status").textContent="Notes cleared from this page.";generated="";
});
$("study-own-summary").addEventListener("input",()=>{
 const n=($("study-own-summary").value.trim().match(/[\p{L}\p{M}]+(?:[-’'][\p{L}\p{M}]+)*/gu)||[]).length;
 $("study-word-count").textContent=n+" word"+(n===1?"":"s")+" entered · "+(n<15?"add a little more detail":n>35?"try making it shorter":"good summary length; check the meaning yourself")+".";
});
$("study-export").addEventListener("click",()=>{
 if(!generated)return;
 const body=generated+$("study-own-summary").value.trim()+"\n\n"+
 "Review: This is a rule-based study aid, not AI-generated feedback or a teacher's assessment.\n";
 const blob=new Blob([body],{type:"text/plain;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="ReadMalawi_Study_Sprint.txt";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),15000);
});
