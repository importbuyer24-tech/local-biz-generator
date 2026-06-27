# CLAUDE.md

このファイルはClaude Codeがこのリポジトリで作業する際に自動で読み込む設定ファイル。

## プロジェクト概要

**ローカルビズジェネレーター**
Googleマップ情報または手動入力から、ローカルビジネス向けのプロ品質Webサイトを自動生成するツール。
じゅりさんのWeb制作営業ツールとして使用。生成したサイトをデモとしてクライアントに見せて営業する。

## 開発コマンド

```bash
npm run dev    # 開発サーバー起動（localhost:3000）
npm run build  # 本番ビルド
npm run start  # 本番サーバー起動
```

## アーキテクチャ

**Next.js 14 App Router（TypeScript）+ Claude API**

```
app/
  page.tsx                    # メインUI（サイト生成フォーム）
  sns-planner/
    page.tsx                  # SNS運用プランナー（じゅりさん自身の仕事用）
  api/
    generate/route.ts         # サイト生成API（2ステップ：情報抽出→HTML生成）
    generate-sns/route.ts     # サイト生成後のSNS30日分生成API
    sns-plan/route.ts         # SNS運用プランナー用API
```

## 重要な設計ルール

### Claude モデル
- **必ず `claude-sonnet-4-6` を使う**（他モデルに変えない）
- サイト生成: `max_tokens: 16000`（HTMLが長いため）
- SNS生成: `max_tokens: 8000〜10000`

### 業種テーマ（`app/api/generate/route.ts`）
- `THEME_KEYWORDS` にキーワード→スコアで業種判定
- `THEMES` に各業種のデザイン定義
- 新しい業種を追加するときは両方に追加する
- テーマキー: `beauty / construction / wellness / yakiniku / food / renovation / cleaning / dental / fitness / education / realestate / photo / sweets / default`

### 生成HTMLのルール
- Google Fonts: Noto Serif JP + Noto Sans JP を @import
- ビジュアルエフェクト: Vanilla Tilt.js / Lenis / AOS.js / Particles.js（CDN）
- スクロール: Lenis使用のため CSS scroll-snap は**絶対に使わない**
- カスタムカーソル: cursor-dot（8px）+ cursor-ring（32px lerp）
- `lang="ja"` 必須、絵文字禁止（◆ ● ▶ ★ を使う）

### UIルール（`app/page.tsx`）
- ダーク/ライトモード両対応（`theme` オブジェクトで管理）
- 結果タブ: 生成サイト / 営業文面 / SNS30日分
- 生成履歴: localStorage に最大3件保存
- 入力モード: Googleマップ貼り付け / 手動入力

## コーディングルール

- **言語**: TypeScript（型は必ずつける）
- **スタイル**: Tailwind CSS のみ
- **コメント**: 基本不要
- 新しいAPIは `app/api/[名前]/route.ts` に追加
- 新しいページは `app/[名前]/page.tsx` に追加

## デプロイ

- Vercel: `local-biz-generator-swart.vercel.app`
- GitHubリポジトリ: `importbuyer24-tech/local-biz-generator`
- mainブランチにpushすると自動デプロイ
- 環境変数: `ANTHROPIC_API_KEY`（Vercelダッシュボードに設定済み）

## 営業フロー（コンテキスト）

1. Googleマップでサイトのない店を探す
2. このツールでデモサイト生成（30秒）
3. 「営業文面」タブのメール文/DM文をコピーして送る
4. 反応があればカスタマイズして納品
5. 月額保守契約につなげる
