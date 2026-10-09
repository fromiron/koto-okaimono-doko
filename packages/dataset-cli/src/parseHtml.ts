import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  normalizePostalCode,
  normalizeSearchText,
  parseOfficialCategory,
  stripPostalCode,
} from '@koto/core';
import { normalizeOfficialDetailUrl, type CouponType } from '@koto/schema';
import { load } from 'cheerio';

import { officialStoreCount, type SourceSnapshot } from './fetchOfficial';
import { parseUpdatedDate } from './dates';

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

export async function parseHtmlPages(
  snapshot: SourceSnapshot,
): Promise<ParsedStoreRow[]> {
  if (
    snapshot.files.length !== snapshot.pageCount ||
    snapshot.files.some((file, i) => file !== `list-page-${i + 1}.html`)
  ) {
    throw new Error('Incomplete snapshot page list');
  }
  const rows: ParsedStoreRow[] = [];
  for (const file of snapshot.files) {
    const html = await readFile(path.join(snapshot.directory, file), 'utf8');
    if (officialStoreCount(html) !== snapshot.total)
      throw new Error(`Official total changed during collection: ${file}`);
    const parsed = parseListPage(html);
    const cards = load(html)('#store-list-inner > .box').length;
    if (cards === 0 || parsed.length !== cards)
      throw new Error(
        `Skipped rows in ${file}: ${cards - parsed.length} of ${cards}`,
      );
    rows.push(...parsed);
  }
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) duplicates.push(row.id);
    seen.add(row.id);
  }
  if (duplicates.length)
    throw new Error(`Duplicate store IDs: ${duplicates.join(', ')}`);
  if (rows.length !== snapshot.total)
    throw new Error(
      `Snapshot count mismatch: expected ${snapshot.total}, parsed ${rows.length}`,
    );
  return rows;
}

export function parseListPage(html: string): ParsedStoreRow[] {
  const $ = load(html);
  const rows: ParsedStoreRow[] = [];

  $('#store-list-inner > .box').each((_, element) => {
    const box = $(element);
    const link = box.find('a.box-link').attr('href');
    const officialDetailUrl = link ? normalizeOfficialDetailUrl(link) : null;
    const sourceDetailId = officialDetailUrl
      ? new URL(officialDetailUrl).pathname.split('/').filter(Boolean).at(-1)
      : null;
    const name = box.find('h4').text().replace(/\s+/g, ' ').trim();
    const addressText = box
      .find('a.box-link > p')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim();
    const categoryRaw = box
      .find('.category')
      .text()
      .replace(/\s+/g, ' ')
      .trim();
    const iconAlts = box
      .find('img')
      .map((_, image) => $(image).attr('alt') ?? '')
      .get();

    if (
      !officialDetailUrl ||
      !sourceDetailId ||
      !name ||
      !addressText ||
      !categoryRaw
    ) {
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
      officialDetailUrl,
      sourceUpdatedAt: parseOfficialUpdatedAt(html),
    });
  });

  return rows;
}

export function parseOfficialUpdatedAt(html: string): string | null {
  return parseUpdatedDate(load(html)('body').text());
}
