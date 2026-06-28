import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { normalizePostalCode, normalizeSearchText, parseOfficialCategory, stripPostalCode } from '@koto/core';
import type { CouponType } from '@koto/schema';
import { load } from 'cheerio';

import { rawDir } from './paths';

const BASE_URL = 'https://koto-okaimono-premium.jp';

export type ParsedStoreRow = {
  id: string;
  sourceDetailId: string;
  name: string;
  normalizedName: string;
  postalCode: string | null;
  address: string;
  normalizedAddress: string;
  categoryMajorId: string;
  categoryMajorLabel: string;
  categoryMinorId: string | null;
  categoryMinorLabel: string | null;
  couponType: CouponType;
  acceptsPaper: boolean;
  acceptsDigital: boolean;
  officialDetailUrl: string;
  sourceUpdatedAt: string | null;
};

export async function parseHtmlPages(): Promise<ParsedStoreRow[]> {
  const rows: ParsedStoreRow[] = [];
  const files = (await readdir(rawDir))
    .filter((file) => /^list-page-\d+\.html$/.test(file))
    .sort((a, b) => pageNumber(a) - pageNumber(b));

  for (const file of files) {
    const html = await readFile(path.join(rawDir, file), 'utf8');
    rows.push(...parseListPage(html));
  }

  return dedupeRows(rows);
}

function pageNumber(fileName: string): number {
  return Number(fileName.match(/list-page-(\d+)\.html/)?.[1] ?? 0);
}

export function parseListPage(html: string): ParsedStoreRow[] {
  const $ = load(html);
  const rows: ParsedStoreRow[] = [];

  $('#store-list-inner > .box').each((_, element) => {
    const box = $(element);
    const link = box.find('a.box-link').attr('href');
    const sourceDetailId = link?.split('/').filter(Boolean).at(-1);
    const name = box.find('h4').text().replace(/\s+/g, ' ').trim();
    const addressText = box.find('a.box-link > p').first().text().replace(/\s+/g, ' ').trim();
    const categoryRaw = box.find('.category').text().replace(/\s+/g, ' ').trim();
    const iconAlts = box
      .find('img')
      .map((_, image) => $(image).attr('alt') ?? '')
      .get();

    if (!link || !sourceDetailId || !name || !addressText || !categoryRaw) {
      return;
    }

    const category = parseOfficialCategory(categoryRaw);
    const address = stripPostalCode(addressText.replace(/\u00a0/g, ' '));

    rows.push({
      id: sourceDetailId,
      sourceDetailId,
      name,
      normalizedName: normalizeSearchText(name),
      postalCode: normalizePostalCode(addressText),
      address,
      normalizedAddress: normalizeSearchText(address),
      categoryMajorId: category.majorId,
      categoryMajorLabel: category.majorLabel,
      categoryMinorId: category.minorId,
      categoryMinorLabel: category.minorLabel,
      couponType: iconAlts.includes('B') ? 'b_only' : 'ab',
      acceptsPaper: iconAlts.includes('紙'),
      acceptsDigital: iconAlts.includes('デジタル'),
      officialDetailUrl: new URL(link, BASE_URL).toString(),
      sourceUpdatedAt: parseOfficialUpdatedAt(html),
    });
  });

  return rows;
}

function parseOfficialUpdatedAt(html: string): string | null {
  const match = html.match(/(\d{4})年[６6]月(\d{1,2})日/);
  if (!match) return null;

  const month = '06';
  const day = match[2]?.padStart(2, '0');
  return day ? `${match[1]}-${month}-${day}` : null;
}

function dedupeRows(rows: ParsedStoreRow[]): ParsedStoreRow[] {
  const seen = new Map<string, ParsedStoreRow>();
  for (const row of rows) {
    seen.set(row.id, row);
  }
  return [...seen.values()];
}
