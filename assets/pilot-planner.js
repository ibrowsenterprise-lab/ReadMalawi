import {showDownloadPanel} from "./download-panel.js?v=20261013-readable-preview";
// ReadMalawi INTERNAL programme scoping: local-only, rule-based and editable.
// Loaded by the administrator inbox after librarian authentication.
// Never quotes fees, emails clients, sends AI prompts, persists drafts or books sessions.
const SERVICE_TYPES = Object.freeze({
  education_services: {
    name: "School reading / study-skills pilot",
    outline: [
      "Agree reading level, accessibility needs, language and teacher supervision.",
      "Develop a short original or appropriately licensed reading activity and comprehension practice.",
      "Facilitate a small supervised pilot; do not claim enrolment or delivery before it happens.",
      "Collect voluntary, non-identifying feedback and review learning outcomes with educators."
    ],
    questions: [
      "Which reading difficulties and curriculum objectives matter most?",
      "Who approves child safeguarding, consent and teacher supervision?",
      "What devices, data connectivity, approved texts and facilitators are available?"
    ]
  },
  ai_services: {
    name: "Responsible AI literacy / training workshop",
    outline: [
      "Agree participant baseline and intended AI learning outcomes.",
      "Explain AI limitations, verification, prompt literacy, privacy and copyright in practical terms.",
      "Run supervised exercises using fictional or permitted, non-confidential learning material.",
      "Evaluate comprehension with a short human-reviewed exercise and feedback."
    ],
    questions: [
      "Which AI tools and work activities are in scope?",
      "Are any learners minors, and what supervision and safeguarding apply?",
      "Which privacy, intellectual-property and institutional policies must be respected?"
    ]
  },
  author_services: {
    name: "Author / publisher / translation support",
    outline: [
      "Clarify rights ownership and the exact permission or licensing basis.",
      "Define the editorial, accessibility, digital showcase or language-review deliverable.",
      "Produce a limited sample only from material the client is authorised to use.",
      "Arrange independent human quality and language review before any public release."
    ],
    questions: [
      "Who owns the material and can provide written rights evidence?",
      "Which languages, audience and accessibility formats are required?",
      "Who will approve translations or edited text, and what licensing applies?"
    ]
  }
});
function lineValue(message,label){
  const prefix=label.toLocaleLowerCase("en")+":";
  const line=String(message||"").split(/\r?\n/).find(x=>x.trimStart().toLocaleLowerCase("en").startsWith(prefix));
  const value=line?line.trimStart().slice(prefix.length).trim():"";
  return value.slice(0,220)||"Not yet specified";
}
function submittedGoals(message){
  const source=String(message||"");
  const match=source.match(/(?:^|\n)Learning goals \/ project brief:\s*\n([\s\S]*)/i);
  return match?match[1].trim().slice(0,1400)||"Needs clarification":"Needs clarification";
}
export function makePilotBrief(enquiry){
  const track=SERVICE_TYPES[enquiry?.interest];
  if(!track)return "";
  const message=String(enquiry?.message||"");
  const isTest=message.includes("[READMALAWI TEST]")||String(enquiry?.admin_notes||"").includes("[READMALAWI TEST]");
  const items=track.outline.map((x,i)=>String(i+1)+". "+x).join("\n");
  const questions=track.questions.map(x=>"- "+x).join("\n");
  return [
    "READMALAWI | INTERNAL PILOT SCOPING WORKSHEET",
    "PRELAUNCH TEST DRAFT — NOT A PROPOSAL, CONTRACT, QUOTATION OR CONFIRMED BOOKING",
    "DO NOT EMAIL, INVOICE OR COLLECT PAYMENT FROM A TEST RECORD.",
    "",
    "Enquiry reference (private): "+String(enquiry?.id||"").slice(0,65),
    "Enquiry type: "+track.name,
    "Record stage: "+(isTest?"TEST record":"UNVERIFIED — treat as TEST during development"),
    "Organisation and contact details: withheld from this export by design",
    "Audience (self-reported): "+lineValue(message,"Audience"),
    "Approximate participants (self-reported): "+lineValue(message,"Approximate participants"),
    "Delivery preference (self-reported): "+lineValue(message,"Delivery preference"),
    "Preferred start (self-reported): "+lineValue(message,"Preferred start"),
    "Town / district (self-reported): "+lineValue(message,"Town / district"),
    "",
    "LEARNING GOALS / REQUEST (UNVERIFIED)",
    submittedGoals(message),
    "",
    "POSSIBLE PILOT STRUCTURE (SUGGESTIONS ONLY)",
    items,
    "",
    "QUESTIONS TO RESOLVE BEFORE ANY PROPOSAL",
    questions,
    "",
    "SERVICE DELIVERY READINESS",
    "- Tutor/facilitator availability: NOT CONFIRMED",
    "- Curriculum suitability and educator review: REQUIRED",
    "- Child safeguarding/parental permission, where relevant: REQUIRED",
    "- Content copyright, licences and translation review: REQUIRED",
    "- AI tool availability, privacy and usage budget: NOT CONFIRMED",
    "- Provider contracting authority and legal compliance: TO VERIFY",
    "- Scope, deliverables, delivery date, staffing and costs: TO AGREE",
    "- Price, payment arrangements or sponsorship commitment: NOT OFFERED",
    "",
    "INTERNAL NEXT STEPS (NOT SENT TO THE ENQUIRER)",
    "[ ] Confirm learning goals, number of learners and required accessibility.",
    "[ ] Verify content permissions, safe AI practices and supervision.",
    "[ ] Validate trainer availability and prepare an itemised internal budget.",
    "[ ] Request founder approval before any real customer communication or quotation.",
    "[ ] Record only verified pilot results after approved delivery.",
    "",
    "FREE READING REMAINS FREE. No ReadMalawi public or third-party book link is resold.",
    "Generated locally by a rule-based administrator tool, not generative AI.",
    "This draft is not stored by ReadMalawi and contains no automatic client contact."
  ].join("\n");
}
export function attachPilotPlanner(root,enquiry){
  if(!root||!SERVICE_TYPES[enquiry?.interest])return;
  const wrap=document.createElement("section");
  wrap.className="pilot-planner";
  const create=document.createElement("button");
  create.type="button";create.className="btn secondary";
  create.textContent="Prepare TEST pilot brief";
  create.setAttribute("aria-expanded","false");
  const panel=document.createElement("div");
  panel.className="pilot-planner-panel";panel.hidden=true;
  const heading=document.createElement("h3");
  heading.textContent="Internal pilot scope — draft only";
  const note=document.createElement("p");
  note.className="muted";
  note.textContent="Generated from this enquiry using a rule-based template. You can edit the text below. It is NOT automatically saved, emailed or sent to AI. No prices or bookings are offered.";
  const label=document.createElement("label");
  label.className="pilot-planner-label";
  label.textContent="Editable internal scope draft";
  const textarea=document.createElement("textarea");
  textarea.className="pilot-planner-output";
  textarea.rows=17;
  textarea.maxLength=12000;
  label.append(textarea);
  const download=document.createElement("button");
  download.className="btn secondary";download.type="button";download.textContent="Save draft (.txt)";
  const close=document.createElement("button");
  close.className="btn secondary";close.type="button";close.textContent="Close draft";
  const feedback=document.createElement("p");
  feedback.className="pilot-feedback";feedback.setAttribute("role","status");feedback.setAttribute("aria-live","polite");
  const controls=document.createElement("div");
  controls.className="actions";controls.append(download,close);
  panel.append(heading,note,label,controls,feedback);
  create.addEventListener("click",()=>{
    const open=panel.hidden;
    panel.hidden=!open;
    create.setAttribute("aria-expanded",String(open));
    create.textContent=open?"Hide TEST pilot brief":"Prepare TEST pilot brief";
    if(open){
      if(!textarea.value)textarea.value=makePilotBrief(enquiry);
      feedback.textContent="Private editable draft ready. It has not been sent or stored.";
      panel.scrollIntoView({behavior:"smooth",block:"nearest"});
    }
  });
  download.addEventListener("click",()=>{
    const content=textarea.value.trim();
    if(!content){feedback.textContent="Draft is empty. Prepare the brief first.";return}
    const filename="ReadMalawi_TEST_Pilot_Brief.txt";
    const exportText=content+"\n";
    const requestDownload=()=>{
      const url=URL.createObjectURL(new Blob([exportText],{type:"text/plain;charset=utf-8"}));
      const a=document.createElement("a");
      a.href=url;a.download=filename;
      document.body.append(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),15000);
    };
    requestDownload();
    feedback.textContent="Download requested. The pop-up can preview your private draft. Nothing has been emailed or saved online.";
    showDownloadPanel({filename,content:exportText,onDownload:requestDownload,trigger:download});
  });
  close.addEventListener("click",()=>{
    panel.hidden=true;create.setAttribute("aria-expanded","false");create.textContent="Prepare TEST pilot brief";create.focus();
  });
  wrap.append(create,panel);
  root.append(wrap);
  // Read-only local draft accessor for the test proposal builder; no database storage.
  return {
    getDraft:()=>textarea.value.trim()||makePilotBrief(enquiry),
    hasEditedDraft:()=>textarea.value.trim().length>0
  };
}
