"use client";

import { useState } from "react";
import Link from "next/link";

type Post = {
  day: number;
  weekday: string;
  category: string;
  theme: string;
  caption: string;
  hashtags: string[];
  tip: string;
};

type Keyword = {
  keyword: string;
  type: string;
  reason: string;
};

type Schedule = {
  recommended_days: string[];
  recommended_time: string;
  frequency: string;
  reason: string;
};

type Plan = {
  schedule: Schedule;
  keywords: Keyword[];
  posts: Post[];
};

const CATEGORY_COLORS: Record<string, string> = {
  "商品・サービス紹介": "bg-blue-900 text-blue-300 border-blue-800",
  "お客様の声・事例":   "bg-green-900 text-green-300 border-green-800",
  "スタッフ・裏側紹介": "bg-purple-900 text-purple-300 border-purple-800",
  "季節・トレンドネタ": "bg-orange-900 text-orange-300 border-orange-800",
  "お役立ち情報・豆知識":"bg-teal-900 text-teal-300 border-teal-800",
  "キャンペーン・お得情報":"bg-pink-900 text-pink-300 border-pink-800",
};

const KEYWORD_TYPE_COLOR: Record<string, string> = {
  "集客":       "bg-blue-950 text-blue-300 border-blue-800",
  "ブランディング": "bg-purple-950 text-purple-300 border-purple-800",
  "トレンド":    "bg-orange-950 text-orange-300 border-orange-800",
};

export default function SnsPlanner() {
  const [industry, setIndustry]     = useState("");
  const [target, setTarget]         = useState("");
  const [accountName, setAccountName] = useState("");
  const [goal, setGoal]             = useState("");
  const [followers, setFollowers]   = useState("");
  const [frequency, setFrequency]   = useState("週3〜4回");
  const [area, setArea]             = useState("");
  const [strengths, setStrengths]   = useState("");

  const [plan, setPlan]             = useState<Plan | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [copiedPost, setCopiedPost] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("すべて");

  const handleGenerate = async () => {
    if (!industry.trim()) return;
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const res = await fetch("/api/sns-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientInfo: { industry, target, accountName, goal, followers, frequency, area, strengths },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失敗");
      setPlan(data.plan);
      setFilterCategory("すべて");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPost = (post: Post, index: number) => {
    const text = `${post.caption}\n\n${post.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopiedPost(index);
    setTimeout(() => setCopiedPost(null), 2000);
  };

  const handleCopyAll = () => {
    if (!plan) return;
    const text = plan.posts.map(p =>
      `【Day ${p.day} / ${p.weekday}曜 / ${p.category}】\n${p.theme}\n\n${p.caption}\n\n${p.hashtags.join(" ")}`
    ).join("\n\n" + "─".repeat(40) + "\n\n");
    navigator.clipboard.writeText(text);
  };

  const categories = plan
    ? ["すべて", ...Array.from(new Set(plan.posts.map(p => p.category)))]
    : [];

  const filteredPosts = plan?.posts.filter(p =>
    filterCategory === "すべて" || p.category === filterCategory
  ) ?? [];

  return (
    <main className="min-h-screen bg-gray-950 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                ← AIサイト生成ツール
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">SNS運用プランナー</h1>
            <p className="text-sm text-gray-400">クライアント情報を入れるだけで30日分の投稿計画を自動生成</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">クライアント情報</p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                業種 <span className="text-red-400">*</span>
              </label>
              <input
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="例：美容室、カフェ、整体院、フォトスタジオ"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">アカウント名（任意）</label>
                <input
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="@アカウント名"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">エリア（任意）</label>
                <input
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="例：渋谷、大阪梅田"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">ターゲット層（任意）</label>
              <input
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="例：20〜30代女性、育児中のママ、40代ビジネスマン"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">特徴・強み（任意）</label>
              <input
                value={strengths}
                onChange={e => setStrengths(e.target.value)}
                placeholder="例：駅から徒歩2分、予約不要、スタッフ全員女性"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">目標（任意）</label>
                <input
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="例：予約数を増やす、フォロワー1000人"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">現在のフォロワー数（任意）</label>
                <input
                  value={followers}
                  onChange={e => setFollowers(e.target.value)}
                  placeholder="例：500人"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">投稿頻度</label>
              <div className="flex flex-wrap gap-2">
                {["週2〜3回", "週3〜4回", "週5回以上", "毎日"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      frequency === f
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !industry.trim()}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition-colors text-sm mb-6"
        >
          {loading ? "プランを生成中…（30秒ほどかかります）" : "30日分のSNS運用プランを生成する"}
        </button>

        {error && (
          <div className="mb-6 border rounded-lg px-4 py-3 text-sm bg-red-950 border-red-800 text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {plan && (
          <div>
            {/* Schedule */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">推奨スケジュール</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {plan.schedule.recommended_days.map(d => (
                  <span key={d} className="bg-purple-950 text-purple-300 border border-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                    {d}
                  </span>
                ))}
                <span className="bg-gray-800 text-gray-300 border border-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                  {plan.schedule.recommended_time}
                </span>
                <span className="bg-gray-800 text-gray-300 border border-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                  {plan.schedule.frequency}
                </span>
              </div>
              <p className="text-xs text-gray-400">{plan.schedule.reason}</p>
            </div>

            {/* Keywords */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">成約につながるキーワード</p>
              <div className="space-y-2">
                {plan.keywords.map((kw, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded border ${KEYWORD_TYPE_COLOR[kw.type] || "bg-gray-800 text-gray-300 border-gray-700"}`}>
                      {kw.type}
                    </span>
                    <span className="text-sm text-blue-300 font-medium w-32 shrink-0">{kw.keyword}</span>
                    <span className="text-xs text-gray-400">{kw.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">30日分の投稿ネタ</p>
                <button
                  onClick={handleCopyAll}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  全件コピー
                </button>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      filterCategory === cat
                        ? "bg-white text-gray-900 border-white"
                        : "border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {cat}
                    {cat !== "すべて" && (
                      <span className="ml-1 opacity-60">
                        ({plan.posts.filter(p => p.category === cat).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredPosts.map((post, i) => (
                  <div key={post.day} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-bold bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-full">
                          Day {post.day}
                        </span>
                        {post.weekday && (
                          <span className="text-xs text-gray-500">{post.weekday}曜日</span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${CATEGORY_COLORS[post.category] || "bg-gray-800 text-gray-300 border-gray-700"}`}>
                          {post.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyPost(post, i)}
                        className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        {copiedPost === i ? "コピー済み" : "コピー"}
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-purple-300 mb-2">▶ {post.theme}</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-300 mb-2">
                      {post.caption}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">{post.hashtags.join(" ")}</p>
                    {post.tip && (
                      <p className="text-xs text-yellow-600 border-t border-gray-800 pt-2 mt-2">
                        💡 {post.tip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Re-generate */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full border border-gray-700 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm mb-10"
            >
              {loading ? "再生成中…" : "別パターンで再生成"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
