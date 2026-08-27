<p align="center">
  <a href="README.md">English</a> ·
  <strong>日本語</strong> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.zh-Hans.md">简体中文</a> ·
  <a href="README.zh-Hant.md">繁體中文</a>
</p>

<p align="center">
  <img src="assets/readme-hero.webp" alt="店舗と地図ピンを描いた水辺の街のイラスト" width="100%" />
</p>

<h1 align="center">こうとうお買い物どこ</h1>

<p align="center">
  <strong>こうとう商店街DEお買い物券＋2026</strong>の<br />
  取扱店を探すための非公式マップアプリ
</p>

<p align="center">
  <a href="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml"><img src="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml/badge.svg" alt="Mobile CI" /></a>
  <a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest"><img src="https://img.shields.io/github/v/release/fromiron/koto-okaimono-doko?label=release" alt="最新リリース" /></a>
</p>

<p align="center">
  <strong><a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest">最新のAndroid版APKを入手 →</a></strong>
</p>

> [!IMPORTANT]
> 本アプリは独立した非公式プロジェクトであり、江東区および各企業とは関係ありません。お買い物券の最新の利用条件や取扱状況は、必ず[公式サイト](https://koto-okaimono-premium.jp/)または各店舗でご確認ください。

## ダウンロード

| プラットフォーム | 提供状況                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Android          | [最新のGitHub Release](https://github.com/fromiron/koto-okaimono-doko/releases/latest)で`arm64-v8a`向けAPKを公開しています。 |
| iOS              | macOSでソースからビルドできます。公開中のiOSバイナリはありません。                                                           |

## できること

- **地図または一覧から探す** — `A・B`券対応店、`B`券のみの店舗、複数店舗が入る施設をピンで見分けられます。
- **取扱店データ全体を検索する** — 表示中の地図範囲に限らず、店舗名、住所、施設名、商店街名から検索できます。
- **条件で絞り込む** — 券種、利用形態（紙・デジタル）、公式カテゴリ、現在地からの直線距離で絞り込めます。
- **店舗の詳細を確認する** — 日本語原文の住所、登録がある場合は電話番号と公式ページ、現在地からのおおよその直線距離、外部地図アプリの経路を表示します。
- **基本の店舗情報をオフラインで使う** — 初期の取扱店データをアプリに同梱しているため、検索と詳細表示に初回ダウンロードは不要です。地図タイルの表示には通信が必要な場合があります。
- **5言語のUIを選ぶ** — 日本語、英語、韓国語、簡体字、繁体字に対応します。店舗名、住所、施設名は公式の日本語表記を保持します。

## データとプライバシー

- 取扱店データは、お買い物券の[公式公開情報](https://koto-okaimono-premium.jp/)から生成します。アプリの設定画面で公式データの日付を確認できますが、最新情報は公式サイトまたは各店舗が基準です。
- 完全な初期データを`seed.sqlite`として同梱します。Dataset Manifest URLが設定されたビルドでは、設定画面から検証済みの`stores.sqlite`更新を確認して適用できます。
- 位置情報の利用は任意で、フォアグラウンドに限られます。座標は現在地表示、周辺検索、距離計算のためにセッションメモリだけで扱い、アップロードも永続保存もしません。保存するのは位置情報利用のオン・オフ設定だけです。
- アプリに表示される距離は、おおよその直線距離です。徒歩経路の距離ではありません。

## 開発

このリポジトリは、Expo Routerアプリと共有パッケージをまとめたpnpmワークスペースです。

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm mobile:start
```

Expo Goは、レイアウト、画面遷移、同梱データのスモークテストに利用できます。AndroidのGoogle Mapsキーはビルド時に適用されるため、地図はネイティブの開発ビルドまたはリリースビルドで検証してください。

### ネイティブマップ

Androidでは、`apps/mobile/.env.example`を`apps/mobile/.env.local`へコピーして`GOOGLE_MAPS_API_KEY`を設定し、次を実行します。

```bash
pnpm --dir apps/mobile exec expo run:android
```

iOSでは、macOSとXcodeを使用します。標準でApple Mapsを使うため、Google Mapsキーは不要です。

```bash
pnpm mobile:ios
```

## データセットの生成

データセットはアプリの外で生成します。公式公開情報を取得し、取扱店レコードを正規化・検証して、モバイルアプリが使うSQLiteデータとマニフェストを書き出します。

```bash
pnpm dataset:build
pnpm dataset:test
```

生成にはネットワーク接続とPopplerが必要です。端末上でPDFを解析することはありません。

## プロジェクト構成

| パス                   | 役割                                         |
| ---------------------- | -------------------------------------------- |
| `apps/mobile`          | Expoアプリ、画面、地図、データセット実行環境 |
| `packages/core`        | カテゴリ、距離、地理処理の共有ヘルパー       |
| `packages/schema`      | 取扱店スキーマ、対応言語、共有型             |
| `packages/dataset-cli` | 公式情報の取り込みとデータセット生成         |
| `data/corrections`     | レビュー済みの手動ジオコード補正             |

製品用語の基準は[`CONTEXT.md`](CONTEXT.md)を参照してください。

## 環境変数

| 変数                               | 使用箇所                   | 用途                                      |
| ---------------------------------- | -------------------------- | ----------------------------------------- |
| `GOOGLE_MAPS_API_KEY`              | モバイルのネイティブビルド | ビルド時に適用するAndroid Google Mapsキー |
| `EXPO_PUBLIC_DATASET_MANIFEST_URL` | モバイルアプリ             | 任意のデータ更新確認に使う公開URL         |
| `DATASET_BASE_URL`                 | データセットCLI            | 生成するマニフェストのアセットURL基準値   |

## 確認とフィードバック

Pull Requestを作成する前に、次を実行してください。

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --dir apps/mobile exec expo install --check
```

GitHub Actionsを変更した場合は、リポジトリの`act`設定でも対象ワークフローを実行してください。不具合やデータ修正は[GitHub Issues](https://github.com/fromiron/koto-okaimono-doko/issues)でお知らせください。
