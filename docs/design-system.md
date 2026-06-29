# koto okaimono doko Design System

This document records the visual tokens used to implement the sample screens in
`docs/wireframes/images/`. The Android app should match the samples in hierarchy,
color roles, spacing, and marker language without rendering the sample device
frame inside the app.

## Visual Thesis

`koto okaimono doko` is a practical local map app on **warm paper** surfaces.
Colour is reserved for coupon state — blue `primary` = A・B, amber `couponB` = B —
while everything else stays paper, ink, and hairline. Markers and coupon badges use
a **ticket-stub** language (the premium shopping coupon). The map home leads with a
near-me framing and a 地図 / リスト toggle. See `docs/redesign-h.md` for the full
"H" design direction this implements.

## Color Tokens

Colour discipline: only A・B (`primary`) and B (`couponB`) carry hue as coupon
state. Facility markers and clusters are neutral; payment-medium and category chips
use the neutral `Chip` tone. `teal` is reserved for privacy/positive accents.

| Token | Value | Role |
|---|---:|---|
| `primary` | `#0D47A1` | A・B coupon state, primary actions, selected controls |
| `primarySoft` | `#EAF3FF` | A・B icon badge / soft backgrounds |
| `couponB` | `#F5A623` | B coupon state |
| `teal` | `#2DBE7F` | Privacy/positive accents, data-update action |
| `ink` | `#333333` | Primary text, neutral selected chips, clusters |
| `muted` | `#6B7280` | Secondary text |
| `line` | `#E7DECE` | Warm hairline dividers and borders |
| `surface` | `#FFFFFF` | Cards, bottom sheets, floating controls |
| `page` | `#FAF4E8` | Warm paper app background (all screens) |
| `neutralSoft` | `#F2ECDE` | Warm neutral control track |
| `danger` | `#B91C1C` | Error text |
| `facility` | `#5F6368` | Mall/facility marker (neutral) |

## Shape Tokens

| Token | Value | Role |
|---|---:|---|
| `radiusPill` | `999` | Chips and primary buttons |
| `radiusCard` | `16` | Settings/About information cards |
| `radiusSheet` | `28` | Bottom sheet top corners |
| `radiusInput` | `28` | Search input |
| `iconButtonSize` | `48` | Header, settings, current location buttons |
| `markerSize` | `48` | Coupon and facility map markers |

## Typography Tokens

`tokens.ts` exposes a `typography` scale (size / line-height / weight) that the
`Text` component maps to directly via its `variant` prop, so every heading shares
one rhythm instead of ad-hoc per-screen sizes. Tone (color) is applied separately
through the `tone` prop and Tailwind text-color utilities.

| Variant | px / line-height | Weight | Role |
|---|---:|---:|---|
| `display` | 30 / 36 | 700 | Hero wordmark (About) |
| `title` | 24 / 30 | 700 | Screen titles (設定, 店舗詳細, 絞り込み) |
| `subtitle` | 18 / 24 | 700 | Section + card titles, store names |
| `body` | 16 / 24 | 400 | Default reading text |
| `label` | 14 / 20 | 700 | Buttons, chips, badges, cluster counts |
| `caption` | 12 / 16 | 400 | Notes, timestamps |
| `micro` | 12 / 14 | 700 | Map marker glyphs |

## Shadow Tokens

React Native shadow support differs by platform, so reusable shadow styles live
in code as `surfaceShadow`, `floatingButtonShadow`, and `bottomSheetShadow`.

| Token | Use |
|---|---|
| `surfaceShadow` | Cards and list rows |
| `floatingButtonShadow` | Header/settings/location buttons |
| `bottomSheetShadow` | Bottom sheet container |

## Screen Rules

- Map Home is the primary workspace. The store sheet is a draggable
  `@gorhom/bottom-sheet` that overlays the bottom of the map (collapsed peek ↔
  expanded). On Android, `react-native-maps` can render above React Native overlays,
  so this must be verified on a device; if the native map occludes the sheet, fall
  back to stacking the map and sheet as sibling regions (map height reduced) instead
  of overlapping. The current-location button floats above the collapsed peek. The
  under-map dataset/`非公式` badge was removed (the dataset date lives in Settings and
  the selected-store sheet).
- Coupon availability must be visible from the marker or first badge row.
- Store, address, mall/facility, and official source text remain Japanese source
  text even when the UI language changes.
- `Location Group` is the canonical domain term for same-coordinate grouped
  stores. Do not introduce a separate “cluster” concept in UI or code comments.
- Japanese UI copy in `docs/wireframes.md` is the source copy. Other locales must
  have equivalent keys and must not overflow common Android screen widths.

## Spacing, Grid & Layout Primitives

`src/theme/tokens.ts` is the single source of truth. `src/global.css` `@theme` mirrors
the color + radius tokens (semantic names: `primary`, `primary-soft`, `teal`,
`teal-soft`, `coupon-b`, `purple`, `ink`, `muted`, `line`, `surface`, `page`,
`neutral-soft`, `danger`, `danger-soft`, `facility`). `tokenParity.test.ts` keeps the
two in sync; `styleGuard.test.ts` bans raw `rounded-[...]` and fractional spacing.

### Spacing scale (4pt)

| Token | px |
|---|---:|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 20 |
| `2xl` | 24 |
| `3xl` | 32 |
| `4xl` | 40 |

Use the scale only; no off-grid values (`py-3.5`, etc. are banned by the guard test).

### Semantic roles (`layout`)

| Role | Value |
|---|---:|
| `screenGutter` | 20 |
| `cardPadding` | 16 |
| `sectionGap` | 24 |
| `stackGap` | 12 |
| `inlineGap` | 8 |

### Layout primitives

Apply spacing through primitives, not ad-hoc margins:

- `Stack` — vertical rhythm (`gap` token)
- `Row` — horizontal, `align` (`center`/`start`/`end`/`stretch`) + `gap`
- `Wrap` — wrapping chip / tag clusters
- `Section` — titled block (blue label + token-spaced content)
- `Screen` — page container with `screenGutter`

### Icon sizes (`iconSizes`)

`sm` 16 · `md` 20 · `lg` 24 · `xl` 28. The brand mark (13 / 42) and the Settings
dataset hero icon (48) are intentional exceptions.
