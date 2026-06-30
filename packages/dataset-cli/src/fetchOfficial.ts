import { mkdir, writeFile } from 'node:fs/promises';

import { rawDir, rawPaths } from './paths';

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

export async function fetchOfficial(): Promise<void> {
  await mkdir(rawDir, { recursive: true });

  const firstPage = await fetchText(`${BASE_URL}/list/`);
  await writeFile(rawPaths.listPage(1), firstPage, 'utf8');
  const listPageCount = inferListPageCount(firstPage);

  const tasks: DownloadTask[] = [
    { url: `${BASE_URL}/common/pdf/storeListAB.pdf`, destination: rawPaths.abPdf, kind: 'binary' },
    { url: `${BASE_URL}/common/pdf/storeListB.pdf`, destination: rawPaths.bPdf, kind: 'binary' },
    ...Array.from({ length: Math.max(listPageCount - 1, 0) }, (_, index): DownloadTask => {
      const page = index + 2;
      return {
        url: `${BASE_URL}/list/?n=&t=&g=&a=&b=&p=&d=&page=${page}`,
        destination: rawPaths.listPage(page),
        kind: 'text',
      };
    }),
  ];

  await runWithConcurrency(tasks, officialFetchLimits.concurrency, async (task) => {
    if (task.kind === 'binary') {
      await downloadBinary(task.url, task.destination);
      return;
    }
    await downloadText(task.url, task.destination);
  });
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

async function fetchWithRetry<T>(url: string, readBody: (response: Response) => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= officialFetchLimits.retries; attempt += 1) {
    await waitForRequestSlot();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), officialFetchLimits.requestTimeoutMs);

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

  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
}

async function waitForRequestSlot(): Promise<void> {
  const now = Date.now();
  const delay = Math.max(0, nextRequestAt - now);
  nextRequestAt = Math.max(now, nextRequestAt) + officialFetchLimits.requestDelayMs;
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
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          await worker(item);
        }
      }
    }),
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function inferListPageCount(html: string): number {
  const hitMatch = html.match(/検索結果\s*<strong>(\d+)<\/strong>件/);
  const total = Number(hitMatch?.[1] ?? 0);
  const perPage = (html.match(/class="box-link"/g) ?? []).length;

  if (total > officialFetchLimits.maxOfficialStoreCount) {
    throw new Error(
      `Official store count ${total} exceeds safety cap ${officialFetchLimits.maxOfficialStoreCount}`,
    );
  }

  if (!total || !perPage) {
    return 1;
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
