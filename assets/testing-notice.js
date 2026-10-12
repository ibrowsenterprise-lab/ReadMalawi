// ReadMalawi release-stage notice. Informational only; database access remains governed by RLS.
// Keep the site in testing mode until the founder has explicitly authorised a final launch.
(() => {
  "use strict";
  const cfg = window.READMALAWI_CONFIG || {};
  if (cfg.sitePhase !== "testing") return;
  if (document.getElementById("readmalawi-testing-banner")) return;
  const style = document.createElement("style");
  style.textContent = [
    "#readmalawi-testing-banner{position:relative;z-index:20;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;background:#fff3d2;color:#624213;padding:10px 20px;border-bottom:2px solid #d5a446;font:600 13px/1.5 system-ui,-apple-system,'Segoe UI',Arial,sans-serif;text-align:center}",
    "#readmalawi-testing-banner strong{font-weight:850;letter-spacing:.045em}",
    "#readmalawi-testing-banner a{color:#57350e;text-decoration:underline;text-underline-offset:3px}",
    "@media(max-width:520px){#readmalawi-testing-banner{padding:9px 14px;gap:5px;font-size:12px}}"
  ].join("");
  document.head.appendChild(style);
  const bar = document.createElement("div");
  bar.id = "readmalawi-testing-banner";
  bar.setAttribute("role", "status");
  const label = document.createElement("strong");
  label.textContent = "DEVELOPMENT / TESTING";
  const note = document.createElement("span");
  note.textContent = "ReadMalawi has not officially launched. Forms are for test submissions only. No bookings or payments.";
  bar.append(label, note);
  // Header remains accessible and the banner never covers buttons on mobile.
  const header = document.querySelector("header");
  if (header && header.parentNode) header.insertAdjacentElement("afterend", bar);
  else document.body.prepend(bar);
})();
