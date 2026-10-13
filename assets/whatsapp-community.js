/* ReadMalawi WhatsApp community helpers.
 * Browser-only, user-initiated, no backend storage or automatic WhatsApp sends.
 * Exact WhatsApp group invite must be supplied by ReadMalawi administrators.
 */
(function(){
 "use strict";
 const cfg=window.READMALAWI_CONFIG||{};
 const rawInvite=String(cfg.whatsappForumInviteUrl||"").trim();
 const validInvite=/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]{10,40}\/?$/.test(rawInvite)?rawInvite:null;
 function shareUrl(text){
  return "https://wa.me/?text="+encodeURIComponent(String(text||"").slice(0,1250));
 }
 function requestBookText(title,author){
  const name=String(title||"a book").replace(/[\r\n\t]/g," ").trim().slice(0,170);
  const writer=String(author||"").replace(/[\r\n\t]/g," ").trim().slice(0,130);
  return "Hello ReadMalawi reading forum. I enjoyed / am interested in \""+name+"\""+
    (writer&&writer!=="Unknown author"?" by "+writer:"")+
    ". Can someone point me to a lawful copy, the official publisher, or where to borrow it? Please share authorised sources only. Tiyeni tiwelenge!";
 }
 function createRequestLink(title,author){
  const a=document.createElement("a");
  a.className="readmalawi-whatsapp-book-link";
  a.textContent="Ask in our WhatsApp forum ↗";
  a.setAttribute("aria-label","Ask the ReadMalawi reading forum about "+String(title||"this book"));
  a.href=shareUrl(requestBookText(title,author));
  a.target="_blank";
  a.rel="noopener noreferrer";
  return a;
 }
 function offerText(count,location){
  const amount=Number(count);
  const where=String(location||"").replace(/[\r\n\t]/g," ").trim().slice(0,95);
  return "Hello ReadMalawi. I would like to offer approximately "+amount+
    " physical book"+(amount===1?"":"s")+
    ". My general town/area is "+where+
    ". Please reply to me here on WhatsApp so we can discuss whether collection can be arranged. No pickup or school/prison distribution has been confirmed yet.";
 }
 function activateForumInvites(){
  const nodes=document.querySelectorAll("[data-rm-forum-invite]");
  for(const el of nodes){
   if(validInvite){
    el.href=validInvite;
    el.target="_blank";
    el.rel="noopener noreferrer";
    el.hidden=false;
    el.textContent="Join the ReadMalawi WhatsApp forum ↗";
   }else{
    el.hidden=true;
   }
  }
  document.querySelectorAll("[data-rm-forum-share]").forEach(a=>{
   a.href=shareUrl("Hello ReadMalawi forum! I'm looking for a good book or a lawful reading source. Tiyeni tiwelenge!");
   a.target="_blank";
   a.rel="noopener noreferrer";
  });
 }
 function setupPhysicalOffer(){
  const form=document.getElementById("rm-physical-book-offer");
  if(!form)return;
  const count=form.querySelector('[name="book_count"]');
  const location=form.querySelector('[name="general_area"]');
  const message=document.getElementById("rm-physical-book-feedback");
  if(!count||!location||!message)return;
  form.addEventListener("submit",event=>{
   event.preventDefault();
   const value=Number(count.value);
   const area=location.value.trim().replace(/\s+/g," ");
   if(!Number.isInteger(value)||value<1||value>50000){
    message.textContent="Please enter a whole number between 1 and 50,000.";
    count.focus();
    return;
   }
   if(area.length<2||area.length>95){
    message.textContent="Please enter a general town or area (2–95 characters). A street address isn't needed.";
    location.focus();
    return;
   }
   // The website stores nothing. The donor chooses a WhatsApp chat and taps Send.
   const link=document.createElement("a");
   link.href=shareUrl(offerText(value,area));
   link.target="_blank";link.rel="noopener noreferrer";
   document.body.append(link);link.click();link.remove();
   message.textContent="WhatsApp requested. Choose the ReadMalawi forum or coordinator chat, then tap Send. Nothing has been submitted to ReadMalawi by this website.";
  });
 }
 window.ReadMalawiWhatsApp=Object.freeze({shareUrl,requestBookText,createRequestLink,offerText,forumInviteUrl:validInvite});
 if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",()=>{activateForumInvites();setupPhysicalOffer()},{once:true});
 }else{
  activateForumInvites();setupPhysicalOffer();
 }
})();