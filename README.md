# Propstar — Public Site & Admin Console

A curated real-estate discovery platform ("Chosen, not chased") — explicitly **not a brokerage**.
Built per `Propstar_Build_Playbook_v1.2.pdf` (design system, copy rules, "no prices" rule) and
`Propstar Dev Handoff admin panel+main site.pdf` (architecture, data layer, matching engine, admin console).

## Files

| File | Role |
|---|---|
| `index.html` | Public site — single-page app with 4 views (home / properties / about / detail) |
| `admin.html` | Admin console — passcode-gated; Catalogue CRUD + Quiz builder + JSON export |
| `propstar-data.js` | Shared data layer (`window.PROPSTAR`) — catalogue store, quiz config, matching engine |
| `assets/` | Brand mark, hero video + poster, 16 marquee logos, 12 seed project photos |

## Run locally

From inside this folder:

```
npx serve . -l 3030
```
Then open `http://localhost:3030` (site) and `http://localhost:3030/admin.html` (console).
The admin requires a passcode (ask the site owner). Only its SHA-256 hash lives in
`admin.html` (`PASS_HASH` in `Admin.signIn`) — to rotate it, hash a new passcode and
replace that constant. Client-side gating deters casual visitors, but for real
security put server auth in front of `admin.html` before any serious use.

No Node? Any static server works — `python3 -m http.server 3030` is fine too. The
scroll-scrubbed hero video prefers a server with HTTP Range support (`npx serve` has it),
but the page detects a server without it and self-heals by loading the clip into memory,
so the animation works either way. Phones intentionally show a still hero image instead
of the 44 MB video. Double-clicking `index.html` (no server) mostly works in a pinch,
but a local server is the supported path.

## How the two apps talk

Both import `propstar-data.js` and never touch storage directly. The admin writes the
catalogue (`propstar_properties_v1`) and quiz config (`propstar_quiz_v2`) to localStorage;
the public site re-reads both on `focus` and `storage` events, so edits appear in the
other tab without a manual reload.

- **The one rule:** no rupee figure ever appears on a property. Pricing always reads
  "On Request". Budget bands are internal matching attributes only.
- **Lead capture:** the quiz's final step is the only form a visitor must fill, once ever
  (`propstar_lead`). Returning visitors skip every ask (cards opened from the Properties
  listing still pass through the gate modal by design — it's the primary capture surface).
- **Matching:** location 50 / locality 25 / budget 30 (adjacent band ×0.5) / purpose 20,
  ranked, top 6, never-empty fallback. Weights in `PROPSTAR.WEIGHTS`.
- **Engagement capture (`window.Engage`):** the shortlist prompt auto-fires on
  15s dwell, 30% scroll depth on home / properties / about, or exit-intent —
  max 3 automatic shows per session, 30s cooldown, never mid-quiz, never on a
  detail page (it has its own sticky CTA). A "Get your curated shortlist" chip
  is pinned bottom-right from first paint for any visitor without a lead.
  Tune `Engage.dwellMs / scrollPct / maxAuto` in `index.html`.
  NOTE: once a device has submitted any form, prompts and chip stop permanently
  by design — for client demos or testing, open the site with **`?demo=1`**,
  which ignores the saved lead and session caps (10s spacing between shows).
- **Catalogue:** 12 seed projects across 4 cities; Properties paginates 6 at a
  time ("Show more"), filter chips show live per-city counts.
- **Routing:** hash-based (`#/properties`, `#/about`, `#/project/<id>`) — browser
  back/forward work and project pages are shareable. A direct project link for a
  new visitor still passes through the lead gate.

## Production TODO (from the spec, unchanged)

1. Real auth on the admin console (any passcode works today).
2. Real endpoints for the three lead flows (gate / contact / enquiry) — currently toast-only.
3. Backend store replacing localStorage; migrate via the admin's "Copy JSON".
4. Image hosting — admin photo uploads are base64 data-URIs (will hit the ~5MB localStorage cap).
5. URL routing per view/project for SEO + sharing.
6. Referential-integrity warnings when quiz options that properties reference are deleted.
