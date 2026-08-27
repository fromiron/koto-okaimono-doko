# Design QA — Option 1 map flow

- Date: 2026-08-27
- Branch: `develop`
- Base commit: `2415ea5bf42cbe8e53a49ba630b0f7b42715bbb2` (`origin/main`)
- Final result: **BLOCKED**

The selected Option 1 chrome and the verified list/search/detail flows are ready for native-map QA. Final design approval is blocked because Expo Go could not authorize Google Maps, so the actual Android tiles, marker bitmaps, marker taps, cluster zoom, selected ring, and camera placement were not observable.

## Three-reviewer verdict

| Reviewer | Configuration | Verdict |
|---|---|---|
| Codex | Current working tree, Android 13 runtime, source/tests, same-viewport comparison | Chrome and non-map flows pass; final design blocked on the native map path |
| Gemini | `gemini-3.7-flash-high`, `--effort high`, read-only plan mode | Code/UX architecture pass; native map sign-off blocked |
| Grok | `cursor-grok-4.6-xhigh`, non-fast, read-only ask mode | Overall blocked because the map is the primary surface and remains unverified |

All three reviewers independently reached the same release boundary: static code, tests, and the generated reference do not prove native map behavior.

## Implemented and verified

- Replaced the clipped, rotated teardrop marker tree with one fixed circular marker contract for stores and clusters.
- Kept `tracksViewChanges` bounded after a marker's visual signature changes instead of tracking selected markers forever.
- Made cluster identity stable from the sorted member set and kept a selected group outside density clustering.
- Replaced Android `mapPadding` with a JS camera offset after reproducing a native `GoogleMap.setPadding` null-pointer crash on display resize.
- Waited for the mid sheet before consuming a queued selection camera.
- Kept the selected query result stable while detail is open; a map pan no longer closes the detail.
- Preserved existing pins during refresh failure and added visible loading, failure, and retry states.
- Fixed search-result first-tap behavior with `keyboardShouldPersistTaps="handled"`; the same tap now opens detail and dismisses Gboard.
- Hid the location control while the keyboard is open and while the full list covers the map.
- Matched the Option 1 top-control proportions at 390 logical pixels; the complete Japanese search prompt is visible.
- Enforced one-line map marker labels and preserved text plus accessible selected state instead of relying on color alone.

Observed runtime paths:

- map/list toggle and full list;
- search `25Hudson` to one result, then one-tap detail with keyboard dismissal;
- detail back navigation, directions and official-page actions present;
- filter route, scrolling, distance filters, completion and reset controls;
- settings route;
- selected detail retained after a map-pan gesture;
- 390 × 844 and 320-logical-pixel reflow with no horizontal control overflow;
- display resize after removing `mapPadding`, with no fatal Android exception.

## Visual comparison

The final local evidence bundle contains:

- `reference-vs-implementation.png` — Option 1 and implementation combined at the same aspect ratio;
- `implementation-final-option1.png` — final 390 × 844 home state;
- `implementation-search-to-detail-fixed.png` — successful one-tap search-to-detail state;
- `implementation-detail-after-pan.png` — selected detail retained after map pan;
- `implementation-320-reflow.png` — narrow-layout evidence.

The search deck, coupon controls, sheet hierarchy, count legend, view toggle, store row, and location action align with Option 1. The implementation intentionally keeps 44-pixel utility targets even where the generated mock appears slightly smaller. The blue or gray floating gear visible in some captures is Expo Go's developer-tools bubble, not product UI.

## Verification gates

Passed:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test` — 23 files, 63 tests
- `git diff --check`
- accessibility report schema — valid report
- prune-and-verify report schema — valid report

Still unknown and therefore blocking:

- live map tile and marker rendering over representative backgrounds;
- store-marker and cluster taps on Android;
- selected-ring capture and marker persistence after pan/zoom;
- cluster zoom and decomposition;
- final camera position between the top deck and mid sheet;
- TalkBack announcements, hardware-keyboard focus, and live marker contrast;
- iOS runtime behavior.

## Native map verification required

`apps/mobile/.env.local` contains an empty `GOOGLE_MAPS_API_KEY` entry. `MISSING_API_KEY` in `app.config.ts` is a failure sentinel, not a temporary working key. Add the real key locally, then use a native Android build such as `pnpm --dir apps/mobile exec expo run:android`; Expo Go uses its own Android package and cannot validate this project's build-time Maps key.

The key should enable Maps SDK for Android and be restricted to package `app.koto.okaimono.doko` plus the signing certificate fingerprints used by the tested build. The GitHub repository already has a `GOOGLE_MAPS_API_KEY` Actions secret, but that does not populate the local `.env.local` file.

Record this exact native flow before changing the result to PASS:

1. Confirm tiles and `A・B`, `B`, and numeric cluster markers appear.
2. Tap a store marker and confirm the selected white ring and mid-sheet detail.
3. Pan with detail open and confirm the marker and detail remain selected.
4. Tap a cluster and confirm the camera zooms and markers decompose.
5. Select from both peek and full-list states and confirm the marker lands in the visible map gap.
6. Repeat dense-map movement long enough to catch clipped, blank, flickering, or stale marker bitmaps.

## Release-readiness impact

The repository is **NO-GO for release**, independently of the blocked map visual QA:

- The `v1.0.4` candidate now reports `versionCode=4` and `versionName=1.0.4`; the published `v1.0.3` APK remains historically mislabeled as `1.0.0/1`.
- A generated Android prebuild configured `release` with the debug signing config. A production keystore/signing path is not defined.
- Expo dependencies, direct native peers, and the pnpm config-plugin resolution are aligned. Expo Doctor passes 21 of 22 checks; the remaining Hermes memory regression requires Expo SDK 57 / React Native 0.86.2 or later.
- `pnpm audit --prod` reports 19 advisories: 10 high and 9 moderate. Several are build/tooling or dataset-CLI paths, so each reachable production impact still needs triage; the count alone is not proof that all 19 ship in the APK.
- The release APK is arm64-only. That can be an intentional distribution constraint, but it prevented installation on the available x86_64 emulator and must match the intended channel/device support.
- Exact-commit GitHub CI and the tag-triggered APK workflow still need to pass before this candidate is treated as build-complete.

Release requires a properly versioned and production-signed native candidate, aligned Expo dependencies, security-advisory triage, green CI for the exact commit, and the native-map verification above.
