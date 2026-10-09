# ReadMalawi — Digital Literacy Project

Founded by Jones Nalikungwi. ReadMalawi's proposed literacy and book-donation project was publicly reported in 2019 after historical discussions with the late DD Phiri. To date, its recorded achievement is sharing digital books in an existing WhatsApp community of 126 members. No physical book deliveries or NGO registration have taken place.

## Digital reading hub

- Mobile-friendly free reading links, original quiz and AI learning prompts.
- Language choices: English, Chichewa, Chitumbuka, Chiyao, Chilomwe, Chisena and Chitonga.
- **Not** a complete seven-language translation: local-language content requires review by fluent speakers.
- The site doesn't process donations or payments.

## Brand

The emblem concept joins a book, the Malawi silhouette and expanding access to knowledge. `assets/readmalawi-symbol.svg` is a compact site icon. The approved larger logo will appear on the landing page after `assets/readmalawi-logo.png` is uploaded to the assets folder.

## GitHub Pages

Repository: `ibrowsenterprise-lab/ReadMalawi` (separate from IBROWS).

Go to **Settings → Pages → Deploy from a branch → main → /(root) → Save**. After successful deployment, the conventional address is `https://ibrowsenterprise-lab.github.io/ReadMalawi/`.

GitHub Pages is for the free educational pilot, not a paid e-commerce or SaaS platform. Future paid training or charitable receipts need suitable hosting and legal arrangements.

See [ROADMAP.md](ROADMAP.md) and [TRANSLATION_REVIEW.md](TRANSLATION_REVIEW.md).


## Community library (new)
- [Open the searchable e-book and audiobook library](library.html). It has title/author search, category, language, e-book/audiobook filters, and automatically fetches legal-source CATALOGUE METADATA from Project Gutenberg and LibriVox.
- Member PDFs/EPUBs, audiobooks, book requests and helpful responses are built as a secure Supabase integration, but **cannot yet accept uploads** until Supabase credentials, SQL policies and moderation/testing are configured.
- See [LIBRARY_SETUP.md](LIBRARY_SETUP.md) and [the database schema](supabase/readmalawi_schema.sql) for deployment and security requirements.
- Permission checks and administrator approval must precede public publication of any member file.
- Proposed five-free-download / MK500 scheme and MK100 minimum donations are **not active**. No website payment processing or charitable collection has been enabled.
- A publicly viewable file can still be saved; a future paid content-access model requires a dedicated server and payment validation, not merely JavaScript counters.

## Render preview (2026-10-09)

- Frontend deployment: https://readmalawi-library.onrender.com/
- Public library page: https://readmalawi-library.onrender.com/library.html
- Service: `readmalawi-library` (Render static site), tracked from `main` with automatic deployments.
- This is a **frontend preview**: signed-in uploads, private audiobook storage, book requests, donations and paid download access are **not enabled** until the dedicated Supabase database, authentication, moderation and payment infrastructure have been configured and verified.
- **Do not upload commercial copyrighted works for public release without rights clearance.** Special online-only playback is not DRM.
