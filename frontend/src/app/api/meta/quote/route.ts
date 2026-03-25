import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
    const response = await fetch(`${backendBaseUrl}/api/meta/quote`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend quote request failed with ${response.status}`);
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Quote proxy error:", error);
    return NextResponse.json(
      {
        quote: "Stay in flow: one meaningful step at a time.",
        period: "fallback",
        generatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
