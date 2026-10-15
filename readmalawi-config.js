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
    minimumMwk: 500,
    donationUrl: "", // Add only the verified public donation link.
    recipientName: "", // Actual verified account holder; never infer from branding.
    verified: false
  }),
  donationsEnabled: false
});
