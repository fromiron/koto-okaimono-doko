# Redesign "H" — Hybrid design system (in progress)

Chosen full-redesign direction: **H = A (warm paper) base + B (ticket components) + C (color/accessibility discipline)**.
Realizes the existing brand guide (`assets/brand-style-guide.png`) — ticket motif + machi warmth — that the
prior implementation under-delivered. `src/theme/tokens.ts` stays the single source of truth; `src/global.css`
`@theme` mirrors it (`tokenParity.test.ts`).

## Principles

1. **Color = information only.** Hue is reserved for coupon state: blue `primary` = A・B, amber `couponB` = B.
   Everything else is paper / ink / hairline. Facility markers and clusters are neutral; payment and category
   chips are neutral (`neutral` Chip tone). Blue may also carry primary/structural UI (selected toggle, primary
   button) — it is the brand/structure hue.
2. **Warm paper surfaces.** `page` `#FAF4E8`, hairline `line` `#E7DECE`, `neutralSoft` `#F2ECDE`; cards stay
   white `surface` for contrast. Prefer hairline rules over heavy drop-shadow halos.
3. **Ticket identity.** Markers and badges use a ticket-stub language: rounded stub + white border + ticket
   "eye" + label + a downward nub whose tip marks the exact coordinate.
4. **Map-first + accessible.** Near-me framing, a 地図/リスト segmented toggle, a distance-sorted list, an
   A・B / B legend, ≥44px targets, high-contrast labels, tabular numerals for counts/distance.

## Tokens (changed for H)

| Token | Before | After (H) |
|---|---|---|
| `page` | `#F4FAFF` | `#FAF4E8` (warm paper) |
| `line` | `#E5E7EB` | `#E7DECE` (warm hairline) |
| `neutralSoft` | `#F3F4F6` | `#F2ECDE` (warm neutral) |

Functional colors unchanged: `primary #0D47A1` (A・B), `couponB #F5A623` (B), `teal #2DBE7F`
(payment/privacy positive), `facility #5F6368`, `ink #333333`. Typography scale + `Text` token mapping as in
`docs/design-system.md`.

## Marker language

- **StoreMarker** — ticket-stub tag in the coupon hue, white border, ticket "eye", label (`A・B` / `B`), nub
  anchored to the coordinate. Selected = layout-stable white halo + lift (tip never drifts).
- **Facility (Location Group)** — neutral gray rounded tile with a building glyph (no coupon hue).
- **ClusterMarker** — neutral `ink` bubble with white count (an aggregate is not a coupon type).
- `tracksViewChanges` stays OFF except a brief window after mount / on appearance change (RN-maps perf).

## Components

- **SegmentedToggle** — generic 2-option control (地図 / リスト).
- **StoreBottomSheet** — near-me header (`現在地周辺` + count + toggle); map mode = peek + "select a pin";
  list mode = `BottomSheetFlatList` of distance-sorted rows (mini coupon badge + name + category + distance +
  chevron, hairline separators).
- **Chip** — added `neutral` tone for payment/category (color discipline).

## Status

- **Done + verified on emulator:** map-home (warm paper, ticket-stub markers, neutral clusters, legend,
  color-discipline chips, near-me sheet, map/list toggle, virtualized list, selected state). typecheck/lint/test
  green.
- **Open refinements for rollout:** legend placement on dense maps; near-me eyebrow when location is off;
  payment-badge color discipline on the detail card; then apply the system to store detail, filter, settings,
  about; finally refresh `docs/design-system.md` as the canonical doc.

## Research-derived rules applied

Marker scanability = shape + color + label + shadow + anchored tip; ≤ ~5 color categories; ticket motif via
notch/eye + hairline rules + accent for active; RN-maps `tracksViewChanges` discipline. (Sources: Google Maps
Handbook/spatialized.io, maplibrary.org, shadcn ticket-stub & sleek.design templates, RN-maps SO/issue threads.)
