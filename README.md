# shizukani-search

X（旧Twitter）のユーザープロフィールページから、同名の[しずかなインターネット](https://sizu.me)アカウントを検索するChrome拡張機能です。

## 機能

Xのユーザープロフィールページに「しずかなインターネットを検索」ボタンを追加します。クリックすると以下の優先順でアカウントを探し、見つかればプロフィールへのリンクを表示します。

1. プロフィールの説明文またはリンクに `sizu.me/xxx` が記載されている場合、そのIDを直接確認
2. XのアカウントID（そのまま）
3. アンダースコアを削除したID（例: `al_ice` → `alice`）
4. アンダースコアをハイフンに置換したID（例: `al_ice` → `al-ice`）

各候補に対して `https://sizu.me/{username}` へのHTTPリクエストを送り、200 OKが返ればアカウントが存在すると判定します。

> **注意**: リクエストはボタンのクリック時のみ発生します。ページを開いただけで自動的にリクエストが飛ぶことはありません。

## 技術スタック

- [Plasmo](https://www.plasmo.com/) — Chrome拡張フレームワーク
- React 18
- TypeScript

## プロジェクト構成

```
shizukani-search/
├── assets/
│   └── icon.png                  # 拡張機能のアイコン
├── src/
│   ├── contents/
│   │   └── profile.tsx           # Xのページに挿入されるコンテンツスクリプト（結果表示UI）
│   ├── lib/
│   │   ├── constants.ts          # sizu.me のベースURL等の定数
│   │   └── searchSizuUser.ts     # アカウント検索ロジック
│   └── services/
│       └── xProfileService.ts    # Xプロフィール情報の抽出・ボタン挿入
├── build/                        # ビルド成果物（gitignore対象）
├── .plasmo/                      # Plasmoの生成ファイル（gitignore対象）
├── package.json
└── tsconfig.json
```

## Getting Started

### 必要な環境

- Node.js 18以上
- npm

### セットアップ

```bash
# 依存パッケージのインストール
npm install
```

### 開発

```bash
# 開発モード（ファイル変更を監視して自動ビルド）
npm run dev
```

### ビルド

```bash
# 本番ビルド
npm run build
```

ビルドが成功すると `build/chrome-mv3-prod/` ディレクトリに成果物が生成されます。

## Chrome拡張として読み込む方法

1. `npm run build` を実行して `build/chrome-mv3-prod/` を生成する
2. Chromeで `chrome://extensions/` を開く
3. 右上の「デベロッパーモード」をオンにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `build/chrome-mv3-prod/` フォルダを選択する

読み込み後、X（`x.com` または `twitter.com`）の任意のユーザープロフィールページを開くと、名前の上に「しずかなインターネットを検索」ボタンが表示されます。

### 再ビルド後の反映

コードを変更して `npm run build` を再実行したあとは、`chrome://extensions/` の拡張機能カードにある更新ボタン（丸矢印アイコン）をクリックすると最新のビルドが反映されます。

## 参考

- [しずかなインターネット](https://sizu.me)
- [Sky Follower Bridge](https://github.com/kawamataryo/sky-follower-bridge)
