// ReadMalawi Reading Buddy — server-only AI gateway.
// Provider credentials live in Supabase Edge Function Secrets, never in website code.
// No conversations are written to ReadMalawi's database; minimal per-user request counts only.
const allowedOrigins = new Set([
  "https://readmalawi-library.onrender.com",
  "https://readmalawi.fyi",
  "https://www.readmalawi.fyi"
]);
const openaiCompatibleEndpoint = "https://api.openai.com/v1/chat/completions";
const sharedHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
};
const positive = (key: string) => (Deno.env.get(key) || "").trim();

function response(request: Request, status: number, data: Record<string, unknown>): Response {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = { ...sharedHeaders, "Vary": "Origin" };
  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "authorization, apikey, content-type, x-client-info";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

const systemInstructions = [
  "You are ReadMalawi Reading Buddy, a clear, helpful reading companion for adults and younger readers in a Malawi digital library.",
  "Use short, clear sentences. Ask at most one gentle follow-up question. You can help with reading comprehension, vocabulary, story discussion, recommended reading habits, and the Malawian languages Chichewa, Chitumbuka, Chiyao, Chilomwe, Chisena, Chitonga, as well as English and other languages.",
  "Malawian-language fluency varies. If unsure, say so; do not invent translations or claim native review.",
  "Never ask for contact details, real names, ages, passwords, school names, addresses, phone numbers, money or private information. Do not direct a child to message strangers.",
  "Never ask readers to navigate away from ReadMalawi or provide offsite links. Reading and discussions happen within ReadMalawi.",
  "You cannot read whole PDFs or see a book chapter unless the visitor provides a short passage they have permission to share. Do not claim you scanned the library's whole files.",
  "You will receive an approved titles list. Recommend only books listed there as available; do not invent hosted titles, availability, permission or audiobook access. The site has a Find Books button.",
  "Do not reproduce long passages of copyrighted works. For sensitive topics, give a short age-appropriate response and suggest speaking with a trusted adult. Do not provide dangerous instructions.",
  "Do not claim ReadMalawi is a registered NGO or charity or that it has delivered books physically. ReadMalawi currently has an online reading community and future ambitions.",
  "If asked about how you work, explain that ReadMalawi uses an external AI model securely behind the website and that AI responses can contain mistakes. Never claim it runs entirely on the visitor’s device.",
  "Keep responses around 40-150 words and focus on making reading exciting."
].join("\n");

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) return response(request, 403, { error: "origin_not_allowed" });
  if (request.method === "OPTIONS") return response(request, 200, { ok: true });
  const configured = Boolean(positive("READMALAWI_AI_KEY") && positive("SUPABASE_SERVICE_ROLE_KEY"));
  if (request.method === "GET") return response(request, 200, {
    ai_enabled: configured,
    sign_in_required: true,
    daily_limit: 10,
    message: configured ? "Secure AI is available for signed-in readers." : "Advanced AI is not activated yet. Guided book help is still available."
  });
  if (request.method !== "POST") return response(request, 405, { error: "method_not_allowed" });
  if (!configured) return response(request, 503, { error: "not_configured", message: "Advanced AI is not active yet. Use guided Reading Buddy for now." });
  const supabaseURL = positive("SUPABASE_URL");
  const anonKey = positive("SUPABASE_ANON_KEY");
  const serviceKey = positive("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseURL || !anonKey || !serviceKey) return response(request, 503, { error: "auth_not_configured" });
  const bearer = request.headers.get("authorization") || "";
  if (!/^Bearer [A-Za-z0-9._-]+$/.test(bearer)) return response(request, 401, { error: "sign_in_required" });
  const jwt = bearer.slice(7);
  let person: { id?: string } = {};
  try {
    const verified = await fetch(supabaseURL + "/auth/v1/user", {
      method: "GET",
      headers: { "apikey": anonKey, "Authorization": "Bearer " + jwt },
      signal: AbortSignal.timeout(7000)
    });
    if (!verified.ok) return response(request, 401, { error: "sign_in_required" });
    person = await verified.json();
    if (!person.id) return response(request, 401, { error: "sign_in_required" });
  } catch {
    return response(request, 503, { error: "sign_in_unavailable" });
  }
  const declaredSize = Number(request.headers.get("content-length") || 0);
  if (declaredSize > 8500) return response(request, 413, { error: "message_too_long" });
  let question = "";
  let rawHistory: unknown = [];
  try {
    const raw = await request.text();
    if (raw.length > 8500) return response(request, 413, { error: "message_too_long" });
    const parsed = JSON.parse(raw);
    if (typeof parsed.question !== "string") return response(request, 400, { error: "question_required" });
    question = parsed.question.trim();
    rawHistory = parsed.history;
  } catch { return response(request, 400, { error: "invalid_json" }); }
  if (question.length < 2 || question.length > 750) return response(request, 400, { error: "message_length" });
  if (/https?:\/\/|www\.|(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})|(?:\+?\d[\d \-()]{8,}\d)/i.test(question)) {
    return response(request, 400, { error: "private_information", message: "Please don't include links or personal contact details. Ask about books instead." });
  }
  const history: Array<{ role: "user" | "assistant"; content: string }> = [];
  if (Array.isArray(rawHistory)) {
    for (const part of rawHistory.slice(-6)) {
      if (typeof part === "object" && part !== null && (part.role === "user" || part.role === "assistant") && typeof part.content === "string" && part.content.length <= 750) {
        history.push({ role: part.role, content: part.content.trim() });
      }
    }
  }
  let titles: Array<Record<string, unknown>> = [];
  try {
    const rows = await fetch(supabaseURL + "/rest/v1/library_books?select=title,author,category,language,media_type&status=eq.approved&limit=100", {
      headers: { "apikey": anonKey, "Authorization": "Bearer " + jwt }, signal: AbortSignal.timeout(6500)
    });
    if (rows.ok) { const payload = await rows.json();if (Array.isArray(payload)) titles = payload.slice(0,100); }
  } catch { /* Show no book claims when approved catalogue is unavailable. */ }

  // Atomically reserve a bounded daily request only after auth, validation and provider readiness checks.
  try {
    const claim = await fetch(supabaseURL + "/rest/v1/rpc/readmalawi_claim_ai_turn_for_service", {
      method: "POST",
      headers: { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey, "Content-Type": "application/json" },
      body: JSON.stringify({ p_user_id: person.id }), signal: AbortSignal.timeout(7000)
    });
    if (!claim.ok) return response(request, 503, { error: "quota_check_unavailable" });
    const limit = await claim.json();
    if (!limit.allowed) return response(request, 429, {
      error: limit.reason || "quota_limit",
      message: limit.reason === "daily_limit" ? "You have used today's 10 AI questions. Please come back tomorrow." : limit.reason === "site_daily_limit" ? "Reading Buddy has reached today's AI capacity. Please use guided help or return tomorrow." : "Please wait a few seconds and try again."
    });
  } catch { return response(request, 503, { error: "quota_check_unavailable" }); }

  const key = positive("READMALAWI_AI_KEY");
  const model = positive("READMALAWI_AI_MODEL") || "gpt-4o-mini";
  const requestMessages = [
    { role: "system", content: systemInstructions + "\nAvailable ReadMalawi titles (approved metadata only): " + JSON.stringify(titles) },
    ...history,
    { role: "user", content: question }
  ];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18000);
    let remote: Response;
    try {
      remote = await fetch(openaiCompatibleEndpoint, {
        method: "POST", signal: controller.signal,
        headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: requestMessages, max_tokens: 360, temperature: 0.5, store: false })
      });
    } finally { clearTimeout(timer); }
    if (!remote.ok) {
      console.error("ReadMalawi AI provider error status", remote.status);
      return response(request, 503, { error: "ai_unavailable", message: "Reading Buddy's AI is unavailable right now. Please use guided help." });
    }
    const result = await remote.json();
    const answer = result?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) return response(request, 503, { error: "empty_ai_answer" });
    return response(request, 200, { answer: answer.trim().slice(0,2500), ai_generated: true });
  } catch {
    return response(request, 503, { error: "ai_timeout", message: "Reading Buddy took too long. Try again later." });
  }
});
