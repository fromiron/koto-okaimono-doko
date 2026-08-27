<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.zh-Hans.md">简体中文</a> ·
  <strong>繁體中文</strong>
</p>

<p align="center">
  <img src="assets/readme-hero.webp" alt="有店舖與地圖圖釘的水岸街區插畫" width="100%" />
</p>

<h1 align="center">江東購物券地圖</h1>

<p align="center">
  用來尋找可使用 <strong>こうとう商店街DEお買い物券＋2026</strong><br />
  之店舖的非官方地圖應用程式
</p>

<p align="center">
  <a href="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml"><img src="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml/badge.svg" alt="Mobile CI" /></a>
  <a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest"><img src="https://img.shields.io/github/v/release/fromiron/koto-okaimono-doko?label=release" alt="最新版本" /></a>
</p>

<p align="center">
  <strong><a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest">取得最新 Android APK →</a></strong>
</p>

> [!IMPORTANT]
> 本應用程式是獨立的非官方專案，與東京都江東區或任何企業均無關聯。商品券的最新使用條件及店舖適用情況，請務必向[官方網站](https://koto-okaimono-premium.jp/)或相關店舖確認。

## 下載

| 平台    | 提供情況                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| Android | [最新 GitHub Release](https://github.com/fromiron/koto-okaimono-doko/releases/latest)提供 `arm64-v8a` APK。 |
| iOS     | 可在 macOS 上從原始碼建置。目前沒有公開發布的 iOS 安裝檔。                                                  |

## 主要功能

- **透過地圖或列表尋找** — 地圖圖釘可區分支援 `A・B券` 的店舖、`僅B券` 店舖，以及包含多間店舖的設施。
- **搜尋完整店舖資料** — 不受目前地圖可見範圍限制，可依店名、地址、設施名或商店街名稱搜尋。
- **依條件篩選** — 可依券種、使用形式（紙本或數位）、官方分類及目前位置直線距離範圍篩選。
- **查看店舖詳情** — 顯示日文原文地址；如有資料，亦可查看電話號碼、官方頁面、距目前位置的大致直線距離，並在系統地圖中開啟路線。
- **離線使用核心店舖資訊** — 初始店舖資料已內建，搜尋和詳情頁面無需首次下載。地圖圖磚仍可能需要網路連線。
- **選擇 5 種介面語言** — 支援日語、英語、韓語、簡體中文及繁體中文。官方店名、地址和設施名保留日文原文。

## 資料與隱私

- 店舖資料根據商品券的[官方公開資訊](https://koto-okaimono-premium.jp/)生成。可在應用程式設定中查看官方資料日期，但最新資訊仍應以官方網站或各店舖為準。
- 完整初始資料以 `seed.sqlite` 內建。設定 Dataset Manifest URL 後，可在設定中檢查並套用經過驗證的 `stores.sqlite` 更新。
- 位置資訊為選用功能，且僅在前景使用。座標只保存在目前工作階段的記憶體中，用於顯示目前位置、附近搜尋及距離計算，不會上傳或永久儲存。只會保存位置功能的開關設定。
- 應用程式顯示的是大致直線距離，並非步行路線距離。

## 開發

本儲存庫是由 Expo Router 應用程式與共用套件組成的 pnpm 工作區。

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm mobile:start
```

Expo Go 適合用於版面、頁面導覽及內建資料的冒煙測試。Android Google Maps 金鑰會在建置時寫入，因此請使用原生開發版本或發布版本驗證地圖。

### 原生地圖

在 Android 上，將 `apps/mobile/.env.example` 複製為 `apps/mobile/.env.local`，設定 `GOOGLE_MAPS_API_KEY`，然後執行：

```bash
pnpm --dir apps/mobile exec expo run:android
```

iOS 需要在安裝 Xcode 的 macOS 上建置。預設使用 Apple Maps，因此不需要 Google Maps 金鑰。

```bash
pnpm mobile:ios
```

## 資料集生成

資料集在應用程式外部生成。此流程下載官方公開資訊，將店舖記錄正規化並驗證，再產生行動應用程式使用的 SQLite 資料及清單。

```bash
pnpm dataset:build
pnpm dataset:test
```

生成過程需要網路連線與 Poppler。裝置端不會解析 PDF。

## 專案結構

| 路徑                   | 用途                                      |
| ---------------------- | ----------------------------------------- |
| `apps/mobile`          | Expo 應用程式、頁面、地圖及資料集執行環境 |
| `packages/core`        | 分類、距離及地理處理共用工具              |
| `packages/schema`      | 店舖結構、支援的語言及共用型別            |
| `packages/dataset-cli` | 官方資訊擷取與資料集生成                  |
| `data/corrections`     | 經審核的手動地理編碼修正                  |

產品術語以 [`CONTEXT.md`](CONTEXT.md) 為準。

## 環境變數

| 變數                               | 使用位置       | 用途                                  |
| ---------------------------------- | -------------- | ------------------------------------- |
| `GOOGLE_MAPS_API_KEY`              | 行動端原生建置 | 建置時寫入的 Android Google Maps 金鑰 |
| `EXPO_PUBLIC_DATASET_MANIFEST_URL` | 行動應用程式   | 用於選用資料更新檢查的公開 URL        |
| `DATASET_BASE_URL`                 | 資料集 CLI     | 寫入生成清單中資源連結的基礎 URL      |

## 檢查與意見回饋

提交 Pull Request 前，請執行：

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --dir apps/mobile exec expo install --check
```

若修改了 GitHub Actions，也請使用儲存庫的 `act` 設定執行受影響的工作流程。應用程式問題或資料修正請提交至 [GitHub Issues](https://github.com/fromiron/koto-okaimono-doko/issues)。
