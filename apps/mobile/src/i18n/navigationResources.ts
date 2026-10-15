import type { SupportedLocale } from '@koto/schema';

export const navigationResources: Record<
  SupportedLocale,
  {
    positionReset: string;
    backToFacility: string;
    resultsChanged: string;
    selectionMissing: string;
    outsideResults: string;
  }
> = {
  ja: {
    positionReset: '一覧の位置を復元できなかったため、先頭に戻りました。',
    backToFacility: 'この場所のお店に戻る',
    resultsChanged:
      'データが更新されました。戻り先のお店がない場合は一覧の先頭を表示します。',
    selectionMissing: 'このお店は現在のデータにありません。一覧に戻りました。',
    outsideResults: 'このお店は現在の検索条件に含まれていません。',
  },
  en: {
    positionReset:
      'The previous list position could not be restored. Returned to the top.',
    backToFacility: 'Back to stores at this location',
    resultsChanged:
      'Store data changed. If the previous store is missing, the list starts at the top.',
    selectionMissing:
      'This store is no longer in the dataset. Returned to the list.',
    outsideResults: 'This store is outside the current search results.',
  },
  ko: {
    positionReset: '이전 목록 위치를 복원할 수 없어 처음으로 돌아왔습니다.',
    backToFacility: '이 장소의 매장 목록으로',
    resultsChanged:
      '매장 데이터가 갱신되었습니다. 이전 매장이 없으면 목록의 처음으로 돌아갑니다.',
    selectionMissing: '현재 데이터에 없는 매장입니다. 목록으로 돌아왔습니다.',
    outsideResults: '현재 검색 조건에 포함되지 않는 매장입니다.',
  },
  'zh-Hans': {
    positionReset: '无法恢复之前的列表位置，已返回顶部。',
    backToFacility: '返回此处的店铺列表',
    resultsChanged: '店铺数据已更新。若原店铺不存在，将显示列表顶部。',
    selectionMissing: '当前数据中已无此店铺，已返回列表。',
    outsideResults: '此店铺不在当前搜索结果中。',
  },
  'zh-Hant': {
    positionReset: '無法恢復先前的列表位置，已返回頂部。',
    backToFacility: '返回此處的店舖列表',
    resultsChanged: '店舖資料已更新。若原店舖不存在，將顯示列表頂部。',
    selectionMissing: '目前資料中已無此店舖，已返回列表。',
    outsideResults: '此店舖不在目前搜尋結果中。',
  },
};
