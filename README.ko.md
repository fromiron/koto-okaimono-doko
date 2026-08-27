<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <strong>한국어</strong> ·
  <a href="README.zh-Hans.md">简体中文</a> ·
  <a href="README.zh-Hant.md">繁體中文</a>
</p>

<p align="center">
  <img src="assets/readme-hero.webp" alt="상점과 지도 핀이 있는 수변 마을 일러스트" width="100%" />
</p>

<h1 align="center">고토 오카이모노 도코</h1>

<p align="center">
  <strong>こうとう商店街DEお買い物券＋2026</strong> 가맹점을<br />
  지도에서 찾는 비공식 앱
</p>

<p align="center">
  <a href="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml"><img src="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml/badge.svg" alt="Mobile CI" /></a>
  <a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest"><img src="https://img.shields.io/github/v/release/fromiron/koto-okaimono-doko?label=release" alt="최신 릴리스" /></a>
</p>

<p align="center">
  <strong><a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest">최신 Android APK 받기 →</a></strong>
</p>

> [!IMPORTANT]
> 이 앱은 독립적인 비공식 프로젝트이며 고토구 또는 어떤 기업과도 관련이 없습니다. 상품권의 최신 이용 조건과 가맹 여부는 반드시 [공식 웹사이트](https://koto-okaimono-premium.jp/) 또는 해당 매장에서 확인하세요.

## 다운로드

| 플랫폼  | 제공 상태                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------- |
| Android | [최신 GitHub Release](https://github.com/fromiron/koto-okaimono-doko/releases/latest)에서 `arm64-v8a` APK를 제공합니다. |
| iOS     | macOS에서 소스로 빌드할 수 있습니다. 공개된 iOS 바이너리는 없습니다.                                                    |

## 할 수 있는 일

- **지도나 목록에서 찾기** — `A・B`권 가맹점, `B`권 전용 매장, 여러 매장이 있는 시설을 핀으로 구분합니다.
- **전체 가맹점 데이터 검색** — 현재 보이는 지도 범위에 한정하지 않고 매장명, 주소, 시설명, 상점가명으로 검색합니다.
- **조건에 맞는 매장만 보기** — 상품권 종류, 사용 형태(종이 또는 디지털), 공식 카테고리, 현재 위치 기준 직선거리 반경으로 필터링합니다.
- **매장 상세 정보 확인** — 일본어 원문 주소, 등록된 경우 전화번호와 공식 페이지, 현재 위치에서의 대략적인 직선거리, 외부 지도 앱의 길찾기를 제공합니다.
- **핵심 매장 정보를 오프라인에서 사용** — 초기 가맹점 데이터를 앱에 내장하므로 검색과 상세 보기에 최초 다운로드가 필요하지 않습니다. 지도 타일은 네트워크 연결이 필요할 수 있습니다.
- **5개 언어 UI 선택** — 일본어, 영어, 한국어, 중국어 간체와 번체를 지원합니다. 공식 매장명, 주소, 시설명은 일본어 원문으로 표시합니다.

## 데이터와 개인정보

- 가맹점 데이터는 상품권 [공식 공개 정보](https://koto-okaimono-premium.jp/)를 바탕으로 생성합니다. 앱 설정에서 공식 데이터 날짜를 확인할 수 있지만, 최신 정보의 기준은 공식 웹사이트와 각 매장입니다.
- 전체 초기 데이터를 `seed.sqlite`로 내장합니다. Dataset Manifest URL이 설정된 빌드에서는 설정 화면에서 검증된 `stores.sqlite` 업데이트를 확인하고 적용할 수 있습니다.
- 위치 사용은 선택 사항이며 포그라운드에서만 작동합니다. 좌표는 현재 위치 표시, 주변 검색, 거리 계산을 위해 세션 메모리에만 두며 업로드하거나 영구 저장하지 않습니다. 위치 사용 여부 설정만 저장합니다.
- 앱에 표시되는 거리는 대략적인 직선거리이며 도보 경로 거리가 아닙니다.

## 개발

이 저장소는 Expo Router 앱과 공용 패키지로 구성된 pnpm 워크스페이스입니다.

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm mobile:start
```

Expo Go는 레이아웃, 화면 이동, 내장 데이터 스모크 테스트에 사용할 수 있습니다. Android Google Maps 키는 빌드 시점에 적용되므로 지도는 네이티브 개발 빌드나 릴리스 빌드에서 검증하세요.

### 네이티브 지도

Android에서는 `apps/mobile/.env.example`을 `apps/mobile/.env.local`로 복사하고 `GOOGLE_MAPS_API_KEY`를 설정한 다음 실행합니다.

```bash
pnpm --dir apps/mobile exec expo run:android
```

iOS는 macOS와 Xcode에서 빌드합니다. 기본으로 Apple Maps를 사용하므로 Google Maps 키는 필요하지 않습니다.

```bash
pnpm mobile:ios
```

## 데이터셋 생성

데이터셋은 앱 외부에서 생성합니다. 공식 공개 정보를 내려받고 가맹점 레코드를 정규화·검증한 뒤 모바일 앱이 사용하는 SQLite 데이터와 매니페스트를 만듭니다.

```bash
pnpm dataset:build
pnpm dataset:test
```

생성에는 네트워크 연결과 Poppler가 필요합니다. 기기에서는 PDF를 파싱하지 않습니다.

## 프로젝트 구조

| 경로                   | 역할                                         |
| ---------------------- | -------------------------------------------- |
| `apps/mobile`          | Expo 앱, 화면, 지도, 데이터셋 런타임         |
| `packages/core`        | 카테고리, 거리, 지리 처리를 위한 공용 도우미 |
| `packages/schema`      | 가맹점 스키마, 지원 언어, 공용 타입          |
| `packages/dataset-cli` | 공식 정보 수집과 데이터셋 생성               |
| `data/corrections`     | 검토를 거친 수동 지오코딩 보정               |

제품 용어 기준은 [`CONTEXT.md`](CONTEXT.md)를 참고하세요.

## 환경 변수

| 변수                               | 사용 위치            | 용도                                            |
| ---------------------------------- | -------------------- | ----------------------------------------------- |
| `GOOGLE_MAPS_API_KEY`              | 모바일 네이티브 빌드 | 빌드 시 적용되는 Android Google Maps 키         |
| `EXPO_PUBLIC_DATASET_MANIFEST_URL` | 모바일 앱            | 선택적 데이터 업데이트 확인에 사용하는 공개 URL |
| `DATASET_BASE_URL`                 | 데이터셋 CLI         | 생성된 매니페스트 자산 링크의 기준 URL          |

## 검증과 피드백

Pull Request를 열기 전에 다음 명령을 실행하세요.

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --dir apps/mobile exec expo install --check
```

GitHub Actions를 변경했다면 저장소의 `act` 설정으로 해당 워크플로도 실행하세요. 앱 오류나 데이터 수정 사항은 [GitHub Issues](https://github.com/fromiron/koto-okaimono-doko/issues)에 남겨 주세요.
