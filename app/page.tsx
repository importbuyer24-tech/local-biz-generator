"use client";

import { useState } from "react";

type ReservationType = "phone" | "line" | "google";

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
        body: JSON.stringify({
          rawText,
          instagram,
          lineUrl,
          googleCalUrl,
          reservationTypes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失敗");
      setHtml(data.html);
      setBizInfo(data.bizInfo);
      setStep("done");
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

  const stepLabel = step === "extracting" ? "店舗情報を読み取り中..." : "サイトを生成中...";

  return (
    <main className="min-h-screen bg-gray-950 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">AIサイト自動生成</h1>
          <p className="text-gray-400 text-sm">Googleマップの情報をコピペするだけでプロ品質のサイトを生成します</p>
        </div>

        {/* Step 1: Googleマップ */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Step 1 — Googleマップ情報</p>
          <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside mb-4">
            <li>Googleマップでお店のページを開く</li>
            <li>店名・住所・クチコミまで全部コピー</li>
            <li>下に貼り付ける</li>
          </ol>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
            placeholder="Googleマップからコピーしたテキストをそのまま貼り付けてください"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Step 2: SNS・予約 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Step 2 — SNS・予約設定</p>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">Instagram URL（任意）</label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://www.instagram.com/yourshop"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">予約方法（複数選択可）</label>
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
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {reservationTypes.includes("line") && (
            <div className="mb-3">
              <label className="block text-sm text-gray-300 mb-1">LINE URL</label>
              <input
                value={lineUrl}
                onChange={(e) => setLineUrl(e.target.value)}
                placeholder="https://lin.ee/xxxxxxx"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {reservationTypes.includes("google") && (
            <div className="mb-3">
              <label className="block text-sm text-gray-300 mb-1">Googleカレンダー予約URL</label>
              <input
                value={googleCalUrl}
                onChange={(e) => setGoogleCalUrl(e.target.value)}
                placeholder="https://calendar.google.com/..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || rawText.trim().length < 10}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition-colors text-sm mb-6"
        >
          {loading ? stepLabel : "サイトを生成する"}
        </button>

        {error && (
          <div className="mb-6 bg-red-950 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Extracted Info */}
        {bizInfo && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <p className="text-sm font-semibold text-gray-300 mb-3">読み取った情報</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(bizInfo).map(([key, value]) => value ? (
                <div key={key} className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500">{keyLabel(key)}：</span>
                  <span className="text-gray-300">{value}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* Result */}
        {html && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">生成されたサイト</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
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

            <div className="bg-gray-900 rounded-xl overflow-hidden mb-6 border border-gray-800">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500 ml-2">プレビュー</span>
              </div>
              <iframe
                srcDoc={html}
                className="w-full h-[700px]"
                title="サイトプレビュー"
                sandbox="allow-scripts"
              />
            </div>

            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                <span className="text-xs text-gray-500">HTMLコード</span>
                <button onClick={handleCopy} className="text-xs text-blue-400 hover:text-blue-300">
                  {copied ? "コピーしました！" : "コピー"}
                </button>
              </div>
              <pre className="text-green-400 text-xs p-4 overflow-auto max-h-72 whitespace-pre-wrap">
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
