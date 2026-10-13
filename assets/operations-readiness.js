import {showDownloadPanel} from "./download-panel.js?v=20261013-readable-preview";
/**
 * Prelaunch operational readiness worksheet. Browser-only, no database writes,
 * external submissions, verified approvals or actual collection authorisation.
 */
export const READINESS_GATES=Object.freeze([
 Object.freeze({id:"governance",label:"Legal operating status, founder release decision and named accountable programme lead reviewed",for:"all"}),
 Object.freeze({id:"volunteers",label:"Authorised coordinators and volunteers, responsibilities and basic safety briefing prepared",for:"all"}),
 Object.freeze({id:"logistics",label:"Transport availability, fuel costs, route, safe storage and handling evaluated",for:"all"}),
 Object.freeze({id:"privacy",label:"Donor consent, private pickup details, learner/prisoner safeguarding and data retention reviewed",for:"all"}),
 Object.freeze({id:"inventory",label:"Book condition checks, categorisation, physical count and separate signed receipt process prepared",for:"all"}),
 Object.freeze({id:"finance",label:"Budget, insurance or liability, incident reporting and no-payment donor policy reviewed",for:"all"}),
 Object.freeze({id:"school",label:"School management has been approached about needs, appropriate books, and formal recipient permission (future)",for:"school"}),
 Object.freeze({id:"prison",label:"Responsible prison authority, entry rules, safety review, approved materials and handover process identified (future)",for:"prison"}),
 Object.freeze({id:"verification",label:"A future real collection/distribution reporting ledger with independent handover evidence has been designed",for:"all"})
]);
const DESTINATIONS=Object.freeze({
 planning:"Not selected — programme design only",
 school:"School reading programme (future)",
 prison:"Prison reading programme (future)",
 both:"Schools and prisons (future)"
});
function relevant(gate,destination){
 return gate.for==="all"||(gate.for==="school"&&(destination==="school"||destination==="both"))
  ||(gate.for==="prison"&&(destination==="prison"||destination==="both"));
}
export function evaluateOperationalReadiness(destination,checkedIds){
 const selected=Object.prototype.hasOwnProperty.call(DESTINATIONS,destination)?destination:"planning";
 const checked=new Set(Array.isArray(checkedIds)?checkedIds:[]);
 const required=READINESS_GATES.filter(g=>relevant(g,selected));
 const completed=required.filter(g=>checked.has(g.id));
 const missing=required.filter(g=>!checked.has(g.id));
 return Object.freeze({
  destination:selected,countRequired:required.length,countChecked:completed.length,
  missing:missing.map(g=>g.label),
  // A complete planning worksheet is NOT evidence of readiness or a founder's approval.
  planningChecklistCompleted:selected!=="planning"&&missing.length===0,
  founderAuthorised:false,collectionAuthorised:false,distributionAuthorised:false
 });
}
export function makeOperationalReadinessReport(destination,checkedIds){
 const e=evaluateOperationalReadiness(destination,checkedIds);
 const checked=new Set(Array.isArray(checkedIds)?checkedIds:[]);
 return [
  "READMALAWI | PHYSICAL BOOK PROGRAMME OPERATIONS",
  "INTERNAL PRELAUNCH READINESS WORKSHEET — TEST ONLY",
  "NOT A COLLECTION AUTHORISATION, PERMISSION LETTER, RECEIPT OR HANDOVER CERTIFICATE",
  "FOUNDER AUTHORISATION: NOT GRANTED",
  "SCHOOL / PRISON DISTRIBUTION: NOT APPROVED",
  "PICKUPS, TRANSPORT BOOKING, DONOR CONTACT AND PAYMENTS: DISABLED",
  "",
  "PROPOSED FUTURE RECIPIENT TYPE: "+DESTINATIONS[e.destination],
  "ADMIN PLANNING CHECKLIST: "+e.countChecked+" of "+e.countRequired+" items ticked",
  "CHECKLIST STATUS: "+(e.planningChecklistCompleted
   ?"TICKED FOR INTERNAL DISCUSSION ONLY — NO EXTERNAL APPROVAL":
    "INCOMPLETE — INTERNAL PLANNING ONLY"),
  "Note: checkboxes are unverified human planning notes, not evidence that a person or institution has consented.",
  "",
  "PLANNING POINTS",
  ...READINESS_GATES.filter(g=>relevant(g,e.destination))
   .map(g=>(checked.has(g.id)?"[x] ":"[ ] ")+g.label),
  "",
  "OUTSTANDING PLANNING ITEMS",
  ...(e.missing.length?e.missing.map(g=>"- "+g):["No unchecked items. Independent checks and formal approvals are STILL required."]),
  "",
  "REQUIRED EXTERNAL EVIDENCE — NOT AUTOMATICALLY PROVIDED",
  "- Explicit founder decision approving an identified operational launch.",
  "- Verified coordinator roles and transport/storage arrangements.",
  "- Donor consent and recipient-specific school/prison permissions.",
  "- Proper legal, safeguarding and material suitability review.",
  "- Separate physical receipt and verified recipient handover ledger.",
  "",
  "WHAT THIS REPORT DOES NOT DO",
  "It does not create a real donation, confirm a book pickup, identify a donor,",
  "contact a school or prison, record books as collected/distributed, sign an",
  "agreement, authorise an invoice or update the ReadMalawi database.",
  "",
  "READMALAWI · TIYENI TIWELENGE · INTERNAL TEST ONLY",
  "END OF UNAPPROVED DEVELOPMENT WORKSHEET"
 ].join("\n")+"\n";
}
function downloadLocal(filename,content){
 const url=URL.createObjectURL(new Blob([content],{type:"text/plain;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=filename;
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export function initOperationsReadiness(){
 const root=document.getElementById("operations-readiness");
 if(!root||window.READMALAWI_CONFIG?.sitePhase!=="testing")return;
 // This is called only after Supabase Auth and the ReadMalawi admin RLS check.
 const type=root.querySelector("#operations-recipient");
 const inputs=[...root.querySelectorAll("[data-readiness-gate]")];
 const count=root.querySelector("#operations-progress");
 const summary=root.querySelector("#operations-summary");
 const output=root.querySelector("#operations-report");
 const status=root.querySelector("#operations-feedback");
 const create=root.querySelector("#operations-generate");
 const download=root.querySelector("#operations-download");
 const clear=root.querySelector("#operations-reset");
 if(!type||!count||!summary||!output||!status||!create||!download||!clear
  ||inputs.length!==READINESS_GATES.length)return;
 let lastGenerated="";
 const ticked=()=>inputs.filter(input=>input.checked).map(input=>input.value);
 function paint(){
  for(const input of inputs){
   const gate=READINESS_GATES.find(g=>g.id===input.value);
   const yes=!!gate&&relevant(gate,type.value);
   const row=input.closest(".readiness-line");
   if(row)row.hidden=!yes;
   input.disabled=!yes;
   if(!yes)input.checked=false;
  }
  const data=evaluateOperationalReadiness(type.value,ticked());
  count.textContent=data.countChecked+" of "+data.countRequired+" planning items ticked";
  summary.textContent=data.destination==="planning"
    ?"Choose a future recipient type to include the right institutional permission checks."
    :data.planningChecklistCompleted
       ?"Planning checklist fully ticked. This is NOT verification or founder approval."
       :data.missing.length+" planning item"+(data.missing.length===1?" remains":"s remain")+
        ". Formal permissions and founder approval are still absent.";
  if(lastGenerated){
   lastGenerated="";
   output.value="";
   download.disabled=true;
   status.textContent="Inputs changed. Generate a fresh TEST worksheet before downloading.";
  }
 }
 type.addEventListener("change",paint);
 inputs.forEach(x=>x.addEventListener("change",paint));
 create.addEventListener("click",()=>{
  lastGenerated=makeOperationalReadinessReport(type.value,ticked());
  output.value=lastGenerated;
  download.disabled=false;
  status.textContent="Private TEST worksheet ready. No data was saved, emailed or sent to WhatsApp.";
 });
 download.addEventListener("click",()=>{
  if(!lastGenerated)return;
  const filename="ReadMalawi_TEST_Operations_Readiness.txt";
  // Reapply a mandatory separate warning even if an editable preview is modified.
  const contents="MANDATORY READMALAWI PRELAUNCH TEST EXPORT\nNO PHYSICAL COLLECTION OR DISTRIBUTION AUTHORISED\n"+
   "NO FOUNDER APPROVAL OR INSTITUTIONAL PERMISSION GRANTED\n\n"+lastGenerated+
   "\nEND OF PRIVATE READMALAWI TEST DOCUMENT.\n";
  const request=()=>downloadLocal(filename,contents);
  request();
  showDownloadPanel({filename,content:contents,onDownload:request,trigger:download});
  status.textContent="TEST download requested. Browser controls the system notification.";
 });
 clear.addEventListener("click",()=>{
  if(ticked().length&&!window.confirm("Clear this browser-only TEST checklist? No database records will change."))return;
  type.value="planning";
  inputs.forEach(x=>x.checked=false);
  paint();
  status.textContent="Browser-only TEST checklist reset. No database changes.";
 });
 paint();
}
