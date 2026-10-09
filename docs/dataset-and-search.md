# Dataset and search contracts

Issues #9–#17 are implemented together on `fix/dataset-and-search-issues`, based on `main@98343b9`.

## Updates and recovery (#9–#11)

The app downloads and verifies updates while its existing database stays open. Settings reports **downloaded; close and reopen the app** in all five languages. The active version shown in settings stays unchanged until the next start. Checks and downloads share an in-process guard across hook consumers.

Before mounting SQLiteProvider, startup validates the active database. If unusable, it restores a validated backup, then falls back to the bundled seed. A pending candidate is checked for size, SHA-256, SQLite integrity, required columns, row count, supported dataset/schema, complete metadata agreement, actual Repository search/detail queries, and Store schema validity. Each temporary connection is checkpointed and closed before file operations. Startup copies the current database to backup, promotes the candidate, and opens/queries it again. Failures restore the backup. An interrupted transition can be retried on startup. SQLiteProvider's `onInit` independently verifies the actual connection before setting the active metadata and `updated` state. Backups remain until a later successful candidate begins promotion.

New manifests have `schemaVersion: 1`, a content `revision` (SHA-256), and `version: r1-<revision>`. Revision covers the dataset/schema identity, source dates, and ID-sorted normalized store content, excluding generated/created/updated timestamps. Identical data rebuilds do not trigger downloads. Coordinate, parser-result, or source-date changes do. A different revision must have a strictly newer `generatedAt`; an older/equal-time manifest is rejected. Rollback therefore requires publishing the chosen older content as a newly generated manifest, with explicit operator intent.

Legacy bundled/installed databases without revision/schema metadata are accepted locally only after the same SQLite/Repository checks. New code rejects legacy remote manifests; it upgrades a legacy seed to the first compatible newer revision. Older app versions ignore the extra manifest fields and see the changed version string, but retain their old update lifecycle and weaker validation until the app is upgraded. Do not change the SQLite schema incompatibly under schema version 1.

## Collection and source dates (#12, #15)

Each fetch gets a new `data/raw/snapshot-*` directory. Only a fully downloaded collection receives `snapshot.json`; parsing reads exactly its ordered page list. Every page must report the same official total. Missing pages/cards, skipped malformed cards, duplicate IDs, and total-count mismatches abort the build. Old files outside the manifest cannot enter it. A decrease of more than 10% against the deployed manifest blocks publication. The manual workflow can supply a reviewed `decrease_reason`; its value is written into the validation report. An unavailable baseline fails closed; HTTP 404 alone permits the committed seed baseline for initial publication.

HTML dates are extracted only in update/current-as-of context, supporting all months and full-width digits; an absent HTML date remains null. Both PDF dates must parse to real calendar dates or the build is withheld. `sourceDates.ab` and `sourceDates.b` preserve the individual source dates. The representative `officialUpdatedAt` is their maximum and means **latest update among the two coupon lists**, not that both lists were refreshed that day. Store-specific HTML dates remain separate. The source timestamp is never a deployment revision.

Validated builds are assembled in a staging directory before replacing `data/latest`. Pages artifact upload/deployment runs only after the build and dataset tests succeed. A collection failure does not deploy or change the published data.

## Search and selection (#13–#14)

Search results are `Store[]` from SQLite, held in React state. Coordinate groups and pins are derived separately. Keyword search without a radius is global and includes unlocated stores. Viewport browsing and an active radius with a known location exclude stores whose coordinates are unknown; without a user location, radius filtering is not applied. No artificial coordinates are generated. List totals count search matches, not pins. Detail and coupon/address information work for unlocated stores. Distance reports unavailable, map camera/preview is omitted, and the existing external directions action uses the store's name/address as its search destination.

Selected detail is fetched by ID independently of the current result set. Search/filter changes refresh results while preserving the open detail; map pans and selection camera movement preserve it as well. Empty-map taps/back explicitly clear selection. Superseded asynchronous queries cannot overwrite newer results. Query failures retain the previous results with an error/retry state.

## CI and seed provenance (#16–#17)

- `pnpm dataset:fixture` builds synthetic, checked-in HTML/PDF fixtures through the real parser, normalizer, SQLite writer and manifest exporter without network access. It neither replaces the bundled seed nor writes production output. Fixtures contain no official visual assets.
- `pnpm dataset:build` performs live collection, completeness validation and geocoding. It belongs to the separate dataset workflow, not PR checks or APK release builds.
- APK builds use the seed committed at the release's Git revision. `pnpm dataset:verify-seed` checks the seed manifest/hash/size, integrity, data, metadata, and actual Repository queries, then emits `seed-verification.json`. The APK artifact and tagged release include this report. The existing legacy seed remains unchanged and is identified by its version and exact SQLite SHA-256.
- To deliberately refresh the bundled snapshot: run a successful live build, review `data/latest/validation-report.json`, copy `data/latest/stores.sqlite` and `manifest.json` to `apps/mobile/src/assets/db/seed.sqlite` and `seed.manifest.json`, run `pnpm dataset:verify-seed`, and commit both files together. No live source is refetched during release.
- Shared synthetic SQLite fixtures support normal, legacy, missing-column, mismatched metadata, corrupt-file, and missing-coordinate cases. Tests inject delayed close, file-operation/open failures, concurrent update calls and interrupted startup. Search tests run real React effects against real SQLite through an Expo IO adapter. Temporary reintroduction of the #9 close-order and #13 selection-guard defects made the respective tests fail.
- React Testing Library 16.3.2, jsdom 27.4.0 and React DOM matching React 19.2.3 are dev-only MIT dependencies; Node 24 satisfies their engines. This follows the maintained React testing approach rather than mocking hooks. They add no mobile bundle code. Expo SDK 56 patch versions were aligned to its compatibility check. The transitive `source-map-js` security patch was also resolved in the lockfile.

## Verification record

The accompanying work log records local checks and native/hosted limitations separately. `act` uses the checked-in `.actrc` image mapping. GitHub artifact upload, Pages deployment and tagged release publication are skipped under `ACT`; local results do not prove those hosted operations.

### 2026-10-09 local results

| Check | Result |
| --- | --- |
| `pnpm typecheck`, `pnpm lint`, `git diff --check` | Passed |
| `pnpm test` / final Mobile CI | 27 files, 120 tests passed |
| `expo install --check` | Compatible SDK 56 package versions |
| `act pull_request -W .github/workflows/mobile-ci.yml -j quality` | Passed, including fixture build, seed verification and Expo check |
| `act workflow_dispatch -W .github/workflows/build-dataset.yml -j build-dataset` | Passed; live collection produced 1,467 stores; 35 dataset tests passed |
| `act workflow_dispatch -W .github/workflows/release-apk.yml -j verify-seed` | Passed; committed legacy seed has 1,444 stores |

Two independent live builds produced the same content revision: `e68a7b8b096d2a48dabfef09a4fc9632bceba910b9789731c62cb943d9f9b0c3`. The committed seed remained unchanged at SHA-256 `b90c7f9cd20be217ae7d71342bffba9d3df79b8235047a00888a7f87ed7578f2`.

Android emulator (`Dev`, API 36.1) evidence:

- In Expo Go, selected `25Hudson`, changed the coupon filter to B-only, and confirmed detail remained open. Returning to results showed 9 matches instead of 49, with A/B count 0 and B-only count 9.
- The installed Android debug app loaded this branch through Metro. Its original SQLite directory was archived before injecting synthetic test files. A staged, hash-matching candidate was applied on restart; native-file readback showed its new revision and two rows. Candidate and pending-manifest files were removed after successful initialization, with backup retained.
- A global `Native` search displayed both synthetic records, including the null-coordinate record. Opening `Native unlocated` displayed its address, coupon and payment badges, and unavailable distance.
- After intentionally corrupting the test active DB and restarting, the app restored its previous 1,444-store backup. Extracted database bytes matched the archived original exactly. The complete original SQLite directory and temporary debug-host setting were restored after testing.
- An initial Metro process running during dependency replacement retained an old pnpm Uniwind path and produced a self-import error. Restarting Metro after dependency installation resolved it; no resolver workaround was added.

Limits: iOS hardware/simulator, APK assembly/signing, GitHub-hosted CI/artifact delivery, Pages publication, and the production download endpoint's new manifest rollout were not exercised. Android candidate staging was injected locally; the full HTTP download-to-restart sequence on hardware remains unverified. No production data, published APK or GitHub issue state was changed.

`pnpm audit --prod` still reports 67 transitive advisories (4 low, 22 moderate, 40 high, 1 critical). These are dependency advisory matches, not validated app exploits; broad dependency-security remediation is outside #9–#17. The new test path's `source-map-js` advisory was removed by resolving 1.2.2, and unrelated lockfile refreshes were minimized.

API references used when Context7 was unavailable: [Expo SDK 56 SQLite](https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/), [React act](https://react.dev/reference/react/act), [Testing Library API](https://testing-library.com/docs/react-testing-library/api/).
