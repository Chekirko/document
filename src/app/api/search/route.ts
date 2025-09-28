import { NextRequest, NextResponse } from "next/server";
import { testDocuments } from "@/data/test-documents";

// Проста функція для симуляції семантичного пошуку
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateSimilarity(query: string, document: any): number {
  const queryWords = query.toLowerCase().split(" ");
  const docText = (
    document.title +
    " " +
    document.content +
    " " +
    document.categories.join(" ")
  ).toLowerCase();

  let matches = 0;
  for (const word of queryWords) {
    if (docText.includes(word)) {
      matches++;
    }
  }

  return matches / queryWords.length;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { query, search_type = "hybrid", limit = 20 } = body;

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  let results = testDocuments.map((doc) => ({
    ...doc,
    confidence_score: calculateSimilarity(query, doc),
  }));

  // Сортуємо за релевантністю
  results = results
    .filter((doc) => doc.confidence_score > 0.1) // Мінімальний поріг релевантності
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, limit);

  return NextResponse.json(results);
}
