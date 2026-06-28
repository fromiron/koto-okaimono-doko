export type CategoryDefinition = {
  id: string;
  labelJa: string;
  translationKey: string;
  minors: Array<{
    id: string;
    labelJa: string;
    translationKey: string;
  }>;
};

const slugByLabel = new Map<string, string>([
  ['食べる・飲む', 'eat_drink'],
  ['和食', 'japanese_food'],
  ['洋食', 'western_food'],
  ['中華', 'chinese_food'],
  ['寿司', 'sushi'],
  ['焼肉', 'yakiniku'],
  ['定食', 'set_meal'],
  ['カレー', 'curry'],
  ['そば・うどん', 'soba_udon'],
  ['ラーメン', 'ramen'],
  ['お好み焼き・もんじゃ', 'okonomiyaki_monja'],
  ['喫茶・カフェ・甘味', 'cafe_sweets'],
  ['居酒屋・バー', 'izakaya_bar'],
  ['買う', 'shopping'],
  ['青果（野菜・果物）', 'produce'],
  ['鮮魚', 'seafood'],
  ['精肉', 'meat'],
  ['菓子・パン', 'sweets_bread'],
  ['和菓子・煎餅', 'japanese_sweets'],
  ['米', 'rice'],
  ['酒', 'alcohol'],
  ['茶', 'tea'],
  ['調味料・乾物', 'seasoning_dry_goods'],
  ['弁当・惣菜・佃煮', 'bento_deli'],
  ['その他食料品', 'other_food'],
  ['衣服', 'clothing'],
  ['靴', 'shoes'],
  ['皮革', 'leather'],
  ['日用品', 'daily_goods'],
  ['雑貨', 'general_goods'],
  ['寝具', 'bedding'],
  ['化粧品・医薬品・ドラッグストア', 'cosmetics_pharmacy'],
  ['貴金属', 'jewelry'],
  ['時計', 'watches'],
  ['メガネ・コンタクト', 'glasses_contacts'],
  ['書籍', 'books'],
  ['新聞', 'newspapers'],
  ['文具', 'stationery'],
  ['印鑑', 'seals'],
  ['スポーツ用品', 'sporting_goods'],
  ['玩具', 'toys'],
  ['楽器', 'musical_instruments'],
  ['家具', 'furniture'],
  ['電気機器', 'electronics'],
  ['生花', 'flowers'],
  ['ペットショップ', 'pet_shop'],
  ['自転車', 'bicycles'],
  ['オートバイ', 'motorcycles'],
  ['輸送機器', 'transport_equipment'],
  ['スーパー・コンビニエンスストア', 'supermarket_convenience'],
  ['暮らし・住まい', 'life_home'],
  ['理容室・美容室', 'barber_beauty'],
  ['エステ・マッサージ', 'esthetic_massage'],
  ['クリーニング', 'cleaning'],
  ['浴場', 'bathhouse'],
  ['畳・リフォーム', 'tatami_renovation'],
  ['写真', 'photography'],
  ['ガソリンスタンド・自動車整備', 'gas_auto'],
  ['福祉・医療', 'welfare_medical'],
  ['レジャー・娯楽・その他', 'leisure_other'],
  ['その他', 'other'],
]);

export const categories: CategoryDefinition[] = [
  {
    id: 'eat_drink',
    labelJa: '食べる・飲む',
    translationKey: 'categories.major.eat_drink',
    minors: [
      '和食',
      '洋食',
      '中華',
      '寿司',
      '焼肉',
      '定食',
      'カレー',
      'そば・うどん',
      'ラーメン',
      'お好み焼き・もんじゃ',
      '喫茶・カフェ・甘味',
      '居酒屋・バー',
      'その他',
    ].map((label) => categoryMinor(label)),
  },
  {
    id: 'shopping',
    labelJa: '買う',
    translationKey: 'categories.major.shopping',
    minors: [
      '青果（野菜・果物）',
      '鮮魚',
      '精肉',
      '菓子・パン',
      '和菓子・煎餅',
      '米',
      '酒',
      '茶',
      '調味料・乾物',
      '弁当・惣菜・佃煮',
      'その他食料品',
      '衣服',
      '靴',
      '皮革',
      '日用品',
      '雑貨',
      '寝具',
      '化粧品・医薬品・ドラッグストア',
      '貴金属',
      '時計',
      'メガネ・コンタクト',
      '書籍',
      '新聞',
      '文具',
      '印鑑',
      'スポーツ用品',
      '玩具',
      '楽器',
      '家具',
      '電気機器',
      '生花',
      'ペットショップ',
      '自転車',
      'オートバイ',
      '輸送機器',
      'スーパー・コンビニエンスストア',
      'その他',
    ].map((label) => categoryMinor(label)),
  },
  {
    id: 'life_home',
    labelJa: '暮らし・住まい',
    translationKey: 'categories.major.life_home',
    minors: [
      '理容室・美容室',
      'エステ・マッサージ',
      'クリーニング',
      '浴場',
      '畳・リフォーム',
      '写真',
      'ガソリンスタンド・自動車整備',
      '福祉・医療',
      'レジャー・娯楽・その他',
    ].map((label) => categoryMinor(label)),
  },
];

export function parseOfficialCategory(rawCategory: string): {
  majorId: string;
  majorLabel: string;
  minorId: string | null;
  minorLabel: string | null;
} {
  const match = rawCategory.match(/^《(.+?)》(.+)?$/);
  const majorLabel = match?.[1]?.trim() || rawCategory.trim();
  const minorLabel = match?.[2]?.trim() || null;
  const major = categories.find((category) => category.labelJa === majorLabel);
  const minor = major?.minors.find((entry) => entry.labelJa === minorLabel);

  return {
    majorId: major?.id ?? stableCategoryId(majorLabel),
    majorLabel,
    minorId: minorLabel ? (minor?.id ?? stableCategoryId(minorLabel)) : null,
    minorLabel,
  };
}

export function categoryTranslationKey(kind: 'major' | 'minor', id: string): string {
  return `categories.${kind}.${id}`;
}

function categoryMinor(labelJa: string) {
  const id = stableCategoryId(labelJa);
  return {
    id,
    labelJa,
    translationKey: categoryTranslationKey('minor', id),
  };
}

function stableCategoryId(label: string): string {
  return slugByLabel.get(label) ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}
