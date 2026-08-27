<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <strong>简体中文</strong> ·
  <a href="README.zh-Hant.md">繁體中文</a>
</p>

<p align="center">
  <img src="assets/readme-hero.webp" alt="带有店铺和地图图钉的水岸街区插画" width="100%" />
</p>

<h1 align="center">江东购物券地图</h1>

<p align="center">
  用于查找可使用 <strong>こうとう商店街DEお買い物券＋2026</strong><br />
  的店铺的非官方地图应用
</p>

<p align="center">
  <a href="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml"><img src="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml/badge.svg" alt="Mobile CI" /></a>
  <a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest"><img src="https://img.shields.io/github/v/release/fromiron/koto-okaimono-doko?label=release" alt="最新版本" /></a>
</p>

<p align="center">
  <strong><a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest">获取最新 Android APK →</a></strong>
</p>

> [!IMPORTANT]
> 本应用是独立的非官方项目，与东京都江东区或任何企业均无关联。商品券的最新使用条件及店铺适用情况，请务必通过[官方网站](https://koto-okaimono-premium.jp/)或相关店铺确认。

## 下载

| 平台    | 提供情况                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| Android | [最新 GitHub Release](https://github.com/fromiron/koto-okaimono-doko/releases/latest)提供 `arm64-v8a` APK。 |
| iOS     | 可在 macOS 上从源代码构建。目前没有公开发布的 iOS 安装包。                                                  |

## 主要功能

- **通过地图或列表查找** — 地图图钉可区分支持 `A・B券` 的店铺、`仅B券` 店铺，以及包含多家店铺的设施。
- **搜索完整店铺数据** — 不受当前地图可见区域限制，可按店名、地址、设施名或商店街名称搜索。
- **按条件筛选** — 可按券种、使用形式（纸质或电子）、官方分类及当前位置直线距离范围筛选。
- **查看店铺详情** — 显示日文原文地址；如有记录，还可查看电话号码、官方页面、距当前位置的大致直线距离，并在系统地图中打开路线。
- **离线使用核心店铺信息** — 初始店铺数据已内置，搜索和详情页无需首次下载。地图图块仍可能需要网络连接。
- **选择 5 种界面语言** — 支持日语、英语、韩语、简体中文和繁体中文。官方店名、地址和设施名保留日文原文。

## 数据与隐私

- 店铺数据根据商品券的[官方公开信息](https://koto-okaimono-premium.jp/)生成。可在应用设置中查看官方数据日期，但最新信息仍应以官方网站或各店铺为准。
- 完整初始数据以 `seed.sqlite` 内置。配置 Dataset Manifest URL 后，可在设置中检查并应用经过验证的 `stores.sqlite` 更新。
- 位置信息为可选功能，仅在前台使用。坐标只保存在当前会话内存中，用于显示当前位置、附近搜索和距离计算，不会上传或持久化保存。仅保存位置功能的开关设置。
- 应用显示的是大致直线距离，并非步行路线距离。

## 开发

本仓库是由 Expo Router 应用及共享软件包组成的 pnpm 工作区。

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm mobile:start
```

Expo Go 适合进行布局、页面跳转及内置数据的冒烟测试。Android Google Maps 密钥在构建时写入，因此请使用原生开发版本或发布版本验证地图。

### 原生地图

在 Android 上，将 `apps/mobile/.env.example` 复制为 `apps/mobile/.env.local`，设置 `GOOGLE_MAPS_API_KEY`，然后运行：

```bash
pnpm --dir apps/mobile exec expo run:android
```

iOS 需要在安装了 Xcode 的 macOS 上构建。默认使用 Apple Maps，因此无需 Google Maps 密钥。

```bash
pnpm mobile:ios
```

## 数据集生成

数据集在应用外部生成。该流程下载官方公开信息，对店铺记录进行标准化和验证，然后生成移动应用使用的 SQLite 数据及清单。

```bash
pnpm dataset:build
pnpm dataset:test
```

生成过程需要网络连接和 Poppler。设备端不会解析 PDF。

## 项目结构

| 路径                   | 用途                                |
| ---------------------- | ----------------------------------- |
| `apps/mobile`          | Expo 应用、页面、地图和数据集运行时 |
| `packages/core`        | 分类、距离和地理处理共享工具        |
| `packages/schema`      | 店铺架构、支持的语言及共享类型      |
| `packages/dataset-cli` | 官方信息采集与数据集生成            |
| `data/corrections`     | 经审核的手动地理编码修正            |

产品术语以 [`CONTEXT.md`](CONTEXT.md) 为准。

## 环境变量

| 变量                               | 使用位置       | 用途                                  |
| ---------------------------------- | -------------- | ------------------------------------- |
| `GOOGLE_MAPS_API_KEY`              | 移动端原生构建 | 构建时写入的 Android Google Maps 密钥 |
| `EXPO_PUBLIC_DATASET_MANIFEST_URL` | 移动应用       | 用于可选数据更新检查的公开 URL        |
| `DATASET_BASE_URL`                 | 数据集 CLI     | 写入生成清单中资源链接的基础 URL      |

## 检查与反馈

提交 Pull Request 前，请运行：

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --dir apps/mobile exec expo install --check
```

如果修改了 GitHub Actions，还请使用仓库的 `act` 配置运行受影响的工作流。应用问题或数据修正请提交至 [GitHub Issues](https://github.com/fromiron/koto-okaimono-doko/issues)。
