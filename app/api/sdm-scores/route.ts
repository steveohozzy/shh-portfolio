
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const appCheckToken = request.headers.get("X-Firebase-AppCheck");

    if (!appCheckToken) {
      return NextResponse.json(
        { error: "App verification required." },
        { status: 401 },
      );
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 },
      );
    }

    const serviceAccount = JSON.parse(serviceAccountKey);

    const adminApp =
      getApps().find((app) => app.name === "sdm-score-api") ??
      initializeApp(
        {
          credential: cert(serviceAccount),
          projectId: "squishy-dumpling-match",
        },
        "sdm-score-api",
      );

    await getAppCheck(adminApp).verifyToken(appCheckToken);

    const body = await request.json();
    const { initials, score, level, cleared } = body;

    if (
      typeof initials !== "string" ||
      !/^[A-Z]{3}$/.test(initials) ||
      !Number.isSafeInteger(score) ||
      score <= 0 ||
      score > 10000000 ||
      !Number.isSafeInteger(level) ||
      level < 1 ||
      level > 1000 ||
      !Number.isSafeInteger(cleared) ||
      cleared < 0 ||
      cleared > 1000000
    ) {
      return NextResponse.json(
        { error: "Invalid score submission." },
        { status: 400 },
      );
    }

    const db = getFirestore(adminApp);

    const scoreRef = await db.collection("sdm-scores").add({
      initials,
      score,
      level,
      cleared,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: scoreRef.id });
  } catch {
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 },
    );
  }
}
