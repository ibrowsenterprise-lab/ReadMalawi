// Public Supabase configuration. Publishable keys are browser-safe; never put service_role keys here.
window.READMALAWI_CONFIG = Object.freeze({
  supabaseUrl: "https://ezejmipymjzfsnemgaig.supabase.co",
  supabasePublishableKey: "sb_publishable_SOOUwuIbpj2aTgUsfuEHdA_unL2aMUb",
  whatsappForumInviteUrl: "https://chat.whatsapp.com/EoH1rROh8Li4XddSjIjY4a", // Founder-provided invite for Lets Read Malawi WhatsApp group.
  sitePhase: "production",  // Founder authorised the public launch on 15 October 2026.
  publicationEnabled: false, // Additional book releases require separate administrative approval.
  customerNotificationsEnabled: false,
  bookingsEnabled: false,
  paymentsEnabled: false,
  financialSupport: Object.freeze({
    provider: "PayChangu",
    minimumMwk: 700,
    donationUrl: "", // Verified public hosted link only.
    recipientName: "", // Actual verified receiving account holder.
    verified: false
  }),
  donationsEnabled: false // Hosted checkout only; temporary transfer instructions are on the support page.
});

