import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { needsDatasetUpdate } from '@koto/schema';
import { assertCountChange, buildDataset } from './index';
import { fetchOfficial, inferListPageCount } from './fetchOfficial';
import { parseHtmlPages, parseOfficialUpdatedAt } from './parseHtml';
import { parsePdfUpdatedAt, sourceDateMetadata } from './parsePdf';
import { datasetRevision } from './revision';
import { fixtureMeta, fixtureStores } from './testing/database';
import { repoRoot } from './paths';

const dirs: string[] = [];
afterEach(async () => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  await Promise.all(
    dirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })),
  );
});
async function snapshot() {
  const directory = await mkdtemp(path.join(tmpdir(), 'koto-snapshot-'));
  dirs.push(directory);
  await cp(
    path.join(repoRoot, 'packages/dataset-cli/src/testing/snapshot'),
    directory,
    { recursive: true },
  );
  return {
    directory,
    total: 2,
    pageCount: 2,
    files: ['list-page-1.html', 'list-page-2.html'],
  };
}

it('builds the complete HTML/PDF/normalization/SQLite/manifest contract without network', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('Network forbidden');
    }),
  );
  await buildDataset(true);
  expect(fetch).not.toHaveBeenCalled();
});

it.each(Array.from({ length: 12 }, (_, i) => i + 1))(
  'parses month %i, full-width digits, and PDF dates in update context',
  (month) => {
    const expected = `2026-${String(month).padStart(2, '0')}-09`;
    expect(parseOfficialUpdatedAt(`<p>更新日：2026年${month}月9日</p>`)).toBe(
      expected,
    );
    expect(parsePdfUpdatedAt(`2026/${month}/9 現在`)).toBe(expected);
    expect(
      parseOfficialUpdatedAt(
        `<p>${`2026年${month}月9日`.replace(/[0-9]/g, (n) => String.fromCharCode(n.charCodeAt(0) + 0xfee0))} 更新</p>`,
      ),
    ).toBe(expected);
  },
);

it('rejects impossible dates and campaign periods', () => {
  expect(parseOfficialUpdatedAt('<p>2026年2月30日 更新</p>')).toBeNull();
  expect(
    parseOfficialUpdatedAt('<p>期間：2026年10月9日～2026年11月9日</p>'),
  ).toBeNull();
  expect(parsePdfUpdatedAt('2026/13/9 現在')).toBeNull();
});

it('ignores stale files outside the completed snapshot manifest', async () => {
  const input = await snapshot();
  await writeFile(path.join(input.directory, 'list-page-3.html'), 'old data');
  expect(await parseHtmlPages(input)).toHaveLength(2);
});

it.each(['duplicate', 'missing-row', 'changed-total', 'missing-page'])(
  'blocks %s snapshot',
  async (kind) => {
    const input = await snapshot();
    const file = path.join(input.directory, 'list-page-2.html');
    let html = await readFile(file, 'utf8');
    if (kind === 'duplicate') html = html.replace('fixture-2', 'fixture-1');
    if (kind === 'missing-row') html = html.replace('<h4>試験商店2</h4>', '');
    if (kind === 'changed-total')
      html = html.replace('<strong>2</strong>', '<strong>3</strong>');
    await writeFile(file, html);
    if (kind === 'missing-page') await rm(file);
    await expect(parseHtmlPages(input)).rejects.toThrow();
  },
);

it('does not infer one successful page when markup cannot be parsed', () => {
  expect(() => inferListPageCount('<html>Changed markup</html>')).toThrow();
  expect(() =>
    inferListPageCount(
      '<p id="store-list-hit">検索結果<strong>20</strong>件</p>',
    ),
  ).toThrow();
});

it('requires an explicit review reason for a large decrease', () => {
  expect(() => assertCountChange(80, 100)).toThrow();
  expect(() =>
    assertCountChange(80, 100, 'Confirmed official closure list'),
  ).not.toThrow();
  expect(() => assertCountChange(95, 100)).not.toThrow();
});

it('uses stable content revisions, while changed coordinates update even on the same source date', () => {
  const dates = { ab: '2026-10-08', b: '2026-10-09' };
  const revision = datasetRevision(fixtureStores, dates);
  expect(
    datasetRevision(
      [...fixtureStores]
        .reverse()
        .map((store) => ({ ...store, createdAt: 'later', updatedAt: 'later' })),
      dates,
    ),
  ).toBe(revision);
  const changed = datasetRevision(
    fixtureStores.map((store) => ({ ...store, lat: 35.7 })),
    dates,
  );
  const current = { ...fixtureMeta, revision, version: `r1-${revision}` };
  const next = {
    ...current,
    generatedAt: '2026-10-10T00:00:00.000Z',
    revision: changed,
    version: `r1-${changed}`,
  };
  expect(needsDatasetUpdate(current, next)).toBe(true);
  expect(
    needsDatasetUpdate(current, { ...current, generatedAt: next.generatedAt }),
  ).toBe(false);
  expect(() => needsDatasetUpdate(next, current)).toThrow(/older/);
  expect(
    needsDatasetUpdate(
      {
        ...current,
        revision: undefined,
        schemaVersion: undefined,
        version: 'legacy',
      },
      next,
    ),
  ).toBe(true);
  expect(() =>
    needsDatasetUpdate(current, { ...next, datasetId: 'other' }),
  ).toThrow();
  expect(() =>
    needsDatasetUpdate(current, { ...next, schemaVersion: 2 }),
  ).toThrow();
});

it('isolates a 100 to 95 page collection and never completes a partially downloaded snapshot', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  const root = await mkdtemp(path.join(tmpdir(), 'koto-fetch-'));
  dirs.push(root);
  let total = 100;
  let fail = false;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (fail && url.includes('page=2')) throw new Error('download failed');
      if (url.endsWith('.pdf')) return new Response('test-pdf');
      const page = Number(new URL(url).searchParams.get('page') ?? 1);
      return new Response(
        `<p id="store-list-hit">検索結果<strong>${total}</strong>件</p><div id="store-list-inner"><div class="box"><a class="box-link" href="/list/detail/${page}"><h4>店${page}</h4><p>森下1-1</p><div class="category">《買う》菓子・パン</div></a></div></div>`,
      );
    }),
  );
  const firstPromise = fetchOfficial(root);
  await vi.runAllTimersAsync();
  // File writes schedule more timers after IO, so advance until settled.
  async function drain<T>(promise: Promise<T>): Promise<T> {
    let done = false;
    void promise.then(
      () => {
        done = true;
      },
      () => {
        done = true;
      },
    );
    while (!done) {
      await vi.runAllTimersAsync();
      await new Promise((resolve) => setImmediate(resolve));
    }
    return promise;
  }
  const first = await drain(firstPromise);
  total = 95;
  const second = await drain(fetchOfficial(root));
  expect(first.directory).not.toBe(second.directory);
  expect(await parseHtmlPages(second)).toHaveLength(95);
  expect(await parseHtmlPages(first)).toHaveLength(100);
  fail = true;
  await expect(drain(fetchOfficial(root))).rejects.toThrow('download failed');
});

it.each([
  ['2026-07-01', '2026-06-24'],
  ['2026-06-24', '2026-07-01'],
])('preserves AB %s and B %s while choosing their latest date', (ab, b) => {
  expect(sourceDateMetadata({ abUpdatedAt: ab, bUpdatedAt: b })).toEqual({
    sourceDates: { ab, b },
    officialUpdatedAt: '2026-07-01',
  });
});

it.each([
  { abUpdatedAt: null, bUpdatedAt: '2026-07-01' },
  { abUpdatedAt: '2026-07-01', bUpdatedAt: null },
  { abUpdatedAt: null, bUpdatedAt: null },
])('withholds builds when either source date is unknown: %j', (dates) => {
  expect(() => sourceDateMetadata(dates)).toThrow(/review required/);
});
