"use client";
import { useState } from "react";

export default function HomePage() {
  const [username, setUsername] = useState("elonmusk");
  const [topic, setTopic] = useState("trump");
  const [results, setResults] = useState<any>(null);
  const [article, setArticle] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    setLoading(true);
    setArticle("");
    try {
      const res = await fetch(`/api/search?username=${username}&topic=${topic}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const generateNews = async () => {
    if (!results) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/generate-news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweets: results.tweets, verified: results.verified }),
      });
      const data = await res.json();
      setArticle(data.article);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Twitter Konu Arama</h1>

      <input
        className="border p-2 w-full"
        placeholder="Kullanıcı adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Konu / Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={runSearch}
        disabled={loading}
      >
        Ara
      </button>

      {results && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Sonuçlar</h2>

          <div>
            <h3 className="font-semibold">Kullanıcı Tweetleri</h3>
            {results.tweets?.map((t: any) => (
              <div key={t.id} className="border p-2 my-2 rounded">
                <b>@{t.username}</b>
                <p>{t.text}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold">Onaylı Hesaplardan</h3>
            {results.verified?.map((t: any) => (
              <div key={t.id} className="border p-2 my-2 rounded">
                <b>@{t.username}</b>
                <p>{t.text}</p>
              </div>
            ))}
          </div>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={generateNews}
            disabled={loading}
          >
            Haber Oluştur
          </button>
        </div>
      )}

      {article && (
        <div className="mt-6 p-4 border rounded bg-gray-50 whitespace-pre-wrap">
          <h2 className="text-xl font-bold mb-2">Oluşturulan Haber</h2>
          {article}
        </div>
      )}

      {loading && <p>Yükleniyor...</p>}
    </div>
  );
}
