import { NextResponse } from "next/server";
import { generateLoadingMessages } from "@/ai/flows/generate-loading-messages";

export async function GET() {
  try {
    const data = await generateLoadingMessages();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to generate loading messages via API:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
