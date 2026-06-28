# Official source precedence and CI geocoding

The AB and B-only official PDFs are authoritative for Store inclusion, Coupon Type, Payment Medium, and official update date; HTML search and detail pages enrich the Dataset with detail URLs, homepage links, mall or shopping street context, and more structured fields. Coordinates are generated during CI with Geolonia-based address normalization and geocoding plus manual correction CSVs, never on device. This keeps runtime behavior offline-first while preserving a reviewable trail for low-confidence locations and source conflicts.
