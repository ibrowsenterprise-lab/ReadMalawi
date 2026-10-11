// ReadMalawi: share a robust browser loader for Supabase's public client SDK.
// This file contains no private credentials.
const CDN_URLS = [
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm",
  "https://esm.sh/@supabase/supabase-js@2?bundle"
];
let pending = null;
const timeout = (milliseconds) => new Promise((_, reject) => {
  setTimeout(() => reject(new Error("Network timeout")), milliseconds);
});
export function getSupabaseModule(){
  if (!pending) {
    pending = Promise.any(CDN_URLS.map(async url => {
      const mod = await Promise.race([import(/* @vite-ignore */ url), timeout(11000)]);
      if (!mod || typeof mod.createClient !== "function") throw new Error("Invalid SDK response");
      return mod;
    })).catch(() => {
      pending = null;
      throw new Error("Could not load the secure sign-in library. Check your internet connection, turn off blocking extensions for this site, and refresh the page.");
    });
  }
  return pending;
}
