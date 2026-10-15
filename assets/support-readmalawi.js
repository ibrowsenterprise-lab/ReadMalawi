(() => {
  'use strict';
  const config = window.READMALAWI_CONFIG || {};
  const support = config.financialSupport || {};
  const button = document.getElementById('support-checkout');
  const unavailable = document.getElementById('support-unavailable');
  const recipient = document.getElementById('support-recipient');
  const note = document.getElementById('support-payment-note');
  if (!button || !unavailable || !recipient || !note) return;
  // A checkout URL alone must never enable collection.
  if (config.donationsEnabled !== true || support.verified !== true ||
      support.minimumMwk !== 700 || typeof support.recipientName !== 'string' ||
      !support.recipientName.trim() || typeof support.donationUrl !== 'string') return;
  let url;
  try { url = new URL(support.donationUrl); } catch { return; }
  if (url.protocol !== 'https:' || url.hostname !== 'give.paychangu.com' ||
      url.username || url.password || url.port || !/^\/dc-[A-Za-z0-9_-]+\/?$/.test(url.pathname) ||
      url.search || url.hash) return;
  button.href = url.href;
  recipient.textContent = 'Funds are received by ' + support.recipientName.trim() + ' for ReadMalawi.';
  unavailable.hidden = true;
  button.hidden = false;
  recipient.hidden = false;
  note.hidden = false;
})();
