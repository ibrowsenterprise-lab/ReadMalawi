const $=id=>document.getElementById(id);
const cfg=window.READMALAWI_CONFIG||{};
const statuses=["new","contacted","in_discussion","closed"];
let client=null,user=null;
const h=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const status=message=>$("#status").textContent=message;
async function init(){
 if(!cfg.supabaseUrl||!cfg.supabasePublishableKey){status("ReadMalawi configuration missing.");return}
 try{
 const mod=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
 client=mod.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
 const auth=await client.auth.getUser();user=auth.data?.user;
 if(!user){status("Sign in to the ReadMalawi library, then return here.");return}
 const permission=await client.from("readmalawi_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(permission.error||!permission.data){status("Only authorised ReadMalawi librarians can access partnership enquiries.");return}
 status("Authorised librarian: "+user.email);
 $("#refresh").disabled=false;await load();
 }catch(e){status("Unable to open protected inbox: "+e.message)}
}
async function load(){
 $("#inbox").replaceChildren();
 const {data,error}=await client.from("readmalawi_partnership_enquiries").select("id,contact_name,contact_email,organisation,country,interest,message,status,created_at,admin_notes").order("created_at",{ascending:false}).limit(100);
 if(error){status("Could not load enquiries: "+error.message);return}
 status("Private enquiries: "+data.length+" shown · newest first");
 if(!data.length){$("#inbox").append(h("p","muted","No partnership enquiries yet."));return}
 for(const x of data)$("#inbox").append(card(x));
}
function card(x){
 const root=h("article","item");
 root.append(h("h2","",x.contact_name+" · "+x.interest.replaceAll("_"," ")));
 root.append(h("p","muted",[x.organisation,x.country,new Date(x.created_at).toLocaleDateString()].filter(Boolean).join(" · ")));
 const e=h("p");e.textContent="Email: ";const a=h("a","",x.contact_email);a.href="mailto:"+encodeURIComponent(x.contact_email)+"?subject="+encodeURIComponent("ReadMalawi partnership enquiry");e.append(a);root.append(e);
 root.append(h("p","message",x.message));
 const state=h("select");
 for(const value of statuses){const option=document.createElement("option");option.value=value;option.textContent=value.replaceAll("_"," ");state.append(option)}state.value=x.status;
 const notes=h("textarea");notes.placeholder="Private follow-up notes";notes.value=x.admin_notes||"";
 const save=h("button","btn","Save follow-up");const msg=h("small");
 const bar=h("div","actions");bar.append(state,save,msg);
 save.addEventListener("click",async()=>{
  save.disabled=true;msg.textContent="Saving…";
  const {error}=await client.from("readmalawi_partnership_enquiries").update({status:state.value,admin_notes:notes.value.slice(0,4000)}).eq("id",x.id);
  msg.textContent=error?"Error: "+error.message:"Saved";save.disabled=false;
 });
 root.append(notes,bar);return root;
}
$("#refresh").addEventListener("click",load);
init();