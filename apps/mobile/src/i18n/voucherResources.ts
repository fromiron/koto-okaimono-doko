export const voucherResources = {
  ja: {
    label: '使いたい商品券',
    summary: '{{medium}} · {{voucher}}',
    notSpecified: '指定しない',
    medium: '使いたい商品券の形式',
    voucher: '使いたい券種',
    paper: '紙',
    digital: 'デジタル',
    A: 'A券',
    B: 'B券',
    AB: 'A・B券',
    advancedStoreType: '詳細条件：店舗の取扱区分',
    advancedStoreTypeHelp:
      '店舗の取扱区分を追加で絞り込みます。使いたい券種とは別の条件です。',
    conflict:
      'A券と「B券のみ」の店舗区分を同時に選ぶと、該当する店舗はありません。店舗区分を解除すると、A券の選択を保ったまま探せます。',
    clearAdvanced: '店舗区分の条件を解除',
    persistence:
      '「適用」で変更を反映し、使いたい商品券をこの端末に保存します。適用せずに閉じると、変更は破棄されます。',
    persistenceFailed:
      '商品券の設定を保存できませんでした。条件は変更されていません。もう一度「適用」を押してください。',
    officialBasis:
      '公式データに基づく取扱情報です。利用前に最新情報をご確認ください。',
    seasonExpired: 'この商品券の利用期間は終了しています。',
    seasonUpcoming: 'この商品券の利用期間はまだ始まっていません。',
    seasonUnknown:
      'この商品券の利用期間を確認できません。公式情報をご確認ください。',
    compatible: '{{medium}} · {{voucher}}に対応',
    incompatible: '選択した商品券は対象外です',
    unknown: '公式データでは、この商品券の取扱いを確認できません。',
  },
  en: {
    label: 'Voucher to use',
    summary: '{{medium}} · {{voucher}}',
    notSpecified: 'Any',
    medium: 'Voucher format to use',
    voucher: 'Voucher type to use',
    paper: 'Paper',
    digital: 'Digital',
    A: 'Type A',
    B: 'Type B',
    AB: 'Types A and B',
    advancedStoreType: 'Advanced: store acceptance category',
    advancedStoreTypeHelp:
      'Adds a filter for the store’s acceptance category, separate from the voucher you want to use.',
    conflict:
      'Type A and stores accepting only B cannot match. Clear the store category to keep searching with Type A selected.',
    clearAdvanced: 'Clear store category filter',
    persistence:
      'Apply updates the filters and saves your voucher choice on this device. Closing without applying discards changes.',
    persistenceFailed:
      'Could not save your voucher choice. No filters have changed. Tap Apply to try again.',
    officialBasis:
      'Acceptance is based on official data. Check the latest information before use.',
    seasonExpired: 'The redemption period for this voucher has ended.',
    seasonUpcoming: 'The redemption period for this voucher has not started.',
    seasonUnknown:
      'The redemption period is unknown. Check the official information.',
    compatible: '{{medium}} · {{voucher}} accepted',
    incompatible: 'Selected voucher not accepted',
    unknown: 'Official data does not confirm acceptance of this voucher.',
  },
  ko: {
    label: '사용할 상품권',
    summary: '{{medium}} · {{voucher}}',
    notSpecified: '지정 안 함',
    medium: '사용할 상품권 형태',
    voucher: '사용할 권종',
    paper: '종이',
    digital: '디지털',
    A: 'A권',
    B: 'B권',
    AB: 'A·B권',
    advancedStoreType: '상세 조건: 매장 취급 구분',
    advancedStoreTypeHelp:
      '매장의 상품권 취급 구분으로 추가 검색합니다. 사용할 권종과는 별개의 조건입니다.',
    conflict:
      'A권과 B권 전용 매장을 동시에 선택하면 검색 결과가 없습니다. 매장 구분 조건을 해제하면 A권 선택을 유지하며 검색할 수 있습니다.',
    clearAdvanced: '매장 구분 조건 해제',
    persistence:
      '적용을 누르면 조건을 반영하고 사용할 상품권을 이 기기에 저장합니다. 적용하지 않고 닫으면 변경 사항은 취소됩니다.',
    persistenceFailed:
      '상품권 설정을 저장하지 못했습니다. 검색 조건은 변경되지 않았습니다. 적용을 다시 눌러 주세요.',
    officialBasis:
      '공식 데이터를 기준으로 한 취급 정보입니다. 사용 전에 최신 정보를 확인해 주세요.',
    seasonExpired: '이 상품권의 사용 기간이 종료되었습니다.',
    seasonUpcoming: '이 상품권의 사용 기간이 아직 시작되지 않았습니다.',
    seasonUnknown:
      '상품권 사용 기간을 확인할 수 없습니다. 공식 정보를 확인해 주세요.',
    compatible: '{{medium}} · {{voucher}} 취급',
    incompatible: '선택한 상품권 취급 안 함',
    unknown: '공식 데이터에서 이 상품권의 취급 여부를 확인할 수 없습니다.',
  },
  'zh-Hans': {
    label: '想使用的购物券',
    summary: '{{medium}} · {{voucher}}',
    notSpecified: '不限',
    medium: '想使用的购物券形式',
    voucher: '想使用的券种',
    paper: '纸质',
    digital: '电子',
    A: 'A券',
    B: 'B券',
    AB: 'A、B券',
    advancedStoreType: '高级条件：店铺受理类别',
    advancedStoreTypeHelp: '按店铺受理类别进一步筛选，与想使用的券种分别设置。',
    conflict:
      '同时选择A券和仅限B券的店铺时，没有符合条件的店铺。清除店铺类别条件后，可以保留A券选项继续查找。',
    clearAdvanced: '清除店铺类别条件',
    persistence:
      '点击“应用”后，筛选条件生效，并将购物券选项保存在此设备上。未应用就关闭会放弃更改。',
    persistenceFailed:
      '无法保存购物券选项，筛选条件尚未更改。请再次点击“应用”。',
    officialBasis: '受理信息依据官方数据。使用前请确认最新信息。',
    seasonExpired: '此购物券的使用期限已结束。',
    seasonUpcoming: '此购物券的使用期限尚未开始。',
    seasonUnknown: '无法确认此购物券的使用期限，请查看官方信息。',
    compatible: '受理{{medium}} · {{voucher}}',
    incompatible: '不受理所选购物券',
    unknown: '官方数据无法确认是否受理此购物券。',
  },
  'zh-Hant': {
    label: '想使用的購物券',
    summary: '{{medium}} · {{voucher}}',
    notSpecified: '不限',
    medium: '想使用的購物券形式',
    voucher: '想使用的券種',
    paper: '紙本',
    digital: '電子',
    A: 'A券',
    B: 'B券',
    AB: 'A、B券',
    advancedStoreType: '進階條件：店家受理類別',
    advancedStoreTypeHelp: '依店家受理類別進一步篩選，與想使用的券種分別設定。',
    conflict:
      '同時選擇A券和僅限B券的店家時，沒有符合條件的店家。清除店家類別條件後，可以保留A券選項繼續查找。',
    clearAdvanced: '清除店家類別條件',
    persistence:
      '點選「套用」後，篩選條件生效，並將購物券選項儲存在此裝置上。未套用就關閉會放棄變更。',
    persistenceFailed:
      '無法儲存購物券選項，篩選條件尚未變更。請再次點選「套用」。',
    officialBasis: '受理資訊依據官方資料。使用前請確認最新資訊。',
    seasonExpired: '此購物券的使用期限已結束。',
    seasonUpcoming: '此購物券的使用期限尚未開始。',
    seasonUnknown: '無法確認此購物券的使用期限，請查看官方資訊。',
    compatible: '受理{{medium}} · {{voucher}}',
    incompatible: '不受理所選購物券',
    unknown: '官方資料無法確認是否受理此購物券。',
  },
};
