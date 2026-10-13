import {showDownloadPanel} from "./download-panel.js?v=20261013-readable-preview";
// Private, browser-only TEST coordinator and institutional permission planning.
// Never authorises pickups, appoints personnel or sends letters.
const TYPES={planning:"Future programme (school and prison options)",school:"Schools",prison:"Prisons",both:"Schools and prisons"};
const schoolDraft=[
"UNSENT SCHOOL DISCUSSION TEMPLATE — INTERNAL TEST ONLY",
"To: Appropriate School Head / Administrator",
"Subject: Exploratory discussion on a possible future community book-reading initiative",
"",
"Dear Headteacher,",
"",
"ReadMalawi currently shares digital reading materials through its WhatsApp reading community. We are exploring the possibility of a future physical-book initiative for schools. No physical book collection or delivery has been undertaken or scheduled as part of this project.",
"We would welcome guidance on your school's reading needs, suitable languages and age groups, approval procedures, storage and safeguarding requirements before any proposal is considered.",
"We would not visit, promise a delivery or distribute any books without the school's prior agreement and ReadMalawi's internal authorisation.",
"",
"Yours faithfully,",
"[AUTHORISED REPRESENTATIVE — NOT YET ASSIGNED]",
"[CONTACT DETAILS TO BE VERIFIED BEFORE ANY FUTURE SENDING]",
"School response: NOT REQUESTED OR RECEIVED",
"School permission: NOT GRANTED",
""
];
const prisonDraft=[
"UNSENT PRISON AUTHORITY DISCUSSION TEMPLATE — INTERNAL TEST ONLY",
"To: Officer in Charge / Responsible Prison Authority",
"Subject: Request for guidance on a possible future reading-materials initiative",
"",
"Dear Sir/Madam,",
"",
"ReadMalawi is exploring a future reading initiative that may, if authorised, include suitable donated physical books. We seek guidance on your formal permission procedure, accepted materials, screening requirements, safeguarding, entry rules and the appropriate authorised contact person.",
"This is an exploratory draft only, not a request to visit a facility or a delivery arrangement. No physical distribution, collection or access authorisation is claimed.",
"ReadMalawi would not arrange any visit or offer materials without its own internal approval and your institution's explicit prior permission.",
"",
"Yours faithfully,",
"[AUTHORISED REPRESENTATIVE — NOT YET ASSIGNED]",
"[CONTACT DETAILS TO BE VERIFIED BEFORE ANY FUTURE SENDING]",
"Authority response: NOT REQUESTED OR RECEIVED",
"Institutional permission: NOT GRANTED",
""
];
export function makeCoordinatorPack(type){
 const target=Object.prototype.hasOwnProperty.call(TYPES,type)?type:"planning";
 const school=target==="school"||target==="both"||target==="planning";
 const prison=target==="prison"||target==="both"||target==="planning";
 return [
 "READMALAWI — COORDINATION AND PERMISSIONS PLANNING PACK",
 "MANDATORY PRELAUNCH TEST DRAFT — DO NOT SEND, SIGN OR RELY ON AS APPROVAL",
 "FOUNDER APPROVAL: NOT GRANTED",
 "PICKUPS / DONATIONS RECEIVED: NONE AUTHORISED OR VERIFIED THROUGH THIS PACK",
 "DISTRIBUTION TO SCHOOLS OR PRISONS: NOT APPROVED",
 "",
 "FUTURE RECIPIENT PROGRAMME: "+TYPES[target],
 "Named collectors, routes, vehicle, costs, contacts and institutional permissions: NOT VERIFIED.",
 "",
 "1. PROPOSED ROLES — NONE ASSIGNED",
 "[ ] Accountable programme lead: TO BE ASSIGNED",
 "[ ] WhatsApp donor liaison: TO BE ASSIGNED",
 "[ ] Transport/route coordinator: TO BE ASSIGNED",
 "[ ] Book sorting and receipt custodian: TO BE ASSIGNED",
 "[ ] Safeguarding and institution liaison: TO BE ASSIGNED",
 "Roles may be combined in a small pilot only with clear accountability and founder sign-off.",
 "",
 "2. TRANSPORT, COSTS AND STORAGE — NOT SCHEDULED",
 "[ ] Choose a reasonable geographic pilot boundary based on actual volunteer capacity.",
 "[ ] Verify vehicle/load capacity, fuel access, pickup route and backup transport.",
 "[ ] Estimate fuel and vehicle costs in MWK using real quotes, not assumed prices.",
 "[ ] Assign safe, clean and dry temporary book storage, if approved.",
 "[ ] Set safe handling and condition rules; count books physically after receipt.",
 "[ ] Plan donor consent privately. Never publish full addresses or phone numbers.",
 "[ ] Confirm no donor pickup deposit or unapproved payment is requested.",
 "Vehicle and driver: NOT ASSIGNED",
 "Fuel/transport budget (MWK): NOT COSTED",
 "Collection dates: NOT SCHEDULED",
 "Actual books collected: NOT VERIFIED",
 "",
 "3. INSTITUTIONAL AND SAFEGUARDING CONTROLS",
 "[ ] Check age suitability, readable condition and allowed content.",
 "[ ] School principal or prison authority consent must be verified independently.",
 "[ ] Keep donor private details restricted to the relevant approved coordinator.",
 "[ ] Use a separate real inventory and signed handover only after official launch.",
 "[ ] Distinguish book offers from actual collections and acknowledged deliveries.",
 "",
 ...(school?schoolDraft:[]),
 ...(prison?prisonDraft:[]),
 "4. FOUNDER AND OPERATIONS DECISION",
 "Legal operating status: TO BE VERIFIED",
 "Coordinators/transport: NOT APPOINTED",
 "Recipient institution: NOT SELECTED OR APPROVED",
 "Institution permissions: NOT GRANTED",
 "Founder official launch authorisation: NOT GRANTED",
 "No institution has been contacted or confirmed by this pack.",
 "No customer details, donation receipts, invoices or messages were generated.",
 "",
 "READMALAWI · TIYENI TIWELENGE · INTERNAL TEST DOCUMENT ONLY"
 ].join("\n")+"\n";
}
function downloadLocal(file,data){
 const url=URL.createObjectURL(new Blob([data],{type:"text/plain;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=file;
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export function initCoordinatorPack(){
 const root=document.getElementById("coordinator-pack");
 if(!root||window.READMALAWI_CONFIG?.sitePhase!=="testing")return;
 // Called after librarian Supabase auth and role verification.
 const dest=document.getElementById("operations-recipient");
 const build=root.querySelector("#coordinator-generate");
 const edit=root.querySelector("#coordinator-preview");
 const save=root.querySelector("#coordinator-download");
 const info=root.querySelector("#coordinator-feedback");
 if(!dest||!build||!edit||!save||!info)return;
 let sourceType=null;
 dest.addEventListener("change",()=>{
  if(sourceType!==null){
   sourceType=null;edit.value="";save.disabled=true;
   info.textContent="Recipient programme changed. Generate an updated TEST pack.";
  }
 });
 build.addEventListener("click",()=>{
  if(edit.value.trim()&&!window.confirm("Replace this editable internal draft? Local edits will be lost."))return;
  sourceType=dest.value;
  edit.value=makeCoordinatorPack(sourceType);
  save.disabled=false;
  info.textContent="Private TEST pack generated. It has not been sent or stored.";
 });
 save.addEventListener("click",()=>{
  if(sourceType===null||!edit.value.trim())return;
  const file="ReadMalawi_TEST_Coordination_Permissions.txt";
  const contents="MANDATORY READMALAWI PRELAUNCH NOTICE\nNO FOUNDER, COLLECTION OR INSTITUTIONAL PERMISSION GRANTED\nDO NOT SEND OR ARRANGE PICKUP\n\n"+
   edit.value.trim()+"\n\nEND OF INTERNAL TEST PACK.\n";
  const request=()=>downloadLocal(file,contents);
  request();
  showDownloadPanel({filename:file,content:contents,onDownload:request,trigger:save});
  info.textContent="Download requested. No institution was contacted and no database record was changed.";
 });
}
