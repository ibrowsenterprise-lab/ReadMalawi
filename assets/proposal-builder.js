import {showDownloadPanel} from "./download-panel.js?v=20261013-readable-preview";
// ReadMalawi private prelaunch proposal drafting. Browser only, no network or database writes.
// This is NOT an approval mechanism for a real client proposal, invoice or programme delivery.
const money=n=>"MWK "+new Intl.NumberFormat("en-MW",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const TRACKS=Object.freeze({
 education_services:"School reading and study-skills pilot",
 ai_services:"Responsible AI literacy workshop",
 author_services:"Author, publisher and human-reviewed language support"
});
const FIELDS=["Audience","Approximate participants","Delivery preference","Preferred start","Town / district"];
function el(tag,className,text){
 const node=document.createElement(tag);if(className)node.className=className;
 if(text!==undefined)node.textContent=text;return node;
}
function fieldValue(message,label){
 const item=String(message||"").split(/\r?\n/).find(line=>line.trimStart().toLowerCase().startsWith(label.toLowerCase()+":"));
 return item?item.trimStart().slice(label.length+1).trim().slice(0,200)||"Not specified":"Not specified";
}
function safestText(text,max=12000){
 // PII removal is best-effort, not a guarantee: human privacy review remains required.
 return String(text||"").slice(0,max)
  .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,"[EMAIL REMOVED]")
  .replace(/(?:\+?\d[\d ()-]{8,}\d)/g,"[PHONE REMOVED]");
}
function hasLiveCosting(snapshot){
 const result=snapshot?.result;
 return !!(result?.valid&&result.hasPriced&&Number.isFinite(result.grandTotal));
}
export function evaluateDraftReadiness(snapshot,checked){
 const checks=Array.isArray(checked)?checked:[];
 const result=snapshot?.result;
 const blockers=[];
 if(!hasLiveCosting(snapshot))blockers.push("Enter valid internal costing.");
 if(hasLiveCosting(snapshot)&&!result.allReviewed)blockers.push("Review every cost category or mark it Not applicable.");
 if(snapshot?.isDemo)blockers.push("Replace fictional DEMO rates with independently verified estimates.");
 if(checks.length!==4||!checks.every(Boolean))blockers.push("Complete all four internal review checks.");
 return {ready:!blockers.length,blockers};
}
export function makeInternalProposalDraft(enquiry,scopeDraft,snapshot,reviewed=false){
 const track=TRACKS[enquiry?.interest]||"Education or publishing programme (unverified)";
 const msg=String(enquiry?.message||"");
 const cost=hasLiveCosting(snapshot)?snapshot.result:null;
 const demo=!!snapshot?.isDemo;
 const budgetBlock=cost?[
  "DIRECT COSTS (INTERNAL ONLY): "+money(cost.subtotal),
  "Overhead ("+cost.overheadRate+"%): "+money(cost.overhead),
  "Contingency ("+cost.contingencyRate+"%): "+money(cost.contingency),
  "INTERNAL COST ESTIMATE: "+money(cost.grandTotal),
  "Cost categories reviewed: "+cost.completed+" / "+cost.totalLines,
  demo?"CRITICAL: FICTIONAL DEMO DATA — do not use for a real programme or quotation."
      :"Pricing evidence must still be independently verified.",
  !cost.allReviewed?"WARNING: incomplete categories — total is a partial estimate.":"",
  "Client-facing price, tax treatment, margin, deposit and payment terms: NOT PROPOSED"
 ]:["NO VALID INTERNAL COSTING HAS BEEN ENTERED.",
     "Amounts, prices, margins, taxes and financial commitments: NOT PROPOSED."];
 const lines=[
  "READMALAWI | LEARNING & AI LAB",
  "INSTITUTIONAL PROGRAMME CONCEPT — INTERNAL TEST PROPOSAL",
  "DRAFT ONLY | NOT FOR DISTRIBUTION, SIGNATURE, QUOTATION OR INVOICING",
  "",
  "Document stage: "+(reviewed?"REVIEWED FOR FOUNDER CONSIDERATION (TEST ONLY)":"INTERNAL DRAFT — REVIEW PENDING"),
  "Final founder approval: NOT GRANTED",
  "Official launch: NOT AUTHORISED",
  "Private enquiry reference: "+String(enquiry?.id||"").slice(0,65),
  "Proposed service: "+track,
  "Prepared by: ReadMalawi Learning & AI Lab (development team)",
  "Client organisation / contact name: OMITTED FROM EXPORT BY DESIGN",
  "",
  "01  OPPORTUNITY AND LEARNER CONTEXT",
  ...FIELDS.map(label=>label+": "+safestText(fieldValue(msg,label),200)),
  "Client needs are self-reported and must be verified before contract discussion.",
  "",
  "02  PROGRAMME PURPOSE AND EXPECTED OUTCOMES",
  "Proposed purpose: Improve relevant literacy, study, responsible AI or publication outcomes for the identified audience.",
  "Specific indicators, baseline, curriculum alignment and educator assessment: TO BE AGREED.",
  "",
  "03  TECHNICAL SCOPE AND POSSIBLE DELIVERY METHOD",
  "This section includes the internal, editable scope worksheet; it is not a promise to deliver:",
  "",
  safestText(scopeDraft||"No scope drafted yet."),
  "",
  "04  DELIVERY, RESOURCES AND SAFEGUARDING",
  "- Facilitator expertise, availability and location: NOT VERIFIED",
  "- Timeline and learning schedule: SUBJECT TO PLANNING",
  "- Devices, internet, materials and accessibility: TO VERIFY",
  "- Child safeguarding, school consent and data protection: HUMAN REVIEW REQUIRED",
  "- Copyright, translations, editorial approval and licensing: WRITTEN PERMISSIONS REQUIRED",
  "- AI reliability, learner privacy, age suitability and human oversight: TO VERIFY",
  "",
  "05  INTERNAL BUDGET — NOT A SELLING PRICE",
  ...budgetBlock.filter(Boolean),
  "Cost-source notes: "+safestText(snapshot?.assumptions||"None recorded.",1600),
  "",
  "06  PROJECT RISKS AND ASSUMPTIONS",
  "- Rights, educator availability, supervision, connectivity and financial requirements may change the scope.",
  "- No school pilot has been scheduled or delivered through this draft.",
  "- ReadMalawi's free reading access is not being resold or restricted.",
  "- This document makes no claim of NGO registration or prior physical book distribution.",
  "",
  "07  RESPONSIBILITY AND REVIEW CHECKPOINTS",
  "[ ] Verify objectives, outputs and learning measures with a competent programme lead.",
  "[ ] Validate tutor/supplier rates, tax treatment and legal contracting basis.",
  "[ ] Verify licensing, accessibility, data handling and child safeguarding where relevant.",
  "[ ] Complete internal management and founder review before any client-facing material.",
  "Founder authorisation: NOT GRANTED; DO NOT SEND.",
  "",
  "08  PROPOSED NEXT INTERNAL STEP",
  "Resolve missing information and prepare a revised scope and cost model for founder review.",
  "This document cannot itself approve costs, trigger procurement, book sessions or contact a client.",
  "",
  "READMALAWI · TIYENI TIWELENGE · PRELAUNCH DEVELOPMENT ONLY",
  "Local browser draft; never automatically uploaded, emailed, invoiced or paid."
 ];
 return lines.join("\n")+"\n";
}
function escapeHtml(text){
 return String(text).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
export function formattedInternalProposalHtml(body){
 const text=String(body||"");
 const title="ReadMalawi | Internal TEST programme proposal";
 const rows=text.split(/\r?\n/);
 const headings=/^(?:0[1-8]  [A-Z]|READMALAWI \| LEARNING|INSTITUTIONAL PROGRAMME CONCEPT)/;
 const paragraphs=[];
 for(const row of rows){
  if(row===""){paragraphs.push('<div class="gap"></div>');continue}
  const tag=headings.test(row)?"h2":"p";
  paragraphs.push("<"+tag+">"+escapeHtml(row)+"</"+tag+">");
 }
 return [
 '<!doctype html><html lang="en"><head><meta charset="utf-8">',
 '<meta name="viewport" content="width=device-width,initial-scale=1">',
 '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;;style-src &#39;unsafe-inline&#39;;base-uri &#39;none&#39;;form-action &#39;none&#39;">',
 '<title>'+escapeHtml(title)+'</title>',
 '<style>',
 '*{box-sizing:border-box}body{font-family:system-ui,-apple-system,Arial,sans-serif;color:#203a31;background:#f4f7f4;margin:0;line-height:1.65}',
 'header{padding:37px max(20px,calc((100% - 840px)/2));background:#0b3f35;color:white}',
 'header .brand{font-weight:900;font-size:22px;letter-spacing:-.04em}header .sub{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#e6cb8e}',
 'main{max-width:840px;margin:25px auto;padding:32px;background:white;box-shadow:0 6px 30px #17412b1a}',
 'h2{font-size:18px;color:#115541;line-height:1.4;margin:20px 0 10px;overflow-wrap:anywhere}',
 'p{font-size:14px;white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 7px}',
 '.gap{height:10px}.warning{padding:15px;border:1px solid #d9bc7a;border-radius:9px;background:#fff3d9;margin:0 0 20px;font-weight:750;color:#694c1d}',
 'footer{max-width:840px;margin:8px auto 35px;padding:0 20px;color:#6a7c70;font-size:12px}',
 '@media(max-width:600px){main{margin:12px;padding:18px}header{padding:24px 18px}p{font-size:14px}}',
 '@media print{@page{size:A4;margin:17mm}body{background:white}header{padding:0 0 12px;background:white;color:#123d30;border-bottom:2px solid #126349}header .sub{color:#74591f}main{box-shadow:none;margin:0;padding:18px 0}h2{break-after:avoid}p{break-inside:avoid}footer{margin:0}}',
 '</style></head><body>',
 '<header><div class="brand">ReadMalawi</div><div class="sub">Learning &amp; AI Lab · Internal development</div></header>',
 '<main><div class="warning">PRELAUNCH TEST DOCUMENT — NOT AN APPROVED PROPOSAL, QUOTATION, CONTRACT OR PAYMENT REQUEST.</div>',
 ...paragraphs,
 '</main><footer>ReadMalawi · Tiyeni tiwelenge · Private internal test copy. Not authorised for distribution.</footer></body></html>'
 ].join("");
}
function downloadBlob(filename,contents,mimetype){
 const url=URL.createObjectURL(new Blob([contents],{type:mimetype}));
 const a=document.createElement("a");a.href=url;a.download=filename;
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export function attachInternalProposalBuilder(root,enquiry,source={}){
 if(!root||!TRACKS[enquiry?.interest])return;
 const testing=(window.READMALAWI_CONFIG||{}).sitePhase!=="production";
 if(!testing)return; // Production commercial workflows require independent founder approval and controls.
 const panel=el("section","proposal-builder");
 const toggle=el("button","btn secondary","Prepare TEST proposal draft");
 toggle.type="button";toggle.setAttribute("aria-expanded","false");
 const body=el("div","proposal-body");body.hidden=true;
 const title=el("h3","","Institutional programme concept");
 const explainer=el("p","muted","Pulls your current local scope and costing into an editable internal draft. No customer names or emails are inserted automatically. This does not submit, email, approve or invoice anything.");
 const firstActions=el("div","actions");
 const create=el("button","btn","Generate / refresh TEST proposal");create.type="button";
 firstActions.append(create);
 const docLabel=el("label","proposal-label","Editable internal proposal content");
 const editor=el("textarea","proposal-editor");editor.rows=20;editor.maxLength=30000;
 editor.placeholder="Tap Generate / refresh TEST proposal. Your scope and costing are used only in this browser.";
 docLabel.append(editor);
 const review=el("fieldset","proposal-review");
 const legend=el("legend","","Internal readiness checks (not founder approval)");review.append(legend);
 const checks=[
  "Programme goals, audience and scope have been reviewed",
  "Cost evidence and all cost categories have been verified",
  "Safeguarding, licensing, privacy and accessibility have been reviewed",
  "Legal/tax requirements and trainer availability have been reviewed"
 ];
 const boxes=checks.map(label=>{
  const line=el("label","proposal-review-item");
  const checkbox=document.createElement("input");checkbox.type="checkbox";
  line.append(checkbox,document.createTextNode(label));review.append(line);return checkbox;
 });
 const mark=el("button","btn secondary","Mark TEST draft ready for founder review");
 mark.type="button";mark.disabled=true;
 const info=el("p","proposal-status","No draft generated.");info.setAttribute("aria-live","polite");
 const actions=el("div","actions");
 const txt=el("button","btn secondary","Save internal draft (.txt)");txt.type="button";txt.disabled=true;
 const html=el("button","btn secondary","Download formatted draft (.html)");html.type="button";html.disabled=true;
 const close=el("button","btn secondary","Close proposal");close.type="button";
 actions.append(mark,txt,html,close);
 const warning=el("p","cost-warning","INTERNAL TEST ONLY: even after review, the founder has NOT approved this proposal for customer distribution. No client-facing pricing or contract can be issued here.");
 body.append(title,explainer,firstActions,docLabel,review,actions,info,warning);
 panel.append(toggle,body);root.append(panel);
 let reviewMarked=false;
 function currentSnapshot(){
  const snapshot=source.getCostingSnapshot?.()||{};
  return snapshot;
 }
 function readiness(){
  return evaluateDraftReadiness(currentSnapshot(),boxes.map(x=>x.checked));
 }
 function statusUpdate(){
  const current=readiness();
  mark.disabled=!editor.value.trim()||!current.ready;
  txt.disabled=html.disabled=!editor.value.trim();
  if(!reviewMarked)info.textContent=current.ready
   ?"All local readiness checks met. You may flag this TEST draft for founder review; final approval is still not granted."
   :current.blockers.slice(0,3).join(" ")+" All actions remain internal TEST only.";
  else info.textContent="✓ Marked READY FOR FOUNDER REVIEW (TEST ONLY). No founder approval, client contact, quote or database update occurred.";
 }
 toggle.addEventListener("click",()=>{
  const open=body.hidden;body.hidden=!open;toggle.setAttribute("aria-expanded",String(open));
  toggle.textContent=open?"Hide TEST proposal draft":"Prepare TEST proposal draft";
  if(open&&editor.value.trim()===""){const scope=source.getDraft?.()||"";editor.value=makeInternalProposalDraft(enquiry,scope,currentSnapshot());}
  statusUpdate();
 });
 create.addEventListener("click",()=>{
  if(editor.value.trim()&&!window.confirm("Replace the current editable TEST proposal with the latest programme scope and costing? Unsaved edits will be lost."))return;
  const scope=source.getDraft?.()||"";
  editor.value=makeInternalProposalDraft(enquiry,scope,currentSnapshot(),false);
  reviewMarked=false;boxes.forEach(b=>b.checked=false);
  statusUpdate();
  info.textContent="Draft generated locally. Review and edit it before exporting. No messages or costs were submitted.";
 });
 boxes.forEach(b=>b.addEventListener("change",()=>{reviewMarked=false;statusUpdate()}));
 editor.addEventListener("input",()=>{reviewMarked=false;statusUpdate()});
 mark.addEventListener("click",()=>{
  const ready=readiness();
  if(!ready.ready)return;
  // This records only a local TEST draft status, not a production authorisation.
  reviewMarked=true;
  editor.value=makeInternalProposalDraft(enquiry,source.getDraft?.()||"",currentSnapshot(),true);
  statusUpdate();
 });
 txt.addEventListener("click",()=>{
  const content=editor.value.trim();if(!content)return;
  const filename="ReadMalawi_TEST_Internal_Proposal.txt",data=content+"\n";
  const start=()=>downloadBlob(filename,data,"text/plain;charset=utf-8");
  start();
  showDownloadPanel({filename,content:data,onDownload:start,trigger:txt});
  info.textContent="TEST proposal download requested. Internal draft only — no approval or customer communication.";
 });
 html.addEventListener("click",()=>{
  const content=editor.value.trim();if(!content)return;
  const filename="ReadMalawi_TEST_Internal_Proposal.html";
  downloadBlob(filename,formattedInternalProposalHtml(content),"text/html;charset=utf-8");
  info.textContent="Formatted HTML draft requested from your browser. This is not a Word .docx file or a client-facing proposal.";
 });
 close.addEventListener("click",()=>{
  body.hidden=true;toggle.setAttribute("aria-expanded","false");
  toggle.textContent="Prepare TEST proposal draft";toggle.focus();
 });
}
