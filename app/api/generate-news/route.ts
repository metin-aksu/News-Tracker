// ============================
// app/api/generate-news/route.ts
// ============================

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TweetItem {
  id: string;
  text: string;
  username: string;
  created_at: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tweets: TweetItem[] = body.tweets || [];
    const verified: TweetItem[] = body.verified || [];

    if (!tweets || tweets.length === 0) {
      return NextResponse.json({ error: "Haber oluşturmak için tweet verisi gerekli." }, { status: 400 });
    }

    const allTweets = [...tweets, ...verified]
      .map((t) => `@${t.username}: ${t.text}`)
      .join("\n\n");

    const prompt = `Aşağıdaki tweetlerden profesyonel bir haber metni oluştur.
Tarz: Tarafsız, gazetecilik üslubu.
Uzunluk: 4-6 paragraf.
Başlık ve spot ekle.

Tweetler:
${allTweets}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const article = completion.choices[0].message.content;

    return NextResponse.json({ article });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}