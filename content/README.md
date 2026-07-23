# Content

The site's content lives here, separate from its code. `propstar-data.js` fetches these
two files at startup and everything else reads from that in-memory copy.

| File | Holds |
|---|---|
| `catalogue.json` | The property collection (array of project objects) |
| `quiz.json` | The match quiz: questions, cities, localities, budget bands, purposes |

## Editing today

1. Open `/admin.html`, make changes, press **Copy JSON**.
2. Paste into `catalogue.json` (or `quiz.json`), commit, push.
3. Netlify redeploys and the change is live.

Admin edits are also saved to the browser's own storage, so you see them immediately —
but **only in that browser**. Committing the JSON is what publishes them to everyone.

## Moving to a hosted CMS

`fetchContent()` in `propstar-data.js` is the only function that knows where content
comes from. Point it at a CMS (Sanity, Supabase, a Google Sheets export) and have it
resolve the same shape, and nothing else in the app changes:

```js
{ projects: [ /* array of the objects described below */ ],
  quiz:     { /* the quiz object described below */ } }
```

Keep the field names — they are the contract between the content and the UI.

## Project fields

Required unless marked optional. Anything optional that is missing renders as `—`
or is skipped entirely, so a sparse project is safe to publish.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique. Used in the URL: `#/project/<id>` — changing it breaks shared links |
| `name` | string | Project name |
| `developer` | string | Shown above the name |
| `location` | string | Human-readable, e.g. `Yelahanka, Bengaluru` |
| `config` | string | e.g. `3 & 4 BHK` |
| `sizes` | string, optional | e.g. `1,380 – 2,609 sq.ft` |
| `status` | string, optional | e.g. `Under construction`, `New launch`, `Ready to move` |
| `possession` | string, optional | e.g. `May 2030` |
| `tags` | string[] | First three appear on the card |
| `description` | string | The "About" paragraph |
| `curation` | string[] | The "Our honest take" points |
| `amenities` | string[] | |
| `connectivity` | string[] | The "Getting around" list |
| `developerNote` | string, optional | Extra paragraph about the developer |
| `images` | string[] | Paths or URLs. **`images[0]` is the card and page hero**; the rest are the gallery |
| `photoDescription` | string, optional | Editable in the admin; not currently rendered. Good candidate for image alt text |
| `locationKey` | string | Must match a `locations[].key` in `quiz.json` |
| `localityKey` | string | Must match a locality key inside that city, or `""` |
| `nearbyKeys` | string[] | Other city keys to treat as "near" when matching |
| `budgetBands` | string[] | Must match `budgets[].key`. Drives matching only — **never displayed** |
| `purposes` | string[] | Must match `purposes[].key` |

**Prices are never shown.** Every project displays "On request" by design. Real prices map
to `budgetBands` so the quiz can match on them privately.

## Quiz fields

```jsonc
{
  "questions": {
    "city":     { "on": true,  "q": "…", "h": "…" },   // on = show this step
    "locality": { "on": false, "q": "…", "h": "…" },
    "budget":   { "on": true,  "q": "…", "h": "…" },
    "purpose":  { "on": false, "q": "…", "h": "…" }
  },
  "locations": [
    { "key": "bengaluru", "label": "Bengaluru", "hint": "Garden city, tech capital",
      "localities": [ { "key": "blr-yelahanka", "label": "Yelahanka" } ] }
  ],
  "budgets":  [ { "key": "b1", "label": "₹1 – 3 Cr" } ],
  "purposes": [ { "key": "live", "label": "To live in", "hint": "Your primary home" } ]
}
```

Two things to be careful with:

- **`budgets` order matters.** Matching treats neighbouring bands as a partial match, so
  the array must run cheapest to dearest.
- **Keys are referenced by every project.** Renaming or removing a location, budget, or
  purpose key silently unmatches every project pointing at it. Update both files together.

Adding a city also needs a cover image for the home page's "Explore by city" band —
that map is `cityCovers` in `index.html`.
