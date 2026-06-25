import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

function getIndustryTheme(industry: string): string {
  const i = industry;

  if (i.includes("美容") || i.includes("サロン") || i.includes("ネイル") || i.includes("エステ") || i.includes("hair") || i.includes("Hair")) {
    return `
STYLE: Editorial luxury beauty
COLORS: --bg:#0a0a0a; --bg2:#111; --accent:#c9956c; --accent2:#e8c9a0; --text:#f5f0eb; --muted:#8a7d74
TYPOGRAPHY: Heading font-weight:200, letter-spacing:0.25em (ultra-light elegant). Body: serif feel, generous line-height:1.9
LAYOUT: Asymmetric grid. Wide whitespace. Thin 1px borders. No bold boxes.
DECORATIVE: Single thin horizontal rule lines. Small ◆ diamond separators. Vertical text labels on side.
MOOD: Vogue magazine editorial. Quiet luxury. Less is more.`;
  }

  if (i.includes("電気") || i.includes("工事") || i.includes("設備") || i.includes("建設")) {
    return `
STYLE: Industrial precision
COLORS: --bg:#0d1b2a; --bg2:#0f2236; --accent:#ff6b2b; --accent2:#ffa559; --text:#e8edf2; --muted:#7a8fa6
TYPOGRAPHY: Heading font-weight:900, letter-spacing:0.05em. Body: sans-serif, tight and efficient.
LAYOUT: Grid-based. Sharp edges. Bold section dividers.
DECORATIVE: Diagonal cut sections. Grid dot patterns. Angular accent shapes.
MOOD: Strong, reliable, technical authority.`;
  }

  if (i.includes("整体") || i.includes("整骨") || i.includes("マッサージ") || i.includes("鍼")) {
    return `
STYLE: Organic wellness sanctuary
COLORS: --bg:#0f1a0f; --bg2:#162316; --accent:#8fbc8f; --accent2:#b8d4b8; --text:#f0f4f0; --muted:#7a9e7a
TYPOGRAPHY: Heading font-weight:300, letter-spacing:0.15em. Body: loose, breathable.
LAYOUT: Flowing sections with soft curves. Generous padding.
DECORATIVE: Soft circle motifs. Organic curved lines. Nature-inspired subtle patterns.
MOOD: Calm, restorative, trustworthy healing.`;
  }

  if (i.includes("焼肉") || i.includes("韓国") || i.includes("焼き")) {
    return `
STYLE: Bold dining destination
COLORS: --bg:#111; --bg2:#1a0a0a; --accent:#e63946; --accent2:#ff6b35; --text:#f5f0eb; --muted:#a89f96
TYPOGRAPHY: Heading font-weight:900, mix of serif for name + sans for body. Letter-spacing:0.1em.
LAYOUT: High contrast. Strong hero. Card grids with accent borders.
DECORATIVE: Diagonal slash shapes. Warm radial glows. Sharp geometric cuts.
MOOD: Appetite-driven, premium casual, energetic.`;
  }

  if (i.includes("飲食") || i.includes("レストラン") || i.includes("カフェ") || i.includes("料理") || i.includes("食")) {
    return `
STYLE: Artisan dining warmth
COLORS: --bg:#1c0f0a; --bg2:#251510; --accent:#d4832a; --accent2:#e8a84a; --text:#f5ede4; --muted:#a08878
TYPOGRAPHY: Heading: serif, font-weight:700. Body: warm and readable.
LAYOUT: Warm layered sections. Rounded cards. Soft shadows.
DECORATIVE: Warm glows. Circular photo frames. Subtle grain texture via CSS.
MOOD: Welcoming, artisanal quality, neighborhood gem.`;
  }

  if (i.includes("リフォーム") || i.includes("内装") || i.includes("インテリア") || i.includes("住宅")) {
    return `
STYLE: Architectural premium
COLORS: --bg:#111; --bg2:#161616; --accent:#c8a96e; --accent2:#e0c88a; --text:#f0ede8; --muted:#8a8278
TYPOGRAPHY: Heading font-weight:300, wide letter-spacing:0.2em. Clean and architectural.
LAYOUT: Grid-heavy. Precise alignment. Generous whitespace.
DECORATIVE: Thin gold lines. Corner accent brackets. Minimal geometric shapes.
MOOD: Sophisticated craftsmanship, premium residential.`;
  }

  if (i.includes("清掃") || i.includes("クリーニング") || i.includes("ハウス")) {
    return `
STYLE: Clean tech professional
COLORS: --bg:#0a1628; --bg2:#0d1e35; --accent:#00bcd4; --accent2:#4dd0e1; --text:#e8f4f8; --muted:#6a9ab0
TYPOGRAPHY: Heading font-weight:700, sans-serif precision. Body: clear and direct.
LAYOUT: Clean structure. Bold stats. Trust-building layout.
DECORATIVE: Clean horizontal lines. Dot grid accents. Sharp corners.
MOOD: Efficient, trustworthy, spotless professionalism.`;
  }

  return `
STYLE: Modern professional
COLORS: --bg:#111; --bg2:#1a1a1a; --accent:#2563eb; --accent2:#60a5fa; --text:#f5f5f5; --muted:#94a3b8
TYPOGRAPHY: Heading font-weight:700. Body: clean sans-serif.
LAYOUT: Balanced grid. Clear hierarchy.
DECORATIVE: Subtle geometric shapes. Clean lines.
MOOD: Trustworthy, modern, professional.`;
}

export async function POST(req: NextRequest) {
  const { rawText, instagram, lineUrl, googleCalUrl, reservationTypes } = await req.json();

  if (!rawText || rawText.trim().length < 10) {
    return NextResponse.json({ error: "Googleマップの情報を貼り付けてください" }, { status: 400 });
  }

  // Step 1: Extract structured info from raw Google Maps paste
  const extractionResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: `以下のGoogleマップからコピーしたテキストから情報を抽出してJSON形式で返してください。

テキスト:
${rawText}

以下のJSON形式のみで返してください（説明不要）:
{
  "businessName": "店名",
  "industry": "業種（例：韓国料理店、美容室、電気工事など）",
  "area": "住所・エリア",
  "hours": "営業時間",
  "priceRange": "価格帯",
  "phone": "電話番号",
  "services": "サービス・特徴（イートイン、テイクアウト等）",
  "menu": "メニュー情報（あれば）",
  "rating": "評価（例：4.5）",
  "reviewCount": "レビュー数",
  "reviews": "クチコミテキスト（あれば）"
}`
    }]
  });

  const extractionText = extractionResponse.content[0];
  if (extractionText.type !== "text") {
    return NextResponse.json({ error: "情報の抽出に失敗しました" }, { status: 500 });
  }

  let bizInfo: Record<string, string>;
  try {
    const jsonMatch = extractionText.text.match(/\{[\s\S]*\}/);
    bizInfo = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return NextResponse.json({ error: "情報の解析に失敗しました" }, { status: 500 });
  }

  const industryTheme = getIndustryTheme(bizInfo.industry || "");

  // Step 2: Generate the website
  const sitePrompt = `Create a premium single-page Japanese business website. ONE HTML file, target 420 lines max.

BUSINESS DATA:
- Name: ${bizInfo.businessName || "Business"}
- Type: ${bizInfo.industry || "Restaurant"}
- Area: ${bizInfo.area || "Japan"}
- Hours: ${bizInfo.hours || ""}
- Price: ${bizInfo.priceRange || ""}
- Phone: ${bizInfo.phone || ""}
- Services: ${bizInfo.services || ""}
- Menu: ${bizInfo.menu || ""}
- Rating: ${bizInfo.rating || ""}（${bizInfo.reviewCount || ""}件）
- Reviews: ${bizInfo.reviews || ""}

DESIGN SYSTEM TO APPLY:
${industryTheme}

TYPOGRAPHY RULES:
- Section labels: 0.72rem, letter-spacing:0.35em, uppercase, accent color
- Section titles: clamp(1.8rem,4vw,2.6rem), follow theme weight
- Body: 0.92rem, line-height:1.85, muted color
- Use system fonts: 'Hiragino Mincho ProN','Yu Mincho',serif for headings when luxury style; sans-serif for industrial/clean styles

LAYOUT RULES:
- 8px base grid. Section padding: 80px 5%
- Max content width: 1100px centered
- Cards: consistent border-radius (0px for editorial, 8px for warm, 4px for industrial)
- Hover effects: translateY(-4px) + border-color change

STRICT:
- NO emojis. Use ◆ ● ▶ ★ for icons/bullets
- CSS variables from theme colors
- IntersectionObserver fade-up animations
- Mobile responsive (hamburger menu)
- All text Japanese

SOCIAL & RESERVATION:
- Instagram URL: ${instagram || "none"}
- Reservation types enabled: ${(reservationTypes || ["phone"]).join(", ")}
- LINE URL: ${lineUrl || "none"}
- Google Calendar URL: ${googleCalUrl || "none"}

SECTIONS:
1. Fixed navbar (name + 4 links + hamburger${instagram ? " + Instagram icon link in nav" : ""})
2. Hero 100vh (gradient bg + huge name + tagline + reservation CTA buttons based on enabled types)
3. About (rating ★, hours table, service tags)
4. Menu cards (max 6, ◆ bullet style)
5. Reviews (2-3 cards with actual review text)
6. Access (address, phone link, map iframe)
7. Footer${instagram ? " + Instagram link button" : ""}

RESERVATION BUTTONS RULES:
- If phone enabled: show phone number button (href="tel:...")
- If LINE enabled and URL provided: show LINE button (href="${lineUrl || "#"}")
- If Google Calendar enabled and URL provided: show booking button (href="${googleCalUrl || "#"}")
- Style all buttons consistently with theme accent color

Return ONLY raw HTML. No markdown.`;

  try {
    const siteResponse = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      messages: [{ role: "user", content: sitePrompt }],
    });

    const siteContent = siteResponse.content[0];
    if (siteContent.type !== "text") {
      return NextResponse.json({ error: "サイト生成に失敗しました" }, { status: 500 });
    }

    let html = siteContent.text;
    const match = html.match(/```html\n?([\s\S]*?)```/);
    if (match) html = match[1];

    return NextResponse.json({ html, bizInfo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "API エラーが発生しました" }, { status: 500 });
  }
}
