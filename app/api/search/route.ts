// ============================
// app/api/search/route.ts
// ============================

import { NextResponse } from "next/server";

const BEARER = process.env.TWITTER_BEARER_TOKEN as string;

async function twitterGet<T = any>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${BEARER}`,
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    const e = new Error(`Twitter API hata: ${res.status} ${txt}`) as any;
    e.status = res.status;
    throw e;
  }

  return res.json() as Promise<T>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const topic = searchParams.get("topic");

    if (!username || !topic) {
      return NextResponse.json({ error: "username ve topic gerekli" }, { status: 400 });
    }

    if (!BEARER) {
      return NextResponse.json({ error: "BEARER_TOKEN ayarlı değil" }, { status: 500 });
    }

    // 1) Kullanıcı ID'si
    // interface UserResp {
    //   data?: { id: string };
    // }

    // // https://api.twitter.com/2/tweets/search/recent?query=from:elonmusk%20trump&max_results=10&tweet.fields=created_at,author_id'

    // const userData = await twitterGet<UserResp>(
    //   `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=verified,public_metrics`
    // );

    // const userId = userData.data?.id;
    // if (!userId) {
    //   return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    // }

    // console.log("userId : ", userId)

    // 2) Kullanıcı tweetleri
    const qUser = `from:${username} ${topic}`;
    const userSearchUrl = `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(
      qUser
    )}&max_results=20&tweet.fields=created_at,author_id,text`;

    interface TweetRaw {
      id: string;
      text: string;
      created_at: string;
      author_id: string;
    }

    interface TweetSearchResp {
      data?: TweetRaw[];
    }

    const userTweetsRaw = await twitterGet<TweetSearchResp>(userSearchUrl);

    const tweets = (userTweetsRaw.data || []).map((t) => ({
      id: t.id,
      text: t.text,
      created_at: t.created_at,
      author_id: t.author_id,
      username,
    }));

    // 3) Verified tweetler
    // const qVerified = `${topic} is:verified`;

    // const verifiedUrl = `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(
    //   qVerified
    // )}&max_results=20&tweet.fields=created_at,author_id,text&expansions=author_id&user.fields=username,verified,public_metrics`;

    // interface VerifiedResp {
    //   data?: TweetRaw[];
    //   includes?: { users: { id: string; username: string }[] };
    // }

    // const verifiedRaw = await twitterGet<VerifiedResp>(verifiedUrl);

    // const verifiedUsers: Record<string, { username: string }> = {};
    // verifiedRaw.includes?.users?.forEach((u) => {
    //   verifiedUsers[u.id] = { username: u.username };
    // });

    // const verified = (verifiedRaw.data || []).map((t) => ({
    //   id: t.id,
    //   text: t.text,
    //   created_at: t.created_at,
    //   author_id: t.author_id,
    //   username: verifiedUsers[t.author_id]?.username || "unknown",
    // }));

    // return NextResponse.json({ tweets, verified });
    return NextResponse.json({ tweets });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}