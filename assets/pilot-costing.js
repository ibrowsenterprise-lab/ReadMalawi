// ReadMalawi Learning & AI Lab: PRIVATE, browser-only, prelaunch cost modelling.
// This tool receives enquiries only in the authenticated librarian inbox.
// It does not store costing, contact anyone, calculate a client price, or request payment.
// All rates and quantities start blank: never invent supplier or facilitator costs.
const COST_ITEMS=Object.freeze([
 {name:"Programme design and preparation",unit:"hour"},
 {name:"Facilitator / educator delivery",unit:"hour"},
 {name:"Programme coordination and administration",unit:"hour"},
 {name:"Learning materials and accessibility",unit:"learner"},
 {name:"Internet, data and online tools",unit:"session"},
 {name:"Venue, equipment or delivery platform",unit:"session"},
 {name:"Travel and local logistics",unit:"trip"},
 {name:"Human review, translation and safeguarding",unit:"hour"}
]);
const fmt=new Intl.NumberFormat("en-MW",{minimumFractionDigits:2,maximumFractionDigits:2});
function validatedNumber(value,max=1e9){
 const s=String(value??"").trim();
 if(s==="")return null;
 // Reject scientific notation, negatives, separators, infinity, and excess precision.
 if(!/^(?:\d+)(?:\.\d{1,2})?$/.test(s))return NaN;
 const valueNumber=Number(s);
 return Number.isFinite(valueNumber)&&valueNumber<=max?valueNumber:NaN;
}
export function computePilotCost(lines,overheadInput="0",contingencyInput="0"){
 const costs=[],errors=[];
 const items=Array.isArray(lines)?lines:[];
 let subtotal=0, completed=0;
 items.forEach((line,i)=>{
  const name=String(line?.name||COST_ITEMS[i]?.name||"Expense").slice(0,120);
  const quantityText=String(line?.quantity??"").trim(),rateText=String(line?.rate??"").trim();
  const excluded=!!line?.notApplicable;
  if(excluded){
   costs.push({name,quantity:null,rate:null,amount:0,state:"not_applicable"});
   completed++;return;
  }
  if(quantityText===""&&rateText===""){
   costs.push({name,quantity:null,rate:null,amount:null,state:"missing"});
   return;
  }
  if(quantityText===""||rateText===""){
   errors.push(name+": supply both quantity and unit cost, or mark Not applicable.");
   costs.push({name,amount:null,state:"incomplete"});
   return;
  }
  const q=validatedNumber(quantityText,1000000),r=validatedNumber(rateText);
  if(!Number.isFinite(q)||!Number.isFinite(r)||q===0){
   errors.push(name+": enter a positive quantity and a valid non-negative unit cost.");
   costs.push({name,amount:null,state:"invalid"});
   return;
  }
  const amount=Math.round(q*r*100)/100;
  if(!Number.isFinite(amount)||amount>1e12){
   errors.push(name+": amount exceeds the supported internal estimate range.");
   costs.push({name,amount:null,state:"invalid"});
   return;
  }
  costs.push({name,quantity:q,rate:r,amount,state:"priced"});
  subtotal+=amount;completed++;
 });
 const overheadRate=validatedNumber(overheadInput,100);
 const contingencyRate=validatedNumber(contingencyInput,100);
 if(!Number.isFinite(overheadRate)||!Number.isFinite(contingencyRate)){
  errors.push("Overhead and contingency percentages must be between 0 and 100.");
 }
 if(subtotal>1e12)errors.push("Total direct costs are too large to calculate safely.");
 if(errors.length)return {valid:false,errors,costs,completed,totalLines:items.length};
 const overhead=subtotal*overheadRate/100;
 const contingency=(subtotal+overhead)*contingencyRate/100;
 const grandTotal=Math.round((subtotal+overhead+contingency)*100)/100;
 const valid=Number.isFinite(grandTotal)&&grandTotal<=1e12;
 if(!valid)return {valid:false,errors:["Total estimate exceeds safe calculation limits."],costs,completed,totalLines:items.length};
 return {valid:true,costs,completed,totalLines:items.length,subtotal,overhead,contingency,grandTotal,overheadRate,contingencyRate,allReviewed:completed===items.length,hasPriced:costs.some(x=>x.state==="priced")};
}
function make(tag,className,text){
 const element=document.createElement(tag);
 if(className)element.className=className;
 if(text!==undefined)element.textContent=text;
 return element;
}
function fileDownload(filename,content,mimeType){
 const url=URL.createObjectURL(new Blob([content],{type:mimeType}));
 const link=document.createElement("a");
 link.href=url;link.download=filename;
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),15000);
}
function costReport(enquiry,result,assumptions){
 const details=[
 "READMALAWI | PRELAUNCH TEST INTERNAL COSTING WORKSHEET",
 "NOT A CUSTOMER QUOTATION, TAX INVOICE, PRICE LIST, CONTRACT OR BOOKING",
 "No client names, email addresses, telephone numbers or customer account details are exported.",
 "Currency: Malawi Kwacha (MWK); costs are blank until researched and entered by an administrator.",
 "Enquiry internal ID: "+String(enquiry?.id||"").slice(0,65),
 "Service category: "+String(enquiry?.interest||"").replaceAll("_"," "),
 "Costing completeness: "+result.completed+" of "+result.totalLines+" categories reviewed",
 "WARNING: figures may be incomplete, tax/contracting charges and margin are excluded.",
 "",
 "DIRECT COST CATEGORIES",
 ...result.costs.map((item,i)=>{
  const unit=COST_ITEMS[i]?.unit||"unit";
  if(item.state==="not_applicable")return (i+1)+". "+item.name+" | Not applicable";
  if(item.state==="missing")return (i+1)+". "+item.name+" | NOT YET ESTIMATED";
  if(item.state!=="priced")return (i+1)+". "+item.name+" | INVALID ENTRY";
  return (i+1)+". "+item.name+" | "+item.quantity+" "+unit+" x MWK "+fmt.format(item.rate)+" = MWK "+fmt.format(item.amount);
 }),
 "",
 "DIRECT COST SUBTOTAL: MWK "+fmt.format(result.subtotal),
 "Overhead ("+result.overheadRate+"% of direct costs): MWK "+fmt.format(result.overhead),
 "Contingency ("+result.contingencyRate+"% of direct costs + overhead): MWK "+fmt.format(result.contingency),
 "INTERNAL ESTIMATED COST TOTAL: MWK "+fmt.format(result.grandTotal),
 "",
 "ASSUMPTIONS / COST-SOURCE VERIFICATION",
 String(assumptions||"").trim().slice(0,2500)||"No assumptions or supplier verification notes recorded.",
 "",
 "COMPLIANCE AND APPROVAL GATES",
 "[ ] Verify quantities, actual supplier rates and educator availability.",
 "[ ] Verify permitted learning material, local-language human review and child safeguarding.",
 "[ ] Check applicable tax treatment, licensing, insurance, contracting and liability obligations separately.",
 "[ ] Add any appropriate business margin only after authorisation; this is a COST ESTIMATE, not a selling price.",
 "[ ] Seek founder approval before sending a client proposal or making any real commitment.",
 "No information was automatically submitted to ReadMalawi, emailed, shared with AI or stored in Supabase.",
 "READMALAWI REMAINS IN TESTING MODE UNTIL EXPLICIT OFFICIAL LAUNCH APPROVAL."
 ];
 return details.join("\n")+"\n";
}
export function attachPilotCosting(root,enquiry){
 if(!root||!["education_services","ai_services","author_services"].includes(enquiry?.interest))return;
 const section=make("section","pilot-costing");
 const toggle=make("button","btn secondary","Prepare TEST internal costing");
 toggle.type="button";toggle.setAttribute("aria-expanded","false");
 const panel=make("div","pilot-costing-panel");panel.hidden=true;
 const title=make("h3","", "Internal programme costing — TEST ONLY");
 const lead=make("p","muted","Enter verified, internal quantities and unit costs in MWK. All rates start blank. Draft calculations stay on this device and are not client prices.");
 const categories=make("div","cost-categories");
 const controls=[];
 COST_ITEMS.forEach((item,i)=>{
  const card=make("div","cost-item");
  const title=make("h4","",String(i+1)+". "+item.name);
  const fields=make("div","cost-fields");
  const qtyLabel=make("label","cost-field","Quantity ("+item.unit+")");
  const quantity=document.createElement("input");
  quantity.type="number";quantity.min="0.01";quantity.max="1000000";quantity.step="0.01";quantity.inputMode="decimal";quantity.placeholder="Enter quantity";
  qtyLabel.append(quantity);
  const rateLabel=make("label","cost-field","Unit cost (MWK)");
  const rate=document.createElement("input");
  rate.type="number";rate.min="0";rate.max="1000000000";rate.step="0.01";rate.inputMode="decimal";rate.placeholder="Enter MWK cost";
  rateLabel.append(rate);
  fields.append(qtyLabel,rateLabel);
  const naLabel=make("label","cost-not-applicable");
  const na=document.createElement("input");na.type="checkbox";
  naLabel.append(na,document.createTextNode("Not applicable"));
  const lineTotal=make("p","cost-line-total","Not estimated");
  card.append(title,fields,naLabel,lineTotal);categories.append(card);
  controls.push({name:item.name,quantity,rate,na,lineTotal});
  na.addEventListener("change",()=>{quantity.disabled=rate.disabled=na.checked;recalc()});
  quantity.addEventListener("input",recalc);
  rate.addEventListener("input",recalc);
 });
 const addOns=make("div","cost-adjustments");
 function percentageInput(titleText){
  const label=make("label","cost-field",titleText);
  const input=document.createElement("input");
  input.type="number";input.min="0";input.max="100";input.step="0.01";input.value="0";input.inputMode="decimal";
  label.append(input);addOns.append(label);input.addEventListener("input",recalc);return input;
 }
 const overheadInput=percentageInput("Overhead (% of direct costs)");
 const contingencyInput=percentageInput("Contingency (% of direct costs + overhead)");
 const costSummary=make("div","cost-summary");
 const state=make("p","cost-feedback","Enter your verified costs to begin.");
 state.setAttribute("role","status");state.setAttribute("aria-live","polite");
 const notesLabel=make("label","cost-field","Cost sources, staffing assumptions and risks (internal only)");
 const notes=document.createElement("textarea");notes.rows=4;notes.maxLength=2500;
 notes.placeholder="Document where rates came from, available facilitators, safeguarding needs and anything still unverified.";
 notesLabel.append(notes);
 const actions=make("div","actions");
 const save=make("button","btn secondary","Download TEST costing (.txt)");
 save.type="button";save.disabled=true;
 const clear=make("button","btn secondary","Clear all figures");clear.type="button";
 const close=make("button","btn secondary","Close costing");close.type="button";
 actions.append(save,clear,close);
 const caution=make("p","cost-warning","Costing does not include verified taxes, margin, insurance, contracts or final programme delivery approval. The final cost is not a price offered to a customer.");
 panel.append(title,lead,categories,addOns,costSummary,state,notesLabel,caution,actions);
 const readLines=()=>controls.map(c=>({name:c.name,quantity:c.quantity.value,rate:c.rate.value,notApplicable:c.na.checked}));
 let latest=computePilotCost(readLines());
 function recalc(){
  latest=computePilotCost(readLines(),overheadInput.value,contingencyInput.value);
  controls.forEach((c,i)=>{
   const entry=latest.costs[i];
   c.lineTotal.textContent=entry.state==="priced"?"MWK "+fmt.format(entry.amount):entry.state==="not_applicable"?"Not applicable":entry.state==="missing"?"Not estimated":"Check quantity and rate";
  });
  if(!latest.valid){
   costSummary.replaceChildren();state.textContent=latest.errors.slice(0,3).join(" ");
   state.className="cost-feedback error";save.disabled=true;return;
  }
  costSummary.replaceChildren();
  const rows=[
   ["Direct costs","MWK "+fmt.format(latest.subtotal)],
   ["Overhead","MWK "+fmt.format(latest.overhead)],
   ["Contingency","MWK "+fmt.format(latest.contingency)],
   ["INTERNAL ESTIMATED COST","MWK "+fmt.format(latest.grandTotal)]
  ];
  rows.forEach(([label,amount])=>{
   const row=make("div","cost-sum-row");
   row.append(make("span","",label),make("strong","",amount));
   costSummary.append(row);
  });
  if(!latest.hasPriced){
   state.textContent="No priced cost items yet. Supply a verified quantity and unit cost before downloading.";
   save.disabled=true;
  }else{
   const complete=latest.allReviewed;
   state.textContent=complete
    ?"All "+latest.totalLines+" categories reviewed. INTERNAL DRAFT ONLY — check rates and approvals before using."
    :latest.completed+" of "+latest.totalLines+" categories reviewed. Estimate is PARTIAL; fill remaining items or mark Not applicable.";
   save.disabled=false;
  }
  state.className="cost-feedback";
 }
 toggle.addEventListener("click",()=>{
  const open=panel.hidden;
  panel.hidden=!open;toggle.setAttribute("aria-expanded",String(open));
  toggle.textContent=open?"Hide TEST internal costing":"Prepare TEST internal costing";
  if(open){recalc();panel.scrollIntoView({block:"nearest",behavior:"smooth"})}
 });
 save.addEventListener("click",()=>{
  recalc();
  if(!latest.valid||!latest.hasPriced)return;
  fileDownload("ReadMalawi_TEST_Internal_Costing.txt",costReport(enquiry,latest,notes.value),"text/plain;charset=utf-8");
  state.textContent="Costing draft downloaded to this device only. No client quote, payment or database update occurred.";
  state.className="cost-feedback success";
 });
 clear.addEventListener("click",()=>{
  if(!window.confirm("Clear all test costing figures and assumptions from this browser view? Nothing has been saved online."))return;
  controls.forEach(c=>{c.quantity.value="";c.rate.value="";c.na.checked=false;c.quantity.disabled=false;c.rate.disabled=false});
  overheadInput.value=contingencyInput.value="0";notes.value="";recalc();
 });
 close.addEventListener("click",()=>{panel.hidden=true;toggle.setAttribute("aria-expanded","false");toggle.textContent="Prepare TEST internal costing";toggle.focus()});
 section.append(toggle,panel);root.append(section);
}
