# Koto Okaimono Doko

Koto Okaimono Doko is a map app for finding stores that accept the 2026 Koto City premium shopping coupon program. This glossary defines the product language used by the app, dataset, and documentation.

## Language

**Coupon Program**:
The official 2026 Koto City premium shopping coupon program, published as `こうとう商店街DEお買い物券＋2026`.
_Avoid_: campaign, event, promotion

**Store**:
A place where the Coupon Program can be used. Code uses `Store`; user-facing Japanese copy may use `取扱店` or `店舗` depending on context.
_Avoid_: shop, merchant, venue

**Coupon Type**:
The usage class that determines whether a Store accepts both A and B coupons or only B coupons.
_Avoid_: ticket type, kind, plan

**Payment Medium**:
The medium accepted by a Store: paper coupon, digital coupon, or both.
_Avoid_: payment method, channel

**Category**:
The official genre assigned to a Store, including the top-level genre and optional detailed genre from the Official Source.
_Avoid_: tag, label, taxonomy

**Dataset**:
The versioned collection of Store records generated from Official Sources for app use.
_Avoid_: database, export, dump

**Seed Dataset**:
The complete Dataset bundled with the app so first launch works without network access.
_Avoid_: sample data, fixture

**Active Dataset**:
The Dataset currently used by the installed app.
_Avoid_: current database, local copy

**Dataset Manifest**:
The small version file that tells the app whether a newer Dataset is available and how to verify it.
_Avoid_: config, metadata file

**Official Source**:
The official public website, PDFs, and search/detail pages for the Coupon Program.
_Avoid_: source of truth when referring to generated app files

**Location Group**:
One map location that represents one or more Stores sharing the same coordinates.
_Avoid_: cluster, marker group
