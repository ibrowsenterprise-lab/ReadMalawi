/* ReadMalawi original stories — optional device speech, no AI or audio upload. */
(function(){
  "use strict";
  const support=("speechSynthesis" in window)&&("SpeechSynthesisUtterance" in window);
  const by=document.querySelector(".by");
  if(!by || !support) return;
  const story=document.querySelector("article.story");
  const paragraphs=story?Array.from(story.querySelectorAll("p")).map(p=>p.textContent.trim()).filter(Boolean):[];
  if(!paragraphs.length){
    let element=by.nextElementSibling;
    while(element && !element.classList.contains("end") && !element.classList.contains("quiz")){
      if(element.tagName==="P" && element.textContent.trim()) paragraphs.push(element.textContent.trim());
      element=element.nextElementSibling;
    }
  }
  if(!paragraphs.length) return;

  const controls=document.createElement("div"); controls.className="read-aloud-controls";
  const play=document.createElement("button"); play.type="button";play.className="read-aloud-button";play.textContent="🔊 Listen to story";
  const stop=document.createElement("button");stop.type="button";stop.className="read-aloud-button secondary";stop.textContent="■ Stop listening";stop.hidden=true;
  const status=document.createElement("span");status.className="read-aloud-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.textContent="Uses your device’s English voice, if available.";
  controls.append(play,stop,status);by.insertAdjacentElement("afterend",controls);

  const synth=window.speechSynthesis;
  let session=0,reading=false;
  const englishVoice=()=>{const voices=synth.getVoices?.()||[];return voices.find(v=>/^en(?:-|$)/i.test(v.lang)&&v.localService)||voices.find(v=>/^en(?:-|$)/i.test(v.lang))};
  function refreshVoice(){
    if(reading)return;
    const voice=englishVoice();play.disabled=!voice;
    status.textContent=voice?(voice.localService?"Uses your device’s English voice.":"Uses an online English speech service provided by your device."):"No English speech voice is available yet. Reading still works; check your device’s text-to-speech settings.";
  }
  if(synth.addEventListener)synth.addEventListener("voiceschanged",refreshVoice);
  else synth.onvoiceschanged=refreshVoice;
  refreshVoice();
  function setActive(active){
    reading=active;
    play.hidden=active;stop.hidden=!active;
    if(active)status.textContent="Reading aloud…";else refreshVoice();
  }
  function halt(){
    session+=1;setActive(false);
    try{synth.cancel()}catch(_){}
  }
  function next(index,token){
    if(token!==session||!reading)return;
    if(index>=paragraphs.length){setActive(false);status.textContent="Finished! 🌟";return}
    try{
      const utterance=new SpeechSynthesisUtterance(paragraphs[index]);
      utterance.lang="en";utterance.rate=0.88;utterance.pitch=1;
      const preferred=englishVoice();
      if(!preferred){setActive(false);return}
      utterance.voice=preferred;
      utterance.onend=()=>next(index+1,token);
      utterance.onerror=(event)=>{if(token!==session)return;setActive(false);status.textContent=event.error==="canceled"?"Stopped.":"Audio unavailable. You can still read the story.";};
      synth.speak(utterance);
    }catch(_){setActive(false);status.textContent="Audio unavailable. You can still read the story."}
  }
  play.addEventListener("click",()=>{
    if(reading||!englishVoice())return;
    halt();setActive(true);
    next(0,session);
  });
  stop.addEventListener("click",halt);
  window.addEventListener("pagehide",halt);
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&reading)halt()});
})();

