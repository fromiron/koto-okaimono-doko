import { describe, expect, it } from 'vitest';

import { inferListPageCount, officialFetchLimits } from './fetchOfficial';

function listHtml(total: number, perPage: number): string {
  return `
    <p id="store-list-hit">検索結果<strong>${total}</strong>件</p>
    ${Array.from({ length: perPage }, () => '<a class="box-link" href="/list/detail/x"></a>').join('\n')}
  `;
}

describe('inferListPageCount', () => {
  it('infers the official list page count from total hits and rendered cards', () => {
    expect(inferListPageCount(listHtml(1444, 10))).toBe(145);
  });

  it('rejects implausibly large official hit counts before scheduling downloads', () => {
    expect(() =>
      inferListPageCount(listHtml(officialFetchLimits.maxOfficialStoreCount + 1, 20)),
    ).toThrow(/exceeds safety cap/);
  });

  it('rejects implausibly large page fan-out before scheduling downloads', () => {
    expect(() => inferListPageCount(listHtml(officialFetchLimits.maxListPages + 1, 1))).toThrow(
      /exceeds safety cap/,
    );
  });
});
