const $=id=>document.getElementById(id);
const form=$("partner-form"),button=$("send"),status=$("status");
const cfg=window.READMALAWI_CONFIG||{};
let client=null;
function notify(msg,good=false){status.textContent=msg;status.className="status "+(good?"good":"error")}
document.querySelectorAll("[data-interest]").forEach(a=>a.addEventListener("click",()=>{$("contact-interest").value=a.dataset.interest}));
async function init(){
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){notify("Partnership enquiries are temporarily unavailable. Please try again later.");return}
 try{
 const module=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
 client=module.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
 button.disabled=false;
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
 const message=$("contact-message").value.trim();
 if(contact_name.length<2||message.length<12||!$("contact-consent").checked){notify("Please add your name, a short message, and consent to a reply.");return}
 button.disabled=true;notify("Sending your enquiry…");
 try{
 const {error}=await client.from("readmalawi_partnership_enquiries").insert({contact_name,contact_email,organisation,country,interest,message,consent:true});
 if(error)throw error;
 form.reset();notify("Thank you! Your enquiry has been recorded privately. The ReadMalawi team will review it. This is not a donation or funding agreement.",true);
 }catch(err){notify("Unable to submit at the moment: "+(err.message||"Please try again."))}
 finally{button.disabled=false}
});
init();