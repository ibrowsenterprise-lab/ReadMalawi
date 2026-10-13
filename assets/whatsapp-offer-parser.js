// ReadMalawi WhatsApp book-offer parser.
// Pure browser-side extraction. Never sends, stores, logs or executes pasted chat text.
// Only approximate quantity and general area may be transferred to the existing TEST form.
export function parseWhatsAppBookOffer(source){
 const message=String(source??"").replace(/[\u200b-\u200d\ufeff]/g,"").trim();
 if(!message||message.length>2500)return {valid:false,message:"Paste a short WhatsApp book-offer message (maximum 2,500 characters)."};
 const counts=[
  /\b(?:offer(?:ing)?|have|donate|giving)\s+(?:(?:about|approximately|around|roughly)\s+)?(\d{1,5})\s+(?:physical\s+)?books?\b/gi,
  /\b(\d{1,5})\s+(?:physical\s+)?books?\s+(?:to\s+(?:donate|give)|available\s+for\s+donation)\b/gi
 ];
 const found=[];
 for(const pattern of counts){
  for(const match of message.matchAll(pattern)){
   const n=Number(match[1]);
   if(Number.isInteger(n)&&n>=1&&n<=50000)found.push(n);
  }
 }
 const unique=[...new Set(found)];
 if(unique.length!==1)return {valid:false,message:unique.length?"More than one quantity found. Enter the correct number of books manually.":"I couldn't reliably identify the book quantity. You can enter it manually."};
 const areaPatterns=[
  /\bmy\s+general\s+town\s*\/\s*area\s+is\s+([^\r\n.!?;]+)/i,
  /\b(?:town\s*\/\s*area|general\s+area|location|town|area)\s*:\s*([^\r\n.!?;]+)/i,
  /\b(?:i(?:'m|\s+am)\s+(?:based\s+)?in)\s+([^\r\n.!?;]+)/i
 ];
 let area="";
 for(const pattern of areaPatterns){
  const match=message.match(pattern);
  if(match){area=match[1].trim().replace(/\s+/g," ");break}
 }
 if(!area||area.length<2||area.length>95)return {valid:false,message:"I couldn't reliably identify a general town/area. Please enter it manually."};
 // Reject addresses and contact numbers. The collector does not need them.
 if(/(?:\+?\d[\d \-()]{7,}\d)|(?:\bstreet\s+(?:address|number)\b)|(?:\bhouse\s*(?:number|no\.?|#)\b)|(?:\bplot\s*(?:number|no\.?|#)\b)|(?:\bP\.?\s*O\.?\s*box\b)/i.test(area)){
  return {valid:false,message:"That location may contain private address or contact details. Enter only the general town/area manually."};
 }
 return {valid:true,book_count:unique[0],general_area:area};
}
