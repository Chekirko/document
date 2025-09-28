import { NextResponse } from "next/server";
// Припустимо, ваші документи зберігаються у файлі data/documents.ts
import { testDocuments } from "@/data/test-documents";

export async function GET(
  request: Request,
  // { params }: { params: { id: string } }
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documentId = parseInt(id);
    const document = testDocuments.find((doc) => doc.id === documentId);

    if (!document) {
      return NextResponse.json(
        { error: "Документ не знайдено" },
        { status: 404 }
      );
    }

    // Повертаємо лише один знайдений документ
    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}
