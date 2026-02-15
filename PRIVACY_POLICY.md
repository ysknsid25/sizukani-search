# Privacy Policy / プライバシーポリシー

**Last updated: 2026-02-15**

## English

### Overview

Shizukani Search ("the Extension") is a Chrome extension that searches for [Shizukana Internet](https://sizu.me) accounts corresponding to X (formerly Twitter) user profiles.

### Data Collected

The Extension does **not** collect, store, transmit, or share any personal data.

### How It Works

When you click the "しずかなインターネットを検索" button on an X profile page, the Extension:

1. Reads the following information from the current X profile page displayed in your browser:
   - Display name
   - Account handle (@username)
   - Profile bio text and link URL
2. Generates candidate usernames from the above information.
3. Sends HTTP requests to `https://sizu.me/{candidate}` solely to check whether a corresponding account exists (200 OK / not found).

All processing happens locally in your browser. No data is sent to any server other than `sizu.me` for existence checks, and no data is retained after the check completes.

### Permissions

| Permission | Reason |
|---|---|
| `https://x.com/*` `https://twitter.com/*` | Read profile information from X pages |
| `https://sizu.me/*` | Check whether a sizu.me account exists |

### Contact

For questions about this privacy policy, please open an issue on the GitHub repository.

---

## 日本語

### 概要

Shizukani Search（以下「本拡張機能」）は、X（旧Twitter）のユーザープロフィールに対応する[しずかなインターネット](https://sizu.me)アカウントを検索するChrome拡張機能です。

### 収集するデータ

本拡張機能は、個人データの収集・保存・送信・共有を**一切行いません**。

### 動作の仕組み

Xのプロフィールページで「しずかなインターネットを検索」ボタンをクリックした際、本拡張機能は以下の処理を行います：

1. ブラウザに表示されているXプロフィールページから以下の情報を読み取ります：
   - 表示名
   - アカウントハンドル（@ユーザー名）
   - プロフィールの説明文およびリンクURL
2. 上記の情報からしずかなインターネットの候補ユーザー名を生成します。
3. `https://sizu.me/{候補ユーザー名}` へHTTPリクエストを送り、対応するアカウントが存在するか（200 OK / 未存在）のみを確認します。

すべての処理はお使いのブラウザ内で完結します。存在確認のために `sizu.me` へリクエストを送る以外に、外部サーバーへのデータ送信は行いません。また、確認完了後にデータが保持されることはありません。

### パーミッション

| パーミッション | 理由 |
|---|---|
| `https://x.com/*` `https://twitter.com/*` | Xのプロフィールページから情報を読み取るため |
| `https://sizu.me/*` | しずかなインターネットのアカウント存在確認を行うため |

### お問い合わせ

本プライバシーポリシーに関するご質問は、GitHubリポジトリのIssueよりお問い合わせください。
