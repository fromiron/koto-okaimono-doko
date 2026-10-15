import type { SupportedLocale } from '@koto/schema';

type DirectionsText = {
  viewMap: string;
  compactNote: string;
  handoffNote: string;
  facilityNote: string;
  unavailable: string;
  openFailed: string;
  copyAddressHint: string;
};

export const directionsResources: Record<SupportedLocale, DirectionsText> = {
  ja: {
    viewMap: '地図で確認',
    compactNote: '{{provider}}に目的地を渡します。',
    handoffNote:
      '目的地の名称・住所または座標を{{provider}}に渡します。地図アプリがなければブラウザで開きます。出発地は移動先で選べます。',
    facilityNote:
      '施設内の店舗や入口までの案内は保証されません。到着後に階・店舗位置をご確認ください。',
    unavailable: '目的地を特定できる住所・位置情報がありません。',
    openFailed:
      '地図を開けませんでした。再試行するか「地図で確認」をお試しください。',
    copyAddressHint: '住所は長押しでコピーできます。',
  },
  en: {
    viewMap: 'View on map',
    compactNote: 'Sends this destination to {{provider}}.',
    handoffNote:
      'The destination name and address or coordinates are sent to {{provider}}. It opens in a browser if the map app is unavailable. Choose your starting point there.',
    facilityNote:
      'Directions may stop at the building, not the shop or entrance. Check the floor and shop location on arrival.',
    unavailable:
      'No address or reliable location is available for this destination.',
    openFailed: 'Could not open the map. Retry or use “View on map.”',
    copyAddressHint: 'Press and hold the address to copy it.',
  },
  ko: {
    viewMap: '지도에서 확인',
    compactNote: '{{provider}}에 목적지를 전달합니다.',
    handoffNote:
      '목적지의 이름·주소 또는 좌표를 {{provider}}에 전달합니다. 지도 앱이 없으면 브라우저에서 열립니다. 출발지는 이동한 지도에서 선택할 수 있습니다.',
    facilityNote:
      '시설 내 점포나 출입구까지의 안내는 보장되지 않습니다. 도착 후 층과 점포 위치를 확인하세요.',
    unavailable: '목적지를 확인할 주소나 신뢰할 수 있는 위치 정보가 없습니다.',
    openFailed:
      '지도를 열지 못했습니다. 다시 시도하거나 ‘지도에서 확인’을 눌러 주세요.',
    copyAddressHint: '주소를 길게 눌러 복사할 수 있습니다.',
  },
  'zh-Hans': {
    viewMap: '在地图上查看',
    compactNote: '将目的地传递给{{provider}}。',
    handoffNote:
      '目的地名称、地址或坐标将传递给{{provider}}。未安装地图应用时会在浏览器中打开。可在外部地图中选择出发地。',
    facilityNote:
      '路线可能只到达建筑物，无法保证到达店铺或入口。抵达后请确认楼层和店铺位置。',
    unavailable: '没有可确定目的地的地址或可靠位置信息。',
    openFailed: '无法打开地图。请重试或选择“在地图上查看”。',
    copyAddressHint: '长按地址即可复制。',
  },
  'zh-Hant': {
    viewMap: '在地圖上查看',
    compactNote: '將目的地傳遞給{{provider}}。',
    handoffNote:
      '目的地名稱、地址或座標將傳遞給{{provider}}。未安裝地圖應用程式時會在瀏覽器中開啟。可在外部地圖中選擇出發地。',
    facilityNote:
      '路線可能只到達建築物，無法保證到達店舖或入口。抵達後請確認樓層和店舖位置。',
    unavailable: '沒有可確定目的地的地址或可靠位置資訊。',
    openFailed: '無法開啟地圖。請重試或選擇「在地圖上查看」。',
    copyAddressHint: '長按地址即可複製。',
  },
};
