import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { clientInfo } = await req.json();

  if (!clientInfo?.industry) {
    return NextResponse.json({ error: "業種を入力してください" }, { status: 400 });
  }

  const prompt = `あなたはSNSマーケティングの専門家です。以下のクライアント情報をもとに、SNS運用プランを作成してください。

クライアント情報:
- 業種: ${clientInfo.industry}
- ターゲット層: ${clientInfo.target || "指定なし"}
- アカウント名: ${clientInfo.accountName || "指定なし"}
- 目標: ${clientInfo.goal || "フォロワー増加・集客"}
- 現在のフォロワー数: ${clientInfo.followers || "不明"}
- 投稿頻度の希望: ${clientInfo.frequency || "週3〜4回"}
- エリア: ${clientInfo.area || ""}
- 特徴・強み: ${clientInfo.strengths || ""}

以下のJSON形式のみで返してください（説明文・マークダウン不要）:
{
  "schedule": {
    "recommended_days": ["月曜", "水曜", "金曜"],
    "recommended_time": "19:00〜21:00",
    "frequency": "週3回",
    "reason": "スケジュール推奨理由（1〜2文）"
  },
  "keywords": [
    { "keyword": "#キーワード", "type": "集客", "reason": "理由" },
    { "keyword": "#キーワード", "type": "ブランディング", "reason": "理由" },
    { "keyword": "#キーワード", "type": "集客", "reason": "理由" },
    { "keyword": "#キーワード", "type": "トレンド", "reason": "理由" },
    { "keyword": "#キーワード", "type": "集客", "reason": "理由" }
  ],
  "posts": [
    {
      "day": 1,
      "weekday": "月",
      "category": "カテゴリ名",
      "theme": "投稿テーマ（20文字以内）",
      "caption": "投稿本文（200〜350文字、改行あり、絵文字2〜3個）",
      "hashtags": ["#タグ1", "#タグ2", "#タグ3", "#タグ4", "#タグ5"],
      "tip": "この投稿のポイント（30文字以内）"
    }
  ]
}

postsは30件作成。カテゴリの配分:
- 商品・サービス紹介: 8件
- お客様の声・事例: 5件
- スタッフ・裏側紹介: 4件
- 季節・トレンドネタ: 5件
- お役立ち情報・豆知識: 5件
- キャンペーン・お得情報: 3件`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 10000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "データの解析に失敗しました" }, { status: 500 });
    }

    const plan = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "API エラーが発生しました" }, { status: 500 });
  }
}
