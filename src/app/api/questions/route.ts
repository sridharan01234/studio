import { NextRequest, NextResponse } from "next/server";

import { generateLoveLanguageQuizQuestions } from "@/ai/flows/generate-quiz-questions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const data = await generateLoveLanguageQuizQuestions(body);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to generate quiz questions via API:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await generateLoveLanguageQuizQuestions();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to generate quiz questions via API:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
