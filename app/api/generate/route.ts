import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

type ThemeKey =
  | "beauty" | "construction" | "wellness" | "yakiniku" | "food"
  | "renovation" | "cleaning" | "dental" | "fitness" | "education"
  | "realestate" | "photo" | "sweets" | "default";

const THEME_KEYWORDS: Record<ThemeKey, string[]> = {
  beauty:       ["美容", "サロン", "ネイル", "エステ", "hair", "Hair", "ヘア", "美髪", "まつげ"],
  construction: ["電気", "工事", "設備", "建設", "配管", "水道", "大工", "外壁", "屋根"],
  wellness:     ["整体", "整骨", "マッサージ", "鍼", "接骨", "カイロ", "リラク", "ストレッチ"],
  yakiniku:     ["焼肉", "韓国", "焼き", "炭火", "ホルモン", "BBQ"],
  food:         ["飲食", "レストラン", "カフェ", "料理", "食堂", "居酒屋", "ラーメン", "蕎麦", "寿司", "天ぷら", "食"],
  renovation:   ["リフォーム", "内装", "インテリア", "住宅", "リノベ", "改装", "工務"],
  cleaning:     ["清掃", "クリーニング", "ハウス", "掃除", "洗浄", "管理"],
  dental:       ["歯科", "デンタル", "クリニック", "医院", "歯医者", "矯正歯科"],
  fitness:      ["ジム", "フィットネス", "スポーツ", "トレーニング", "ヨガ", "ピラティス", "ボクシング", "格闘技"],
  education:    ["塾", "教室", "スクール", "学習", "英会話", "予備校", "習い事", "音楽教室"],
  realestate:   ["不動産", "賃貸", "売買", "マンション", "アパート", "土地", "仲介"],
  photo:        ["写真", "フォト", "スタジオ", "撮影", "フォトグラファー", "ウェディング"],
  sweets:       ["菓子", "ケーキ", "スイーツ", "パン", "パティスリー", "和菓子", "洋菓子", "ベーカリー"],
  default:      [],
};

const THEMES: Record<ThemeKey, string> = {
  beauty: `
STYLE: Editorial luxury beauty (light mode)
COLORS: --bg:#faf8f6; --bg2:#f2ede8; --accent:#c9956c; --accent2:#a8724e; --text:#1a1410; --muted:#7a6a60; --surface:#ffffff; --border:#e8d8cc
TYPOGRAPHY: Heading font-weight:200, letter-spacing:0.25em (ultra-light elegant). Body: serif feel, line-height:1.9
LAYOUT: Asymmetric grid. Wide whitespace. Thin 1px borders. No bold boxes.
DECORATIVE: Single thin horizontal rule lines. Small ◆ diamond separators. Vertical text labels on side.
MOOD: Vogue magazine editorial. Quiet luxury. Less is more.`,

  construction: `
STYLE: Industrial precision (dark mode)
COLORS: --bg:#0d1b2a; --bg2:#0f2236; --accent:#ff6b2b; --accent2:#ffa559; --text:#e8edf2; --muted:#7a8fa6; --surface:#0f2236; --border:#1e3a5f
TYPOGRAPHY: Heading font-weight:900, letter-spacing:0.05em. Body: sans-serif, tight and efficient.
LAYOUT: Grid-based. Sharp edges. Bold section dividers.
DECORATIVE: Diagonal cut sections. Grid dot patterns. Angular accent shapes.
MOOD: Strong, reliable, technical authority.`,

  wellness: `
STYLE: Organic wellness sanctuary (light mode)
COLORS: --bg:#f4f8f4; --bg2:#e8f2e8; --accent:#5a8c5a; --accent2:#3d6e3d; --text:#1a2d1a; --muted:#6a8a6a; --surface:#ffffff; --border:#c8dcc8
TYPOGRAPHY: Heading font-weight:300, letter-spacing:0.15em. Body: loose, breathable, line-height:1.9
LAYOUT: Flowing sections with soft curves. Generous padding.
DECORATIVE: Soft circle motifs. Organic curved lines. Nature-inspired subtle patterns.
MOOD: Calm, restorative, trustworthy healing.`,

  yakiniku: `
STYLE: Bold dining destination (dark mode)
COLORS: --bg:#111; --bg2:#1a0a0a; --accent:#e63946; --accent2:#ff6b35; --text:#f5f0eb; --muted:#a89f96; --surface:#1a0a0a; --border:#3a1a1a
TYPOGRAPHY: Heading font-weight:900, mix of serif for name + sans for body. Letter-spacing:0.1em.
LAYOUT: High contrast. Strong hero. Card grids with accent borders.
DECORATIVE: Diagonal slash shapes. Warm radial glows. Sharp geometric cuts.
MOOD: Appetite-driven, premium casual, energetic.`,

  food: `
STYLE: Artisan dining warmth (light mode)
COLORS: --bg:#fdf6ee; --bg2:#f7ece0; --accent:#d4832a; --accent2:#b8661a; --text:#2a1a0e; --muted:#8a6a5a; --surface:#ffffff; --border:#e8d0b8
TYPOGRAPHY: Heading: serif, font-weight:700. Body: warm and readable, line-height:1.85
LAYOUT: Warm layered sections. Rounded cards (border-radius:8px). Soft shadows.
DECORATIVE: Warm glows. Circular photo frames. Subtle grain texture via CSS.
MOOD: Welcoming, artisanal quality, neighborhood gem.`,

  renovation: `
STYLE: Architectural premium (light mode)
COLORS: --bg:#f8f6f2; --bg2:#ede8e0; --accent:#c8a96e; --accent2:#a88848; --text:#1a1810; --muted:#7a7268; --surface:#ffffff; --border:#ddd0be
TYPOGRAPHY: Heading font-weight:300, wide letter-spacing:0.2em. Clean and architectural.
LAYOUT: Grid-heavy. Precise alignment. Generous whitespace.
DECORATIVE: Thin gold lines. Corner accent brackets. Minimal geometric shapes.
MOOD: Sophisticated craftsmanship, premium residential.`,

  cleaning: `
STYLE: Clean tech professional (light mode)
COLORS: --bg:#f0f8fc; --bg2:#e0f0f8; --accent:#0097b2; --accent2:#007a90; --text:#0a1e2a; --muted:#4a7a90; --surface:#ffffff; --border:#b8dce8
TYPOGRAPHY: Heading font-weight:700, sans-serif precision. Body: clear and direct.
LAYOUT: Clean structure. Bold stats. Trust-building layout.
DECORATIVE: Clean horizontal lines. Dot grid accents. Sharp corners.
MOOD: Efficient, trustworthy, spotless professionalism.`,

  dental: `
STYLE: Clinical trust (light mode)
COLORS: --bg:#f8fcff; --bg2:#eef6ff; --accent:#2563eb; --accent2:#1d4ed8; --text:#0f172a; --muted:#4a6a8a; --surface:#ffffff; --border:#c8dff8
TYPOGRAPHY: Heading font-weight:600, letter-spacing:0.08em. Body: clean sans-serif, line-height:1.8
LAYOUT: Clean columns. Icon+text trust signals. Stats with large numbers.
DECORATIVE: Soft blue tints. Rounded cards (border-radius:12px). Badge/certification markers.
MOOD: Trustworthy, gentle, professional care.`,

  fitness: `
STYLE: High-energy performance (dark mode)
COLORS: --bg:#0a0a0a; --bg2:#181818; --accent:#ef4444; --accent2:#ff6b6b; --text:#f5f5f5; --muted:#a0a0a0; --surface:#1a1a1a; --border:#2a2a2a
TYPOGRAPHY: Heading font-weight:900, letter-spacing:0.06em, uppercase sections. Body: bold and direct.
LAYOUT: Full-bleed hero. Bold stat numbers. Side-by-side before/after layout.
DECORATIVE: Diagonal cut hero. Bold horizontal rules. Minimal red glow accents.
MOOD: Powerful, motivating, results-driven.`,

  education: `
STYLE: Warm academic (light mode)
COLORS: --bg:#fdfaf4; --bg2:#f5eedc; --accent:#1e40af; --accent2:#1730a0; --text:#1c1a14; --muted:#6a6050; --surface:#ffffff; --border:#ddd0b8
TYPOGRAPHY: Heading: serif, font-weight:700. Body: warm readable, line-height:1.85
LAYOUT: Structured sections. Course cards. Progress/result highlight boxes.
DECORATIVE: Subtle ruled lines. Serif drop caps. Warm paper-toned backgrounds.
MOOD: Trustworthy, encouraging, academically credible.`,

  realestate: `
STYLE: Premium neutral (light mode)
COLORS: --bg:#f7f5f2; --bg2:#ede8e0; --accent:#b8956a; --accent2:#9a7850; --text:#1a1710; --muted:#7a7068; --surface:#ffffff; --border:#ddd0be
TYPOGRAPHY: Heading font-weight:300, wide letter-spacing:0.18em. Architectural feel.
LAYOUT: Property card grid. Large photo hero. Clear CTA section.
DECORATIVE: Thin border frames. Gold accent lines. Clean map integration.
MOOD: Sophisticated, trustworthy, premium property.`,

  photo: `
STYLE: Minimalist monochrome editorial (light mode)
COLORS: --bg:#ffffff; --bg2:#f5f5f5; --accent:#1a1a1a; --accent2:#444444; --text:#1a1a1a; --muted:#6a6a6a; --surface:#ffffff; --border:#e0e0e0
TYPOGRAPHY: Heading font-weight:200, extreme letter-spacing:0.3em. Body: light, spacious.
LAYOUT: Full-bleed photo grid. Minimal text overlay. Maximum white space.
DECORATIVE: Hairline borders. Zero border-radius on photos. Black/white only accents.
MOOD: Portfolio gallery, artistic, let the images speak.`,

  sweets: `
STYLE: Artisan pastel confectionery (light mode)
COLORS: --bg:#fdf5f7; --bg2:#f5e8ed; --accent:#c8607a; --accent2:#a84860; --text:#2d1a20; --muted:#8a5a68; --surface:#ffffff; --border:#eeccd8
TYPOGRAPHY: Heading: serif, font-weight:400, gentle letter-spacing:0.12em. Body: warm, line-height:1.9
LAYOUT: Soft rounded cards (border-radius:16px). Product photo grid. Seasonal highlight banner.
DECORATIVE: Soft pastel gradients. Delicate thin borders. Subtle floral/dot motifs.
MOOD: Handmade warmth, seasonal joy, artisan confectionery.`,

  default: `
STYLE: Modern professional (light mode)
COLORS: --bg:#f8f8f8; --bg2:#eeeeee; --accent:#2563eb; --accent2:#1d4ed8; --text:#1a1a1a; --muted:#6a6a6a; --surface:#ffffff; --border:#dddddd
TYPOGRAPHY: Heading font-weight:700. Body: clean sans-serif.
LAYOUT: Balanced grid. Clear hierarchy.
DECORATIVE: Subtle geometric shapes. Clean lines.
MOOD: Trustworthy, modern, professional.`,
};

function getIndustryTheme(industry: string): string {
  const i = industry;
  const scores: Partial<Record<ThemeKey, number>> = {};

  for (const [key, keywords] of Object.entries(THEME_KEYWORDS) as [ThemeKey, string[]][]) {
    for (const kw of keywords) {
      if (i.includes(kw)) {
        scores[key] = (scores[key] ?? 0) + 1;
      }
    }
  }

  const best = (Object.entries(scores) as [ThemeKey, number][])
    .sort((a, b) => b[1] - a[1])[0];

  const themeKey: ThemeKey = best ? best[0] : "default";
  return THEMES[themeKey];
}

export async function POST(req: NextRequest) {
  const { rawText, mode, manualInfo, instagram, lineUrl, googleCalUrl, reservationTypes } = await req.json();

  const isManual = mode === "manual";

  if (isManual) {
    if (!manualInfo?.businessName?.trim()) {
      return NextResponse.json({ error: "店名を入力してください" }, { status: 400 });
    }
  } else {
    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json({ error: "Googleマップの情報を貼り付けてください" }, { status: 400 });
    }
    if (rawText.length > 5000) {
      return NextResponse.json({ error: "テキストが長すぎます（5000文字以内）" }, { status: 400 });
    }
  }

  const isValidUrl = (v: unknown) =>
    typeof v === "string" && v.length > 0 && /^https?:\/\//i.test(v);

  const safeInstagram  = isValidUrl(instagram) ? instagram as string : null;
  const safeLineUrl    = isValidUrl(lineUrl)    ? lineUrl as string    : null;
  const safeGoogleCal  = isValidUrl(googleCalUrl) ? googleCalUrl as string : null;
  const safeResvTypes: string[] =
    Array.isArray(reservationTypes) ? reservationTypes.filter((v: unknown) => typeof v === "string") : ["phone"];

  let bizInfo: Record<string, string>;

  if (isManual) {
    bizInfo = {
      businessName: String(manualInfo.businessName || ""),
      industry:     String(manualInfo.industry     || ""),
      area:         String(manualInfo.area         || ""),
      phone:        String(manualInfo.phone        || ""),
      hours:        String(manualInfo.hours        || ""),
      priceRange:   String(manualInfo.priceRange   || ""),
      services:     String(manualInfo.services     || ""),
      menu:         String(manualInfo.menu         || ""),
      rating:       "",
      reviewCount:  "",
      reviews:      "",
    };
  } else {
    // Step 1: Extract structured info from raw Google Maps paste
    const extractionResponse = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `以下のGoogleマップからコピーしたテキストから情報を抽出してJSON形式で返してください。

<source>
${rawText.slice(0, 3000)}
</source>

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

    try {
      const jsonMatch = extractionText.text.match(/\{[\s\S]*\}/);
      bizInfo = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      return NextResponse.json({ error: "情報の解析に失敗しました" }, { status: 500 });
    }
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
- Load Google Fonts: @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@300;400;500;600;700&display=swap');
- Luxury/editorial styles — heading: 'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif
- Industrial/clean styles — heading: 'Noto Sans JP','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif
- Body font always: 'Noto Sans JP','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif
- All Japanese text: font-feature-settings:"palt"; word-break:keep-all
- Section labels: 0.72rem, letter-spacing:0.35em, uppercase, accent color
- Section titles: clamp(1.8rem,4vw,2.6rem), follow theme weight
- Body: 0.92rem, line-height:1.85, muted color

LAYOUT RULES:
- 8px base grid. Section padding: 80px 5%
- Max content width: 1100px centered
- Cards: consistent border-radius (0px for editorial, 8px for warm, 4px for industrial)
- Hover effects: translateY(-4px) + border-color change

VISUAL EFFECTS:
1. Vanilla Tilt.js
   - Load from CDN just before </body>: <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js"></script>
   - Add data-tilt data-tilt-max="8" data-tilt-scale="1.03" data-tilt-glare="false" to EVERY menu card and EVERY review card element
   - Initialize after DOMContentLoaded: VanillaTilt.init(document.querySelectorAll("[data-tilt]"),{max:8,scale:1.03,glare:false})

2. Hero video loop background
   - Inside the hero <section>, as FIRST child: <video autoplay muted loop playsinline class="hero-video"></video> — no src attribute (fails gracefully, CSS fallback shows)
   - .hero-video: position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:0
   - Hero section base style: position:relative; overflow:hidden; background: linear-gradient(135deg, var(--bg) 0%, var(--bg2) 50%, var(--accent) 100%); background-size:200% 200%; animation:heroGradient 8s ease infinite
   - @keyframes heroGradient { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
   - Add a .hero-zoom-bg child div (position:absolute; inset:0; background:inherit; z-index:0; animation:heroZoom 14s ease-in-out infinite; transform-origin:center center)
   - @keyframes heroZoom { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
   - Add a .hero-overlay div (position:absolute; inset:0; background:rgba(0,0,0,0.45); z-index:1)
   - Hero text content div: position:relative; z-index:2

4. Lenis smooth scroll
   - Load from CDN just before </body>: <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
   - Initialize in the inline init script:
     const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
     function lenisRaf(time){ lenis.raf(time); requestAnimationFrame(lenisRaf); }
     requestAnimationFrame(lenisRaf);
   - Lenis handles page scroll; do NOT add overflow-y:scroll to html element (conflicts with Lenis)

5. Custom cursor
   - Add two elements immediately after <body>:
     <div class="cursor-dot"></div>
     <div class="cursor-ring"></div>
   - CSS:
     body { cursor: none; }
     .cursor-dot { position:fixed; width:8px; height:8px; border-radius:50%; background:var(--accent); pointer-events:none; z-index:10000; transform:translate(-50%,-50%); top:0; left:0; }
     .cursor-ring { position:fixed; width:32px; height:32px; border-radius:50%; border:1.5px solid var(--accent); pointer-events:none; z-index:9999; transform:translate(-50%,-50%); top:0; left:0; }
     @media (hover: none) { .cursor-dot, .cursor-ring { display:none; } body { cursor:auto; } }
   - JS (requestAnimationFrame lerp — smooth lag on ring):
     const dot = document.querySelector('.cursor-dot');
     const ring = document.querySelector('.cursor-ring');
     let mx=0, my=0, rx=0, ry=0;
     document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
     (function animRing(){ rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(animRing); })();

6. AOS.js scroll animations
   - In <head> add: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css">
   - Load JS just before </body>: <script src="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js"></script>
   - Initialize: AOS.init({ duration:800, once:true, disable: window.matchMedia('(prefers-reduced-motion:reduce)').matches });
   - Apply data attributes — section headings/labels: data-aos="fade-up"; cards (staggered): data-aos="fade-up" data-aos-delay="100" (increment by 100 per card); side content/images: data-aos="fade-right"; stats/ratings: data-aos="zoom-in"
   - Do NOT use IntersectionObserver for animations — AOS replaces it entirely

7. Particles.js in hero section
   - Load from CDN just before </body>: <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
   - Add <div id="particles-hero" style="position:absolute;inset:0;z-index:0;pointer-events:none;"></div> as FIRST child inside the hero section (before .hero-zoom-bg)
   - Initialize after DOMContentLoaded using the resolved CSS variable value:
     const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ffffff';
     particlesJS('particles-hero', { particles:{ number:{value:80}, color:{value:accentHex}, opacity:{value:0.3,random:true}, size:{value:3,random:true}, move:{enable:true,speed:0.8,direction:'none',random:true,out_mode:'out'}, line_linked:{enable:false} }, interactivity:{ events:{onhover:{enable:false},onclick:{enable:false}} }, retina_detect:true });

SCRIPT LOADING ORDER (just before </body>, in this exact sequence):
  1. <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js"></script>
  2. <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
  3. <script src="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js"></script>
  4. <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
  5. <script> /* single inline init block containing ALL initializations above */ </script>

STRICT:
- NO emojis. Use ◆ ● ▶ ★ for icons/bullets
- CSS variables from theme colors
- html tag must have lang="ja"
- Use AOS data attributes for all scroll animations (see VISUAL EFFECTS #6) — do NOT use IntersectionObserver
- Mobile responsive (hamburger menu)
- All text Japanese

SOCIAL & RESERVATION:
- Instagram URL: ${safeInstagram ?? "none"}
- Reservation types enabled: ${safeResvTypes.join(", ")}
- LINE URL: ${safeLineUrl ?? "none"}
- Google Calendar URL: ${safeGoogleCal ?? "none"}

SECTIONS:
1. Fixed navbar (name + 4 links + hamburger${safeInstagram ? " + Instagram icon link in nav" : ""})
2. Hero 100vh (particles layer + video loop bg + animated gradient fallback + heroZoom animation + overlay — see VISUAL EFFECTS #2 and #6; huge name + tagline + reservation CTA buttons based on enabled types)
3. About (rating ★, hours table, service tags)
4. Menu cards (max 6, ◆ bullet style)
5. Reviews (2-3 cards with actual review text)
6. Access (address, phone link, map iframe)
7. Footer${safeInstagram ? " + Instagram link button" : ""}

RESERVATION BUTTONS RULES:
- If phone enabled: show phone number button (href="tel:...")
- If LINE enabled and URL provided: show LINE button (href="${safeLineUrl ?? "#"}")
- If Google Calendar enabled and URL provided: show booking button (href="${safeGoogleCal ?? "#"}")
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
