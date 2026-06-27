import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { bizInfo } = await req.json();

  if (!bizInfo?.businessName) {
    return NextResponse.json({ error: "店舗情報がありません" }, { status: 400 });
  }

  const prompt = `あなたはSNSマーケターです。以下の店舗情報をもとに、Instagramに投稿できる30日分の投稿ネタを作成してください。

店舗情報:
- 店名: ${bizInfo.businessName}
- 業種: ${bizInfo.industry || ""}
- エリア: ${bizInfo.area || ""}
- サービス: ${bizInfo.services || ""}
- 価格帯: ${bizInfo.priceRange || ""}
- 営業時間: ${bizInfo.hours || ""}

以下のカテゴリをバランスよく使ってください（各カテゴリ4〜5回）:
- お店紹介・スタッフ紹介
- サービス・メニュー紹介
- お客様の声・事例
- 季節・トレンドネタ
- お得情報・キャンペーン
- 豆知識・役立ち情報

必ず以下のJSON形式のみで返してください（説明文不要、マークダウン不要）:
[
  {
    "day": 1,
    "category": "カテゴリ名",
    "caption": "投稿本文（200〜350文字、改行あり、絵文字を2〜3個使用）",
    "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2", "#ハッシュタグ3", "#ハッシュタグ4", "#ハッシュタグ5"]
  },
  ...30件
]`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "データの解析に失敗しました" }, { status: 500 });
    }

    const posts = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "API エラーが発生しました" }, { status: 500 });
  }
}
