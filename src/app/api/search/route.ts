// import { NextRequest, NextResponse } from "next/server";
// import { testDocuments } from "@/data/test-documents";

// // Проста функція для симуляції семантичного пошуку
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// function calculateSimilarity(query: string, document: any): number {
//   const queryWords = query.toLowerCase().split(" ");
//   const docText = (
//     document.title +
//     " " +
//     document.content +
//     " " +
//     document.categories.join(" ")
//   ).toLowerCase();

//   let matches = 0;
//   for (const word of queryWords) {
//     if (docText.includes(word)) {
//       matches++;
//     }
//   }

//   return matches / queryWords.length;
// }

// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const { query, search_type = "hybrid", limit = 20 } = body;

//   if (!query) {
//     return NextResponse.json({ error: "Query is required" }, { status: 400 });
//   }

//   let results = testDocuments.map((doc) => ({
//     ...doc,
//     confidence_score: calculateSimilarity(query, doc),
//   }));

//   // Сортуємо за релевантністю
//   results = results
//     .filter((doc) => doc.confidence_score > 0.1) // Мінімальний поріг релевантності
//     .sort((a, b) => b.confidence_score - a.confidence_score)
//     .slice(0, limit);

//   return NextResponse.json(results);
// }

import { NextRequest, NextResponse } from "next/server";
import { testDocuments } from "@/data/test-documents";
import { aiService } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, search_type = "hybrid", filters = {}, limit = 20 } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Застосовуємо фільтри до документів перед пошуком
    let filteredDocuments = [...testDocuments];

    // Фільтр за типом документа
    if (filters.document_type) {
      filteredDocuments = filteredDocuments.filter(
        (doc) => doc.document_type === filters.document_type
      );
    }

    // Фільтр за категорією
    if (filters.category) {
      filteredDocuments = filteredDocuments.filter((doc) =>
        doc.categories.some((cat) =>
          cat.toLowerCase().includes(filters.category.toLowerCase())
        )
      );
    }

    // Фільтр за номером документа
    if (filters.document_number) {
      filteredDocuments = filteredDocuments.filter((doc) => {
        const match = doc.title.match(/№\s*(\d+)/);
        return match && match[1].includes(filters.document_number);
      });
    }

    // Фільтр за датою "від"
    if (filters.date_from) {
      const dateFrom = new Date(filters.date_from);
      filteredDocuments = filteredDocuments.filter((doc) => {
        const docDate = new Date(doc.date_created);
        return docDate >= dateFrom;
      });
    }

    // Фільтр за датою "до"
    if (filters.date_to) {
      const dateTo = new Date(filters.date_to);
      filteredDocuments = filteredDocuments.filter((doc) => {
        const docDate = new Date(doc.date_created);
        return docDate <= dateTo;
      });
    }

    // Виконуємо пошук в залежності від типу
    let results;

    switch (search_type) {
      case "semantic":
        // Чистий семантичний пошук через embeddings
        results = await aiService.semanticSearch(
          query,
          filteredDocuments,
          limit
        );
        break;

      case "keyword":
        // Простий пошук за ключовими словами (fallback)
        results = await aiService["fallbackKeywordSearch"](
          query,
          filteredDocuments,
          limit
        );
        break;

      case "hybrid":
      default:
        // Гібридний пошук (рекомендований)
        results = await aiService.hybridSearch(query, filteredDocuments, limit);
        break;
    }

    // Додаємо метадані про пошук
    return NextResponse.json({
      results,
      query,
      search_type,
      total: results.length,
      filters_applied: Object.keys(filters).length > 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Search error:", error);

    // Детальніше логування помилки
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to perform search",
        message: error instanceof Error ? error.message : "Unknown error",
        results: [],
      },
      { status: 500 }
    );
  }
}
