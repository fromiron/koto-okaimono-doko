import {
  ensureSeedDatabase,
  type BootDatabaseResult,
} from './ensureSeedDatabase';

let boot: Promise<BootDatabaseResult> | undefined;

export function bootApp(): Promise<BootDatabaseResult> {
  // StrictMode/retries must not run file transitions alongside a mounted provider.
  boot ??= ensureSeedDatabase().catch((error) => {
    boot = undefined;
    throw error;
  });
  return boot;
}
