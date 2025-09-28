import { NextRequest, NextResponse } from "next/server";
import { testDocuments } from "@/data/test-documents";
import { aiService } from "@/lib/ai-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const documentId = parseInt(params.id);
  const document = testDocuments.find((doc) => doc.id === documentId);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    // Якщо документ вже має аналіз, повертаємо його
    if (
      document.summary &&
      document.simple_explanation &&
      document.key_points
    ) {
      return NextResponse.json({
        id: documentId,
        summary: document.summary,
        simple_explanation: document.simple_explanation,
        key_points: document.key_points,
        related_topics: document.categories,
        confidence: 0.9,
        processing_time: new Date().toISOString(),
      });
    }

    // Інакше викликаємо ШІ аналіз
    const analysis = await aiService.analyzeDocument(
      document.title,
      document.content
    );

    return NextResponse.json({
      id: documentId,
      ...analysis,
      related_topics: document.categories,
      processing_time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
