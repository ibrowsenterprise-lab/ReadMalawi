const $=id=>document.getElementById(id);
const form=$("partner-form"),button=$("send"),status=$("status");
const cfg=window.READMALAWI_CONFIG||{};
let client=null,sending=false;
function notify(msg,good=false){status.textContent=msg;status.className="status "+(good?"good":"error")}
document.querySelectorAll("[data-interest]").forEach(a=>a.addEventListener("click",()=>{$("contact-interest").value=a.dataset.interest}));
const interestFromUrl=new URLSearchParams(window.location.search).get("interest");
if(interestFromUrl && [...$("contact-interest").options].some(o=>o.value===interestFromUrl)){
 $("contact-interest").value=interestFromUrl;
}

async function init(){
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){notify("Partnership enquiries are temporarily unavailable. Please try again later.");return}
 try{
 const {getSupabaseModule}=await import("./supabase-loader.js");
 const module=await getSupabaseModule();
 client=module.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
 button.disabled=false;
 }catch(err){notify("Could not connect to the enquiry service. Refresh to retry, or email info@readmalawi.fyi.")}
}
form.addEventListener("submit",async event=>{
 event.preventDefault();
 if(!client||sending)return;
 if(!form.reportValidity())return;
 if($("contact-website").value.trim()){notify("Thank you for your interest.",true);form.reset();return}
 const contact_name=$("contact-name").value.trim();
 const contact_email=$("contact-email").value.trim();
 const organisation=$("contact-org").value.trim();
 const country=$("contact-country").value.trim();
 const interest=$("contact-interest").value;
 const rawMessage=$("contact-message").value.trim();
 const message=rawMessage;
 if(message.length>2200){notify("Please keep your message within 2,200 characters.");return}
 if(contact_name.length<2||rawMessage.length<12||!$("contact-consent").checked){notify("Please add your name, a message of at least 12 characters, and consent to a reply.");return}
 sending=true;button.disabled=true;notify("Sending your enquiry…");
 try{
 const {error}=await client.from("readmalawi_partnership_enquiries").insert({contact_name,contact_email,organisation,country,interest,message,consent:true}).abortSignal(AbortSignal.timeout(15000));
 if(error)throw error;
 form.reset();notify("Thank you! Your enquiry has been recorded privately. The ReadMalawi team will review it. This is not a donation or funding agreement.",true);
 }catch(err){notify("We could not confirm receipt. Your details are still here. Before sending again, contact info@readmalawi.fyi or WhatsApp +265 882 242 594 to check whether it arrived.")}
 finally{sending=false;button.disabled=false}
});
init();
