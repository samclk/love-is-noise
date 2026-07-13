# Media Archive — Implementation Plan

A photo/gallery archive: a continuous stream of images, GIFs, and videos
uploaded to Sanity CMS and displayed on the site at `/archive`.

> **Status:** Shipping in two steps. Step 1 (this PR) is the **Sanity Studio and
> `archiveItem` schema only** — content can be uploaded but nothing renders on
> the public site yet. The public `/archive` route, its read layer
> (`src/sanity/lib/client|image|queries`), the `next/image` `remotePatterns`
> entry, and the homepage link are deferred to a follow-up PR.

## Context

- Next.js 15 (App Router), React 19, Tailwind v4 (CSS-first, no config file),
  TypeScript strict. Package manager: **Yarn**. Formatter: **Prettier**
  (no semicolons, single quotes, 2-space) — Biome is *not* used here.
- Sanity is **not yet integrated** — this is a greenfield integration.
- All existing content is hardcoded; this introduces the first data-fetching
  layer in the project.
- Existing gallery precedent: the EPK page already uses `masonic` (masonry) and
  `embla-carousel-react`, both consuming `{ src, width, height }` arrays.

## Decisions (settled)

| Decision | Choice |
|----------|--------|
| Studio hosting | **Embedded** at `/studio` in this app |
| Public route | **New route `/archive`** |
| Video hosting | **Native Sanity file upload** (raw from Sanity CDN) |
| Item metadata | caption/title, date, credit, alt (no tags/filtering) |
| Layout | **Masonry wall** (`masonic`), newest first |
| Loading | **Infinite scroll**, batched (SSR first ~24, then client-fetched batches) |
| Interaction | **Passive wall** (no lightbox); videos autoplay in-grid |
| Freshness | **Time-based ISR ~60s** |
| Dataset visibility | **Public** (reads need no token) |

## Content model

One document type, one document per upload.

```
archiveItem
  kind: string          // select: 'image' | 'gif' | 'video'
  image: image          // shown when kind is image|gif
  videoFile: file        // shown when kind is video
  caption: string        // optional
  date: datetime         // sort key, defaults to now()
  credit: string         // optional photographer/credit line
  alt: string            // accessibility text (for images/gifs)
```

- `kind` drives conditional field visibility in the Studio (hide `videoFile`
  for images, hide `image` for video).
- Sort: `order(date desc, _createdAt desc)`.

## Public archive (`/archive`)

- **Server Component** SSRs the first batch for fast first paint + SEO:
  `*[_type == "archiveItem"] | order(date desc, _createdAt desc)[0...24]`
- **Masonry wall** via `masonic` (existing dependency), newest first.
- **Infinite scroll**: a **server action** fetches subsequent range-based
  batches (`[start...end]`) as the user nears the bottom.
- **Passive wall**:
  - Video tiles autoplay `muted` + `loop` + `playsInline` (no player chrome).
  - Caption + credit as a hover overlay on desktop; shown beneath the tile on
    touch devices.
- **ISR**: `export const revalidate = 60`.
- Link to `/archive` added from the homepage.

## Studio

- Add `sanity`, `next-sanity`, `@sanity/vision`.
- `sanity.config.ts` at repo root; embedded catch-all route at
  `src/app/studio/[[...tool]]/page.tsx`.
- Schema in a `sanity/` (or `src/sanity/`) folder: `archiveItem`.

## Config & env

- `next.config.js`: add `images.remotePatterns` for `cdn.sanity.io`.
- `.env.example`: add `NEXT_PUBLIC_SANITY_PROJECT_ID`,
  `NEXT_PUBLIC_SANITY_DATASET`. (Public dataset → no read token required.)

## Blockers cleared ✅

1. **Node version** — `.nvmrc` bumped 16 → 20 (Sanity Studio needs 18+).
2. **React types mismatch** — `@types/react` / `@types/react-dom` bumped
   `^18` → `^19` to match the React 19 runtime.
3. **Next.js major upgrade (unplanned but required)** — Sanity 6 uses React
   19.2's `useEffectEvent`. Next 15's *vendored* React (`next/dist/compiled/react`)
   predates that export, so the Studio bundle failed to build. Upgraded
   **Next 15.0.7 → 16.2.10**, whose compiled React includes `useEffectEvent`.
   React/react-dom resolve to 19.2.7. Next 16 also auto-set `jsx: react-jsx` in
   `tsconfig.json`.

## Implementation gotchas

- **Animated GIFs**: serve unoptimised from the Sanity CDN *original* URL —
  `next/image`'s optimiser strips animation. Use the plain asset URL (or
  `unoptimized`) for `kind === 'gif'`.
- **No auto poster for video**: native uploads have no generated thumbnail.
  Use `preload="metadata"` so the first frame shows; optionally allow attaching
  a poster image per video later if needed.
- **Keep clips short**: raw Sanity CDN video has no transcoding/adaptive
  streaming; large files eat bandwidth and load slowly.
- Match repo conventions (Prettier style, named `react` imports, `@/*` alias).

## Rough build order

1. Clear blockers: bump `.nvmrc` + React types; `yarn install`.
2. Install Sanity packages; scaffold `sanity.config.ts` + `/studio` route.
3. Define `archiveItem` schema.
4. Sanity client + image URL builder + GROQ queries.
5. `/archive` Server Component (SSR first batch) + masonry client component.
6. Server action for paginated batches + infinite scroll.
7. Video tile behaviour + caption/credit overlay + GIF handling.
8. `next.config.js` remotePatterns, `.env.example`, homepage link.
9. Verify: upload each media kind, confirm ordering, scroll, freshness.
