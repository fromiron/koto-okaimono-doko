import { describe, expect, it } from 'vitest';

import { parseListPage } from './parseHtml';

describe('parseListPage', () => {
  it('extracts store rows from official search result cards', () => {
    const rows = parseListPage(`
      <p id="store-list-hit">検索結果<strong>1</strong>件</p>
      <div id="store-list-inner">
        <div class="box">
          <ul class="kinds">
            <li class="kinds-spec">
              <figure><img src="/list/images/icon_paper.png" alt="紙"></figure>
              <figure><img src="/list/images/icon_digital.png" alt="デジタル"></figure>
            </li>
            <li class="kinds-alfa">
              <figure><img src="/list/images/iconAB.png" alt="A"></figure>
            </li>
          </ul>
          <a href="/list/detail/example-id" class="box-link">
            <h4>元祖カレーパン カトレア</h4>
            <p>〒135-0004 森下1-6-10&nbsp;レックス森下101 </p>
            <div class="category">《買う》菓子・パン</div>
          </a>
        </div>
      </div>
      <time>2026年６月24日</time>
    `);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'example-id',
      name: '元祖カレーパン カトレア',
      postalCode: '135-0004',
      couponType: 'ab',
      acceptsPaper: true,
      acceptsDigital: true,
      categoryMajorId: 'shopping',
      categoryMinorId: 'sweets_bread',
      officialDetailUrl: 'https://koto-okaimono-premium.jp/list/detail/example-id',
      sourceUpdatedAt: '2026-06-24',
    });
  });

  it('does not emit store rows whose detail links are outside the official detail URL policy', () => {
    const rows = parseListPage(`
      <p id="store-list-hit">検索結果<strong>1</strong>件</p>
      <div id="store-list-inner">
        <div class="box">
          <ul class="kinds">
            <li class="kinds-spec">
              <figure><img src="/list/images/icon_paper.png" alt="紙"></figure>
            </li>
          </ul>
          <a href="javascript:alert(1)" class="box-link">
            <h4>Unsafe Link Store</h4>
            <p>〒135-0004 森下1-6-10</p>
            <div class="category">《買う》菓子・パン</div>
          </a>
        </div>
      </div>
    `);

    expect(rows).toEqual([]);
  });
});
