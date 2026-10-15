import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';

import path from 'node:path';
import { load } from 'cheerio';
import { rawDir, snapshotPaths } from './paths';

const BASE_URL = 'https://koto-okaimono-premium.jp';
export const officialFetchLimits = {
  maxOfficialStoreCount: 3000,
  maxListPages: 300,
  concurrency: 2,
  requestDelayMs: 300,
  requestTimeoutMs: 15_000,
  retries: 2,
  retryBaseDelayMs: 500,
} as const;

type DownloadTask = {
  url: string;
  destination: string;
  kind: 'text' | 'binary';
};

let nextRequestAt = 0;

export type SourceSnapshot = {
  directory: string;
  total: number;
  pageCount: number;
  files: string[];
};

export async function fetchOfficial(root = rawDir): Promise<SourceSnapshot> {
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, 'snapshot-'));
  const rawPaths = snapshotPaths(directory);

  const firstPage = await fetchText(`${BASE_URL}/list/`);
  await writeFile(rawPaths.listPage(1), firstPage, 'utf8');
  const listPageCount = inferListPageCount(firstPage);
  const total = officialStoreCount(firstPage);

  const tasks: DownloadTask[] = [
    {
      url: `${BASE_URL}/common/pdf/storeListAB.pdf`,
      destination: rawPaths.abPdf,
      kind: 'binary',
    },
    {
      url: `${BASE_URL}/common/pdf/storeListB.pdf`,
      destination: rawPaths.bPdf,
      kind: 'binary',
    },
    ...Array.from(
      { length: Math.max(listPageCount - 1, 0) },
      (_, index): DownloadTask => {
        const page = index + 2;
        return {
          url: `${BASE_URL}/list/?n=&t=&g=&a=&b=&p=&d=&page=${page}`,
          destination: rawPaths.listPage(page),
          kind: 'text',
        };
      },
    ),
  ];

  await runWithConcurrency(
    tasks,
    officialFetchLimits.concurrency,
    async (task) => {
      if (task.kind === 'binary') {
        await downloadBinary(task.url, task.destination);
        return;
      }
      await downloadText(task.url, task.destination);
    },
  );
  const snapshot = {
    directory,
    total,
    pageCount: listPageCount,
    files: Array.from(
      { length: listPageCount },
      (_, i) => `list-page-${i + 1}.html`,
    ),
  };
  await writeFile(
    path.join(directory, 'snapshot.json'),
    JSON.stringify(snapshot, null, 2),
  );
  return snapshot;
}

async function downloadText(url: string, destination: string): Promise<void> {
  await writeFile(destination, await fetchText(url), 'utf8');
}

async function fetchText(url: string): Promise<string> {
  return fetchWithRetry(url, (response) => response.text());
}

async function downloadBinary(url: string, destination: string): Promise<void> {
  const body = await fetchWithRetry(url, (response) => response.arrayBuffer());
  await writeFile(destination, Buffer.from(body));
}

async function fetchWithRetry<T>(
  url: string,
  readBody: (response: Response) => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= officialFetchLimits.retries; attempt += 1) {
    await waitForRequestSlot();
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      officialFetchLimits.requestTimeoutMs,
    );

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }
      return await readBody(response);
    } catch (error) {
      lastError = error;
      if (attempt === officialFetchLimits.retries) {
        break;
      }
      await sleep(officialFetchLimits.retryBaseDelayMs * (attempt + 1));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to fetch ${url}`);
}

async function waitForRequestSlot(): Promise<void> {
  const now = Date.now();
  const delay = Math.max(0, nextRequestAt - now);
  nextRequestAt =
    Math.max(now, nextRequestAt) + officialFetchLimits.requestDelayMs;
  if (delay > 0) {
    await sleep(delay);
  }
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const results = await Promise.allSettled(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          await worker(item);
        }
      }
    }),
  );
  const failure = results.find((result) => result.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function officialStoreCount(html: string): number {
  const text = load(html)('#store-list-hit').text().normalize('NFKC');
  const match = text.match(/検索結果\s*([\d,]+)\s*件/);
  if (!match) throw new Error('Official total count could not be parsed');
  const total = Number(match[1]!.replaceAll(',', ''));
  if (!Number.isSafeInteger(total) || total <= 0)
    throw new Error('Official total count is empty or invalid');
  return total;
}

export function inferListPageCount(html: string): number {
  const total = officialStoreCount(html);
  const perPage = load(html)('a.box-link').length;

  if (total > officialFetchLimits.maxOfficialStoreCount) {
    throw new Error(
      `Official store count ${total} exceeds safety cap ${officialFetchLimits.maxOfficialStoreCount}`,
    );
  }

  if (!total || !perPage) {
    throw new Error('Official pagination could not be parsed');
  }

  const pageCount = Math.ceil(total / perPage);
  if (pageCount > officialFetchLimits.maxListPages) {
    throw new Error(
      `Official list page count ${pageCount} exceeds safety cap ${officialFetchLimits.maxListPages}`,
    );
  }

  return pageCount;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await fetchOfficial();
}
