import { mkdir, writeFile } from 'node:fs/promises';

import { rawDir, rawPaths } from './paths';

const BASE_URL = 'https://koto-okaimono-premium.jp';

export async function fetchOfficial(): Promise<void> {
  await mkdir(rawDir, { recursive: true });

  const firstPage = await fetchText(`${BASE_URL}/list/`);
  await writeFile(rawPaths.listPage(1), firstPage, 'utf8');
  const listPageCount = inferListPageCount(firstPage);

  await Promise.all([
    downloadBinary(`${BASE_URL}/common/pdf/storeListAB.pdf`, rawPaths.abPdf),
    downloadBinary(`${BASE_URL}/common/pdf/storeListB.pdf`, rawPaths.bPdf),
    ...Array.from({ length: Math.max(listPageCount - 1, 0) }, (_, index) => {
      const page = index + 2;
      const url = `${BASE_URL}/list/?n=&t=&g=&a=&b=&p=&d=&page=${page}`;
      return downloadText(url, rawPaths.listPage(page));
    }),
  ]);
}

async function downloadText(url: string, destination: string): Promise<void> {
  await writeFile(destination, await fetchText(url), 'utf8');
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function downloadBinary(url: string, destination: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

function inferListPageCount(html: string): number {
  const hitMatch = html.match(/検索結果\s*<strong>(\d+)<\/strong>件/);
  const total = Number(hitMatch?.[1] ?? 0);
  const perPage = (html.match(/class="box-link"/g) ?? []).length;

  if (!total || !perPage) {
    return 1;
  }

  return Math.ceil(total / perPage);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await fetchOfficial();
}
