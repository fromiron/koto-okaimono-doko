# koto okaimono doko Design System

This document records the visual tokens used to implement the sample screens in
`docs/wireframes/images/`. The Android app should match the samples in hierarchy,
color roles, spacing, and marker language without rendering the sample device
frame inside the app.

## Visual Thesis

`koto okaimono doko` is a practical local map app: bright white surfaces, clear
blue coupon state, friendly teal accents, and compact information over a native
map.

## Color Tokens

| Token | Value | Role |
|---|---:|---|
| `primary` | `#0D47A1` | Primary actions, A/B coupon markers, selected chips |
| `primarySoft` | `#EAF3FF` | Icon badge and selected soft backgrounds |
| `couponB` | `#F5A623` | B-only coupon markers and chips |
| `teal` | `#2DBE7F` | Paper/digital badges, privacy/positive accents |
| `ink` | `#333333` | Primary text |
| `muted` | `#6B7280` | Secondary text |
| `line` | `#E5E7EB` | Dividers and low-contrast borders |
| `surface` | `#FFFFFF` | Cards, bottom sheets, floating controls |
| `page` | `#F4FAFF` | Settings/About background |
| `danger` | `#B91C1C` | Error text |
| `facility` | `#5F6368` | Mall/facility marker |

## Shape Tokens

| Token | Value | Role |
|---|---:|---|
| `radiusPill` | `999` | Chips and primary buttons |
| `radiusCard` | `18` | Settings/About information cards |
| `radiusSheet` | `28` | Bottom sheet top corners |
| `radiusInput` | `28` | Search input |
| `iconButtonSize` | `48` | Header, settings, current location buttons |
| `markerSize` | `48` | Coupon and facility map markers |

## Shadow Tokens

React Native shadow support differs by platform, so reusable shadow styles live
in code as `surfaceShadow`, `floatingButtonShadow`, and `bottomSheetShadow`.

| Token | Use |
|---|---|
| `surfaceShadow` | Cards and list rows |
| `floatingButtonShadow` | Header/settings/location buttons |
| `bottomSheetShadow` | Bottom sheet container |

## Screen Rules

- Map Home is the primary workspace. On Android, `react-native-maps` can render
  above React Native overlays, so the native map, dataset badge, and bottom sheet
  are stacked as sibling regions instead of overlapping the map.
- Coupon availability must be visible from the marker or first badge row.
- Store, address, mall/facility, and official source text remain Japanese source
  text even when the UI language changes.
- `Location Group` is the canonical domain term for same-coordinate grouped
  stores. Do not introduce a separate “cluster” concept in UI or code comments.
- Japanese UI copy in `docs/wireframes.md` is the source copy. Other locales must
  have equivalent keys and must not overflow common Android screen widths.
