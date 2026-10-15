# UX first-stage implementation (#19–#22)

## Scope and baseline

This change implements the first stage of [epic #18](https://github.com/fromiron/koto-okaimono-doko/issues/18). It builds on local `f8c95ccfc2f55ced4446ddf898ef1f067b6b768d`, including the dataset recovery and coordinate-less search work from #9–#17. At the start of this work, remote main was `98343b934526d1c204c53a70fb5da24b190d4d19`; the local foundation had not been pushed or merged.

The checked-in seed has 1,444 stores, version `2026-06-24.1`, and SHA-256 `b90c7f9cd20be217ae7d71342bffba9d3df79b8235047a00888a7f87ed7578f2`. This work does not change the seed, dataset update protocol or database schema.

## User contracts

- The user's medium (`any`, `paper`, `digital`) and voucher (`any`, `A`, `B`) are separate from the store's acceptance category. A matches AB stores; B matches both AB and B-only stores. Media without confirmed acceptance do not match a selected medium. Unspecified intent permits browsing without asserting missing information is acceptance.
- The main button shows the user's selected voucher. Filters edit a local draft; Apply saves the voucher preference and applies the conditions. Closing or a storage failure leaves the applied conditions unchanged. The empty-results reset preserves the voucher and explicitly says so. Advanced store-category conflicts have a visible explanation and removal action.
- List, facility and detail share `VoucherStatus`. The verified 2026 season is July 1 through December 31 in Japan. Unknown datasets and expired seasons never inherit current acceptance. One app-level clock refreshes at Japan midnight and on foreground return. The original official names and categories remain unchanged.
- Camera state and committed search region are separate. A user map movement proposes a region; only “Search this area” changes the committed bounds. Selection camera movement does not requery the search. Global keyword search continues to include stores without coordinates.
- Navigation stores IDs, camera, sheet position and list anchor, not copies of official Store data. A store selected from a facility returns to that facility, then to the original results. Applying new conditions retains detail but discards old return anchors; Back never restores old filters. Missing records after a revision fall back safely with a notice.
- New query identities hide results from previous conditions immediately. Retry with the same conditions may retain its last successful results with error feedback. Superseded async responses remain ignored.
- Rows prioritize official name, voucher information, official category/location and straight-line distance from current location. Detail and route are separate controls. The sheet has a larger peek, an explicit map/list toggle, and starts in list mode on narrow/large-text or short displays. Body gestures scroll at every height; the handle and map/list toggle resize the sheet, avoiding the library's intermediate-height scroll lock during restoration.
- Routes and map searches have distinct URLs. Reliable individual coordinates may be used; uncertain points and facilities use official destination text. Group directions are offered only for a shared named facility. No origin coordinates or extra location permission are requested. Handoff failures provide retry, map lookup and selectable address text.

## Sources and implementation choices

- [Koto City voucher rules and season](https://www.city.koto.lg.jp/102030/shohinken_plus.html)
- [Google Maps URL directions and browser fallback](https://developers.google.com/maps/documentation/urls/get-started)
- [Apple unified map URLs](https://developer.apple.com/documentation/mapkit/unified-map-urls): used on iOS 18.4 and newer; older iOS uses Google universal HTTPS URLs, with provider disclosure.
- [React Native 0.85 Linking](https://reactnative.dev/docs/0.85/linking)

No dependencies were added. Existing Expo SQLite, AsyncStorage, Zustand, bottom-sheet, React Native Linking, UI components and the React/Vitest fixture infrastructure are reused. Context7 MCP was unavailable; installed package types and official documentation were used for API checks. GitHub Actions are unchanged, so no new workflow needs an `act` run.

## Verification and remaining acceptance work

The pre-change baseline passed 120 tests, TypeScript and ESLint. The final integrated change passes **37 test files / 223 tests**, `pnpm typecheck`, `pnpm lint` and `git diff --check`. Added automated checks cover the voucher/media matrix against real SQLite, Japan date boundaries, persistence failures, filter Apply/Cancel, async query isolation, ten comparisons over three candidates, facility parents, Apple callbacks without gesture metadata, virtualized list anchor restoration/fallback, final momentum offsets before row or marker selection, URL generation, URL execution failure/retry, independent list actions and translation parity.

Android production-mode export also passes: `pnpm --filter @koto/mobile exec expo export --platform android --output-dir /tmp/koto-ux-p0-final --max-workers 4` (Hermes bundle `entry-739f714f63baf19c7fc8a87688159f6b.hbc`). This is bundle validation, not APK assembly/signing or a release deployment.

Android baseline capture used the existing Dev emulator (API 36.1, 1080×2400, density 420). The installed native app was version 1.0.0/code 1 with an unknown cached JavaScript commit. Its active database shared the version/count but had a different hash and generation timestamp from the checkout seed. Consequently, baseline screenshots are diagnostic references, not a controlled performance comparison. The installed native application and its data were preserved; the changed code runs in a separate Expo Go 56 experience.

The changed Android experience passes these seed-backed keyword checks: `25Hudson` paper+A = 1; `1518` paper+A = 0, digital+A = 1, digital+B = 1; `100本のスプーン` digital+B = 0, paper+B = 1, paper+A = 0. Captures and the detailed runtime log are in `/tmp/koto-ux-verification`. The Expo Go map surface was blank, so its screenshots do not validate native map tiles, markers or facility-marker gestures.

Android font scales 1.3 and 1.6 were inspected: the count and map/list switch stack, voucher/media information and route actions remain readable, and the filter Apply footer remains accessible. The search placeholder shortens visually while its accessible label remains present. Google Maps received `25Hudson 東京都江東区東陽5-25-15 1階` in its destination field with departure unfilled; the verified boundary is entry into a destination-filled directions screen, not computed navigation.

Native testing caught scroll problems beyond the mocked boundaries. Cold-run scrolling passed after removal of unnecessary initial `contentOffset` props; Gorhom's internal momentum-end handler did not forward the application's expected callback; its intermediate-height scroll lock also reset offsets during the return animation. Initial offsets are now applied through one-time restoration, content panning is disabled while handle panning remains available, and the latest `onScroll` value is retained without per-frame global state updates and captured immediately before every row, facility-child or marker selection.

The final frozen build passed **10/10 native detail → Android Back loops after inertial scrolling**, with the same `クレメンティア` row at `[53,664][1028,874]` before and after every loop (zero pixel drift). The exact table is `/tmp/koto-ux-verification/final-back-loops.md`; captures include `final-anchor-before.png`, `final-detail-1.png` and `final-back-10.png`. This device repetition complements the automated three-candidate comparison test; it is not a user-comprehension study.

The final external round trip also passed: `クレメンティア` detail → Google Maps directions (provider-resolved destination `Clementia`) → Android Back through Maps → the same `クレメンティア` detail with its list-back action intact. Evidence: `final-external-detail-route.png` and `final-external-back-detail-settled.png` in the same capture directory. Native handle resizing also passed: the same detail moved from the middle position (handle y1046) to peek (y1534) and full height (y229); body scrolling remains independent.

Physical Android, iOS OS handoff, TalkBack/VoiceOver reading order, user task comprehension and controlled before/after performance measurements remain separate acceptance work. No 30% improvement or release readiness is claimed. #23's preview counts and recovery proposals, #24's area dictionary, #25's saved stores, #26's full usability/performance study and #27's aliases/ranking are outside this first-stage change. Filter draft Apply/Cancel is included because it defines the new voucher preference's persistence boundary.
