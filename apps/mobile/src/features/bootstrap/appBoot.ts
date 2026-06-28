import { ensureSeedDatabase } from './ensureSeedDatabase';

export async function bootApp(): Promise<void> {
  await ensureSeedDatabase();
}
