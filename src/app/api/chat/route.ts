import { NextRequest, NextResponse } from "next/server";
import { testDocuments } from "@/data/test-documents";
import { aiService } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query } = body;

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    // Знаходимо релевантні документи (спрощений пошук)
    const relevantDocs = testDocuments
      .filter((doc) => {
        const docText = (doc.title + " " + doc.content).toLowerCase();
        const queryWords = query.toLowerCase().split(" ");
        return queryWords.some((word: string) => docText.includes(word));
      })
      .slice(0, 20); // Беремо топ 3 документи

    const chatResponse = await aiService.generateChatResponse(
      query,
      relevantDocs
    );

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        response: "Вибачте, сталася помилка при обробці запитання.",
        sources: [],
        confidence: 0.0,
      },
      { status: 500 }
    );
  }
}
