import { NextRequest, NextResponse } from "next/server";
import { testDocuments } from "@/data/test-documents";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const document_type = url.searchParams.get("document_type");
  const category = url.searchParams.get("category");

  let filteredDocs = [...testDocuments];

  // Застосовуємо фільтри
  if (document_type) {
    filteredDocs = filteredDocs.filter(
      (doc) => doc.document_type === document_type
    );
  }

  if (category) {
    filteredDocs = filteredDocs.filter((doc) =>
      doc.categories.some((cat) =>
        cat.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  // Пагінація
  const startIndex = (page - 1) * limit;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    documents: paginatedDocs,
    total: filteredDocs.length,
    page,
    limit,
  });
}
