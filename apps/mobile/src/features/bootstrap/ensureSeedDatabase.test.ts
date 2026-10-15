import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import {
  createFixtureDatabase,
  fixtureMeta,
  openTestDatabase,
} from '../../../../../packages/dataset-cli/src/testing/database';

const state = vi.hoisted(() => ({
  directory: '',
  fail: '',
  events: [] as string[],
  opened: 0,
  closeGate: null as Promise<void> | null,
}));
vi.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/unused/',
  async makeDirectoryAsync(uri: string) {
    mkdirSync(uri, { recursive: true });
  },
  async getInfoAsync(uri: string) {
    return existsSync(uri)
      ? { exists: true, size: statSync(uri).size }
      : { exists: false };
  },
  async readAsStringAsync(uri: string) {
    return readFileSync(uri, 'utf8');
  },
  async deleteAsync(uri: string) {
    record(`delete:${path.basename(uri)}`);
    rmSync(uri, { force: true });
  },
  async copyAsync({ from, to }: { from: string; to: string }) {
    record(`copy:${path.basename(to)}`);
    copyFileSync(from, to);
  },
  async moveAsync({ from, to }: { from: string; to: string }) {
    record(`move:${path.basename(to)}`);
    renameSync(from, to);
  },
}));
vi.mock('../dataset/datasetPaths', () => ({
  activeDatabaseName: 'active.sqlite',
  backupDatabaseName: 'backup.sqlite',
  candidateDatabaseName: 'candidate.sqlite',
  get sqliteDirectory() {
    return state.directory;
  },
  datasetPaths: {
    get activeDatabaseUri() {
      return path.join(state.directory, 'active.sqlite');
    },
    get backupDatabaseUri() {
      return path.join(state.directory, 'backup.sqlite');
    },
    get candidateDatabaseUri() {
      return path.join(state.directory, 'candidate.sqlite');
    },
    get localManifestUri() {
      return path.join(state.directory, 'pending.json');
    },
  },
}));
vi.mock('expo-sqlite', () => ({
  async openDatabaseAsync(name: string) {
    record(`open:${name}`);
    const connection = openTestDatabase(path.join(state.directory, name));
    state.opened++;
    return {
      ...connection,
      async closeAsync() {
        if (state.closeGate) await state.closeGate;
        await connection.closeAsync();
        state.opened--;
        state.events.push(`close:${name}`);
      },
    };
  },
}));
vi.mock('expo-file-system', () => ({
  File: class {
    constructor(public uri: string) {}
    async bytes() {
      return readFileSync(this.uri);
    }
  },
}));
vi.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'sha256' },
  async digest(_: string, bytes: Uint8Array) {
    return Uint8Array.from(createHash('sha256').update(bytes).digest()).buffer;
  },
}));
vi.mock('@/src/assets/db/seed.sqlite', () => ({ default: 'seed' }));
vi.mock('expo-asset', () => ({
  Asset: {
    fromModule: () => ({
      localUri: path.join(state.directory, 'seed.sqlite'),
      async downloadAsync() {},
    }),
  },
}));

function record(operation: string) {
  state.events.push(operation);
  if (/^(copy|move|delete):/.test(operation)) expect(state.opened).toBe(0);
  if (state.fail === operation) {
    state.fail = '';
    throw new Error(`Injected ${operation}`);
  }
}

const oldMeta = {
  ...fixtureMeta,
  generatedAt: '2026-10-01T00:00:00.000Z',
  revision: 'b'.repeat(64),
  version: `r1-${'b'.repeat(64)}`,
};
beforeEach(() => {
  state.directory = mkdtempSync(path.join(tmpdir(), 'koto-boot-'));
  state.events = [];
  state.fail = '';
  state.opened = 0;
  state.closeGate = null;
  createFixtureDatabase(path.join(state.directory, 'active.sqlite'), oldMeta);
  createFixtureDatabase(path.join(state.directory, 'seed.sqlite'), {
    ...oldMeta,
    version: 'legacy',
    revision: undefined,
    schemaVersion: undefined,
  });
});
afterEach(() => {
  expect(state.opened).toBe(0);
  rmSync(state.directory, { recursive: true, force: true });
});

function stage() {
  const file = path.join(state.directory, 'candidate.sqlite');
  createFixtureDatabase(file);
  const bytes = readFileSync(file);
  const manifest = {
    ...fixtureMeta,
    sqlite: {
      url: 'https://example.test/db',
      size: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    },
  };
  writeFileSync(
    path.join(state.directory, 'pending.json'),
    JSON.stringify(manifest),
  );
}
async function activeVersion() {
  const db = openTestDatabase(path.join(state.directory, 'active.sqlite'));
  try {
    return (
      await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM dataset_meta WHERE key = 'version'",
      )
    )?.value;
  } finally {
    await db.closeAsync();
  }
}

it('waits for verification connections to close before file transitions', async () => {
  stage();
  let release!: () => void;
  state.closeGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { ensureSeedDatabase } = await import('./ensureSeedDatabase');
  const boot = ensureSeedDatabase();
  await vi.waitFor(() => expect(state.opened).toBe(1));
  expect(state.events.some((event) => event.startsWith('copy:'))).toBe(false);
  state.closeGate = null;
  release();
  await expect(boot).resolves.toEqual({ updated: true });
  expect(await activeVersion()).toBe(fixtureMeta.version);
});

it.each([
  'delete:backup.sqlite',
  'copy:backup.sqlite',
  'delete:active.sqlite-wal',
  'delete:active.sqlite-shm',
  'delete:active.sqlite',
  'move:active.sqlite',
])(
  'recovers from %s failure and remains usable after restart',
  async (operation) => {
    stage();
    state.fail = operation;
    const { ensureSeedDatabase } = await import('./ensureSeedDatabase');
    expect((await ensureSeedDatabase()).error).toContain('Injected');
    expect(await activeVersion()).toBe(oldMeta.version);
    await expect(ensureSeedDatabase()).resolves.toEqual({ updated: false });
  },
);

it('restores backup when the promoted database cannot be reopened', async () => {
  stage();
  const { ensureSeedDatabase } = await import('./ensureSeedDatabase');
  const originalMove = (await import('expo-file-system/legacy')).moveAsync;
  vi.spyOn(
    await import('expo-file-system/legacy'),
    'moveAsync',
  ).mockImplementationOnce(async (options) => {
    await originalMove(options);
    state.fail = 'open:active.sqlite';
  });
  expect((await ensureSeedDatabase()).error).toContain('Injected');
  expect(await activeVersion()).toBe(oldMeta.version);
});

it.each(['missing', 'corrupt'])(
  'recovers a %s active database from backup before seed',
  async (kind) => {
    copyFileSync(
      path.join(state.directory, 'active.sqlite'),
      path.join(state.directory, 'backup.sqlite'),
    );
    if (kind === 'missing') rmSync(path.join(state.directory, 'active.sqlite'));
    else writeFileSync(path.join(state.directory, 'active.sqlite'), 'broken');
    const { ensureSeedDatabase } = await import('./ensureSeedDatabase');
    await ensureSeedDatabase();
    expect(await activeVersion()).toBe(oldMeta.version);
  },
);

it('uses seed only when neither active nor backup is usable', async () => {
  rmSync(path.join(state.directory, 'active.sqlite'));
  const { ensureSeedDatabase } = await import('./ensureSeedDatabase');
  await ensureSeedDatabase();
  expect(await activeVersion()).toBe('legacy');
});

it('resumes after interruption between backup creation and candidate promotion', async () => {
  stage();
  renameSync(
    path.join(state.directory, 'active.sqlite'),
    path.join(state.directory, 'backup.sqlite'),
  );
  const { ensureSeedDatabase } = await import('./ensureSeedDatabase');
  await expect(ensureSeedDatabase()).resolves.toEqual({ updated: true });
  expect(await activeVersion()).toBe(fixtureMeta.version);
});

it('rejects a corrupt candidate without changing the active database', async () => {
  stage();
  writeFileSync(path.join(state.directory, 'candidate.sqlite'), 'broken');
  const { ensureSeedDatabase } = await import('./ensureSeedDatabase');
  expect((await ensureSeedDatabase()).error).toBeTruthy();
  expect(await activeVersion()).toBe(oldMeta.version);
});

it('resumes a completed promotion whose success marker was not yet cleared', async () => {
  stage();
  copyFileSync(
    path.join(state.directory, 'active.sqlite'),
    path.join(state.directory, 'backup.sqlite'),
  );
  renameSync(
    path.join(state.directory, 'candidate.sqlite'),
    path.join(state.directory, 'active.sqlite'),
  );
  const { ensureSeedDatabase } = await import('./ensureSeedDatabase');
  await expect(ensureSeedDatabase()).resolves.toEqual({ updated: true });
  expect(await activeVersion()).toBe(fixtureMeta.version);
  expect(state.events).not.toContain('copy:backup.sqlite');
});

it('deduplicates startup calls before React mounts, including a later remount', async () => {
  stage();
  const { bootApp } = await import('./appBoot');
  const [first, second] = await Promise.all([bootApp(), bootApp()]);
  expect(first).toEqual({ updated: true });
  expect(second).toEqual(first);
  expect(await bootApp()).toEqual(first);
  expect(
    state.events.filter((event) => event === 'move:active.sqlite'),
  ).toHaveLength(1);
});
