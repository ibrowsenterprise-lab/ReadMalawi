const $=id=>document.getElementById(id);
const form=$("partner-form"),button=$("send"),status=$("status");
const cfg=window.READMALAWI_CONFIG||{};
const testMode=cfg.sitePhase!=="production";
let client=null;
function notify(msg,good=false){status.textContent=msg;status.className="status "+(good?"good":"error")}
document.querySelectorAll("[data-interest]").forEach(a=>a.addEventListener("click",()=>{$("contact-interest").value=a.dataset.interest}));
const interestFromUrl=new URLSearchParams(window.location.search).get("interest");
if(interestFromUrl && [...$("contact-interest").options].some(o=>o.value===interestFromUrl)){
 $("contact-interest").value=interestFromUrl;
}

async function init(){
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){notify("Partnership enquiries are temporarily unavailable. Please try again later.");return}
 try{
 const module=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
 client=module.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
 button.disabled=false;
 if(testMode)button.textContent="Submit TEST partnership enquiry";
 }catch(err){notify("Could not connect to the enquiry service. Check your internet connection and try again.")}
}
form.addEventListener("submit",async event=>{
 event.preventDefault();
 if(!client)return;
 if(!form.reportValidity())return;
 if($("contact-website").value.trim()){notify("Thank you for your interest.",true);form.reset();return}
 const contact_name=$("contact-name").value.trim();
 const contact_email=$("contact-email").value.trim();
 const organisation=$("contact-org").value.trim();
 const country=$("contact-country").value.trim();
 const interest=$("contact-interest").value;
 const rawMessage=$("contact-message").value.trim();
 const message=testMode?"[READMALAWI TEST] Prelaunch test only — no payment, client follow-up or agreement.\n"+rawMessage:rawMessage;
 if(message.length>2200){notify("Please shorten the message slightly to allow room for the test record label.");return}
 if(contact_name.length<2||rawMessage.length<12||!$("contact-consent").checked){notify("Please add your name, a message of at least 12 characters, and consent to a reply.");return}
 button.disabled=true;notify("Sending your enquiry…");
 try{
 const {error}=await client.from("readmalawi_partnership_enquiries").insert({contact_name,contact_email,organisation,country,interest,message,consent:true});
 if(error)throw error;
 form.reset();notify(testMode?"TEST enquiry saved privately. This is not a real customer request. No automatic email, invoice or payment was triggered.":"Thank you! Your enquiry has been recorded privately. The ReadMalawi team will review it. This is not a donation or funding agreement.",true);
 }catch(err){notify("Unable to submit at the moment: "+(err.message||"Please try again."))}
 finally{button.disabled=false}
});
init();
