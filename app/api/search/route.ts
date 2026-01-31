import { NextRequest, NextResponse } from "next/server";
import { searchAndAnswer } from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || question.trim().length < 3) {
      return NextResponse.json(
        { error: "Question must be at least 3 characters" },
        { status: 400 }
      );
    }

    const result = await searchAndAnswer(question);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 }
    );
  }
}
