"use client";

import { useState, useEffect } from "react";

type ReservationType = "phone" | "line" | "google";

type HistoryEntry = {
  businessName: string;
  html: string;
  bizInfo: Record<string, string>;
  timestamp: number;
};

const HISTORY_KEY = "site-gen-history";

export default function Home() {
  const [rawText, setRawText] = useState("");
  const [instagram, setInstagram] = useState("");
  const [lineUrl, setLineUrl] = useState("");
  const [googleCalUrl, setGoogleCalUrl] = useState("");
  const [reservationTypes, setReservationTypes] = useState<ReservationType[]>(["phone"]);
  const [html, setHtml] = useState("");
  const [bizInfo, setBizInfo] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"idle" | "extracting" | "generating" | "done">("idle");
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const theme = darkMode ? {
    main:        "bg-gray-950 text-white",
    card:        "bg-gray-900 border-gray-800",
    input:       "bg-gray-800 border-gray-700 text-white placeholder-gray-600",
    labelPrimary:"text-gray-300",
    labelMuted:  "text-gray-400",
    labelFaint:  "text-gray-500",
    stepLabel:   "text-blue-400",
    heading:     "text-white",
    error:       "bg-red-950 border-red-800 text-red-400",
    code:        "text-green-400",
    toggleBtn:   "border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700",
    inactiveBtn: "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500",
    downloadBtn: "bg-gray-700 hover:bg-gray-600 text-white",
    disabledBtn: "disabled:bg-gray-700 disabled:text-gray-500",
    historyCard: "bg-gray-800 border-gray-700 hover:border-gray-500",
    badge:       "bg-blue-950 text-blue-300 border border-blue-800",
    divider:     "border-gray-800",
    copyLink:    "text-blue-400 hover:text-blue-300",
  } : {
    main:        "bg-gray-50 text-gray-900",
    card:        "bg-white border-gray-200",
    input:       "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400",
    labelPrimary:"text-gray-700",
    labelMuted:  "text-gray-600",
    labelFaint:  "text-gray-400",
    stepLabel:   "text-blue-600",
    heading:     "text-gray-900",
    error:       "bg-red-50 border-red-200 text-red-600",
    code:        "text-green-700",
    toggleBtn:   "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
    inactiveBtn: "bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-400",
    downloadBtn: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    disabledBtn: "disabled:bg-gray-300 disabled:text-gray-400",
    historyCard: "bg-gray-100 border-gray-200 hover:border-gray-400",
    badge:       "bg-blue-50 text-blue-700 border border-blue-200",
    divider:     "border-gray-200",
    copyLink:    "text-blue-600 hover:text-blue-700",
  };

  const toggleReservation = (type: ReservationType) => {
    setReservationTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setHtml("");
    setBizInfo(null);
    setStep("extracting");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, instagram, lineUrl, googleCalUrl, reservationTypes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失敗");
      setHtml(data.html);
      setBizInfo(data.bizInfo);
      setStep("done");

      const entry: HistoryEntry = {
        businessName: data.bizInfo?.businessName || "不明",
        html: data.html,
        bizInfo: data.bizInfo,
        timestamp: Date.now(),
      };
      setHistory(prev => {
        const updated = [entry, ...prev].slice(0, 3);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
        return updated;
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bizInfo?.businessName || "site"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setHtml(entry.html);
    setBizInfo(entry.bizInfo);
    setStep("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepLabel = step === "extracting" ? "店舗情報を読み取り中..." : "サイトを生成中...";

  return (
    <main className={`min-h-screen ${theme.main} py-10 px-4`}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${theme.heading}`}>AIサイト自動生成</h1>
            <p className={`text-sm ${theme.labelMuted}`}>Googleマップの情報をコピペするだけでプロ品質のサイトを生成します</p>
          </div>
          <button
            onClick={() => setDarkMode(d => !d)}
            className={`mt-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${theme.toggleBtn}`}
          >
            {darkMode ? "ライトモード" : "ダークモード"}
          </button>
        </div>

        {/* Step 1: Googleマップ */}
        <div className={`border rounded-xl p-5 mb-4 ${theme.card}`}>
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${theme.stepLabel}`}>Step 1 — Googleマップ情報</p>
          <ol className={`text-sm space-y-1 list-decimal list-inside mb-4 ${theme.labelMuted}`}>
            <li>Googleマップでお店のページを開く</li>
            <li>店名・住所・クチコミまで全部コピー</li>
            <li>下に貼り付ける</li>
          </ol>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
            placeholder="Googleマップからコピーしたテキストをそのまま貼り付けてください"
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${theme.input}`}
          />
        </div>

        {/* Step 2: SNS・予約 */}
        <div className={`border rounded-xl p-5 mb-4 ${theme.card}`}>
          <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${theme.stepLabel}`}>Step 2 — SNS・予約設定</p>

          <div className="mb-4">
            <label className={`block text-sm mb-1 ${theme.labelPrimary}`}>Instagram URL（任意）</label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://www.instagram.com/yourshop"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`}
            />
          </div>

          <div className="mb-4">
            <label className={`block text-sm mb-2 ${theme.labelPrimary}`}>予約方法（複数選択可）</label>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "phone" as ReservationType, label: "電話予約" },
                { type: "line" as ReservationType, label: "LINE予約" },
                { type: "google" as ReservationType, label: "Googleカレンダー" },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => toggleReservation(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    reservationTypes.includes(type)
                      ? "bg-blue-600 border-blue-500 text-white"
                      : theme.inactiveBtn
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {reservationTypes.includes("line") && (
            <div className="mb-3">
              <label className={`block text-sm mb-1 ${theme.labelPrimary}`}>LINE URL</label>
              <input
                value={lineUrl}
                onChange={(e) => setLineUrl(e.target.value)}
                placeholder="https://lin.ee/xxxxxxx"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`}
              />
            </div>
          )}

          {reservationTypes.includes("google") && (
            <div className="mb-3">
              <label className={`block text-sm mb-1 ${theme.labelPrimary}`}>Googleカレンダー予約URL</label>
              <input
                value={googleCalUrl}
                onChange={(e) => setGoogleCalUrl(e.target.value)}
                placeholder="https://calendar.google.com/..."
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`}
              />
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || rawText.trim().length < 10}
          className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors text-sm mb-6 ${theme.disabledBtn}`}
        >
          {loading ? stepLabel : "サイトを生成する"}
        </button>

        {/* Generation History */}
        {history.length > 0 && (
          <div className="mb-6">
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${theme.labelFaint}`}>過去の生成履歴</p>
            <div className="flex flex-col gap-2">
              {history.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => loadFromHistory(entry)}
                  className={`w-full text-left border rounded-xl px-4 py-3 transition-colors ${theme.historyCard}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${theme.labelPrimary}`}>{entry.businessName}</span>
                    <span className={`text-xs ${theme.labelFaint}`}>{formatDate(entry.timestamp)}</span>
                  </div>
                  {entry.bizInfo?.industry && (
                    <span className={`text-xs ${theme.labelMuted}`}>{entry.bizInfo.industry}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className={`mb-6 border rounded-lg px-4 py-3 text-sm ${theme.error}`}>
            {error}
          </div>
        )}

        {/* Extracted Info */}
        {bizInfo && (
          <div className={`border rounded-xl p-5 mb-6 ${theme.card}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold ${theme.labelPrimary}`}>読み取った情報</p>
              {bizInfo.industry && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${theme.badge}`}>
                  {getIndustryLabel(bizInfo.industry)}適用中
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(bizInfo).map(([key, value]) => value ? (
                <div key={key} className="col-span-2 sm:col-span-1">
                  <span className={theme.labelFaint}>{keyLabel(key)}：</span>
                  <span className={theme.labelPrimary}>{value}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* Result */}
        {html && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-semibold ${theme.heading}`}>生成されたサイト</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${theme.downloadBtn}`}
                >
                  ダウンロード
                </button>
                <button
                  onClick={handleCopy}
                  className="bg-green-700 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {copied ? "コピーしました！" : "HTMLをコピー"}
                </button>
              </div>
            </div>

            <div className={`rounded-xl overflow-hidden mb-6 border ${theme.card}`}>
              <div className={`flex items-center gap-2 px-4 py-2 border-b ${theme.divider}`}>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className={`text-xs ml-2 ${theme.labelFaint}`}>プレビュー</span>
              </div>
              <iframe
                srcDoc={html}
                className="w-full h-[700px]"
                title="サイトプレビュー"
                sandbox="allow-scripts"
              />
            </div>

            <div className={`rounded-xl overflow-hidden border ${theme.card}`}>
              <div className={`flex items-center justify-between px-4 py-2 border-b ${theme.divider}`}>
                <span className={`text-xs ${theme.labelFaint}`}>HTMLコード</span>
                <button onClick={handleCopy} className={`text-xs ${theme.copyLink}`}>
                  {copied ? "コピーしました！" : "コピー"}
                </button>
              </div>
              <pre className={`text-xs p-4 overflow-auto max-h-72 whitespace-pre-wrap ${theme.code}`}>
                {html}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function keyLabel(key: string): string {
  const labels: Record<string, string> = {
    businessName: "店名", industry: "業種", area: "エリア",
    hours: "営業時間", priceRange: "価格帯", phone: "電話番号",
    services: "サービス", menu: "メニュー", rating: "評価",
    reviewCount: "レビュー数", reviews: "クチコミ",
  };
  return labels[key] || key;
}

function getIndustryLabel(industry: string): string {
  const i = industry;
  if (i.includes("美容") || i.includes("サロン") || i.includes("ネイル") || i.includes("エステ") || i.includes("ヘア")) return "美容室向けデザイン";
  if (i.includes("電気") || i.includes("工事") || i.includes("設備") || i.includes("建設")) return "建設・工事向けデザイン";
  if (i.includes("整体") || i.includes("整骨") || i.includes("マッサージ") || i.includes("鍼")) return "整体・ウェルネス向けデザイン";
  if (i.includes("焼肉") || i.includes("韓国") || i.includes("焼き")) return "焼肉・韓国料理向けデザイン";
  if (i.includes("飲食") || i.includes("レストラン") || i.includes("カフェ") || i.includes("料理") || i.includes("食")) return "飲食店向けデザイン";
  if (i.includes("リフォーム") || i.includes("内装") || i.includes("インテリア") || i.includes("住宅")) return "リフォーム・住宅向けデザイン";
  if (i.includes("清掃") || i.includes("クリーニング")) return "清掃業向けデザイン";
  if (i.includes("歯科") || i.includes("クリニック") || i.includes("医院")) return "クリニック向けデザイン";
  if (i.includes("ジム") || i.includes("フィットネス") || i.includes("スポーツ")) return "フィットネス向けデザイン";
  if (i.includes("塾") || i.includes("教室") || i.includes("スクール")) return "教育・スクール向けデザイン";
  if (i.includes("不動産") || i.includes("賃貸")) return "不動産向けデザイン";
  if (i.includes("写真") || i.includes("スタジオ")) return "フォトスタジオ向けデザイン";
  if (i.includes("菓子") || i.includes("ケーキ") || i.includes("スイーツ") || i.includes("パン")) return "スイーツ・ベーカリー向けデザイン";
  return "汎用デザイン";
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("ja-JP", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
