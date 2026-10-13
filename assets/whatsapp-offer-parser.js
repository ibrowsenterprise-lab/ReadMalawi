// ReadMalawi WhatsApp book-offer parser — no network, logging, database, or persistence.
// Extract only approximate book quantity and GENERAL AREA; reject ambiguous details.
// Donor is never required to give authors, ISBNs, personal names, addresses or numbers.
export function isPrivatePickupDetail(location){
 const area=String(location||"");
 return /(?:\+?\d[\d ()-]{7,}\d)|(?:\b(?:street|road)\s+(?:address|number|no\.?|#|\d+))|(?:\b(?:house|plot|flat|apartment)\s*(?:number|no\.?|#)?\s*\d+)|(?:\bp\.?\s*o\.?\s*box\b)|(?:\b(?:street\s+address|residential\s+address)\b)/i.test(area);
}
export function parseWhatsAppBookOffer(source){
 const message=String(source??"").replace(/[\u200b-\u200d\ufeff]/g,"").trim();
 if(!message||message.length>2500)return {valid:false,message:"Paste a short WhatsApp book-offer message (maximum 2,500 characters)."};
 // A quantity is counted ONLY when immediately linked to books/mabuku, not to a
 // date, account, donor phone number, school, vehicle or other unrelated number.
 const patterns=[
  /\b(\d{1,5})\s*(?:(?:physical|printed|old)\s+)?(?:books?|mabuku|ma[\s-]*books?)\b/gi,
  /\b(?:books?|mabuku)\s*[:=-]?\s*(\d{1,5})\b/gi
 ];
 const counts=[];
 for(const pattern of patterns){
  for(const match of message.matchAll(pattern)){
   const n=Number(match[1]);
   if(Number.isInteger(n)&&n>=1&&n<=50000)counts.push(n);
  }
 }
 const unique=[...new Set(counts)];
 if(unique.length!==1)return {valid:false,message:unique.length?"More than one book quantity found. Enter the correct number manually.":"I couldn't reliably identify a book quantity. Enter the number manually."};
 const areaPatterns=[
  /\bmy\s+general\s+town\s*\/\s*area\s+is\s+([^\r\n.!?;]+)/i,
  /\b(?:town\s*\/\s*area|general\s+area|location|town|area)\s*:\s*([^\r\n.!?;]+)/i,
  /\b(?:i(?:'m|\s+am)\s+(?:based\s+)?in)\s+([^\r\n.!?;]+)/i,
  /\b(?:\d{1,5}\s*(?:physical\s+)?(?:books?|mabuku)\s+(?:here\s+)?(?:in|from|at)\s+)([^\r\n.!?;]+)/i,
  /\b(?:\bku\s+)([A-Za-z][^\r\n.!?;]+)/i
 ];
 let area="";
 for(const pattern of areaPatterns){
  const match=message.match(pattern);
  if(match){area=match[1].trim().replace(/\s+/g," ");break;}
 }
 if(!area||area.length<2||area.length>95)return {valid:false,message:"I couldn't reliably identify a general town/area. Enter it manually."};
 if(isPrivatePickupDetail(area))return {valid:false,message:"A detailed address or contact number may be included. Enter only the general town/area manually."};
 if(/(?:https?:\/\/|@|<|>)/i.test(area))return {valid:false,message:"The area contains a link or other unexpected text. Enter the general area manually."};
 return {valid:true,book_count:unique[0],general_area:area};
}
