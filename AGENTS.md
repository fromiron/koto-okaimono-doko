# AGENTS.md

## Implementation Policy

- Inspect existing project patterns, installed dependencies, and standard APIs before implementing.
- Prefer mature, widely used libraries over custom implementations when they solve the problem reliably.
- Before adding a new library, briefly check maintenance status, TypeScript support, bundle/runtime impact, license, security posture, and fit with the project structure.
- If similar libraries are available and the choice affects architecture, long-term maintenance, cost, or vendor lock-in, present two or three options with a recommendation before deciding.
- If the impact is small or the choice is conventional, choose the conservative widely used option and record the reason in the work summary.
- Use Context7 MCP for library/API documentation, code generation, configuration, migrations, and version-specific usage. Match documentation to the installed package version when possible.
- Do not guess uncertain APIs. Check documentation first.
- Avoid unnecessary dependencies. Implement small utilities and project-specific logic directly.

## Oracle

- Oracle is used to bundle prompts and selected files for second-model review, debugging, or design feedback.
- Use the `oracle` skill or Oracle MCP for stuck bugs, large refactor decisions, or design reviews where a second opinion is useful.
- Default to the browser engine. Ask before any API-costing Oracle run.

## Project Rules

- Build mobile-first with Expo Router and TypeScript strict mode.
- Use Uniwind for styling. Do not add NativeWind, Tamagui, Gluestack, React Native Paper, or another UI framework.
- Use Zustand only for UI and app state. Do not store the full Store list in Zustand.
- Store official Store data only in SQLite. UI state and small preferences use AsyncStorage.
- Do not parse PDFs on device.
- Do not add Firebase, Supabase, a custom backend, Mapbox, Google Places API, background location, EAS Update, analytics, or crash SDKs for MVP.
- Dataset updates must use `manifest.json` plus raw `stores.sqlite` download.
- The app must work offline from bundled `seed.sqlite`; map tiles are allowed to depend on the platform map provider.
- User location is foreground-only, held in session memory only, and never uploaded or persisted.
- Official logos, mascot images, and other official visual assets must not be bundled in the app.
- Support `ja`, `en`, `ko`, `zh-Hans`, and `zh-Hant`. Official Store names, addresses, and facility names remain in Japanese source text.
- Android production map builds require `GOOGLE_MAPS_API_KEY`; iOS uses Apple Maps by default.
- Implement incrementally. After each phase, run typecheck, lint, and tests where applicable.
- When adding or changing GitHub Actions, run the relevant workflow locally with `act` before treating the CI change as ready. Use the repo `.actrc` image mapping and document any local-only limitation.
