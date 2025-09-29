"use server";

import { testDocuments } from "@/data/test-documents";

import type { TestDocument } from "@/types";
import { aiService } from "@/lib/ai-service";
import type { DocumentAnalysis } from "@/types";

interface GetDocumentsParams {
  page?: string;
  limit?: string;
  document_type?: string;
  category?: string;
  query?: string;
}

export async function getDocumentById(
  id: number
): Promise<TestDocument | null> {
  const document = testDocuments.find((doc) => doc.id === id);

  if (!document) {
    return null;
  }

  return document;
}

type ActionResult =
  | {
      success: true;
      data: DocumentAnalysis;
    }
  | {
      success: false;
      error: string;
    };

export async function analyzeDocumentAction(
  documentId: number
): Promise<ActionResult> {
  const document = testDocuments.find((doc) => doc.id === documentId);

  if (!document) {
    return { success: false, error: "Документ не знайдено." };
  }

  try {
    console.log(
      `[Server Action] Запуск аналізу ШІ для документа #${documentId}...`
    );

    const analysisResult = await aiService.analyzeDocument(
      document.title,
      document.content
    );

    const fullAnalysisData: DocumentAnalysis = {
      id: documentId,
      summary: analysisResult.summary,
      simple_explanation: analysisResult.simple_explanation,
      key_points: analysisResult.key_points,
      confidence: analysisResult.confidence,

      related_topics: document.categories,
      processing_time: new Date().toISOString(),
    };

    console.log(`[Server Action] Аналіз для #${documentId} успішно завершено.`);

    return { success: true, data: fullAnalysisData };
  } catch (error) {
    console.error("[Server Action] Помилка аналізу ШІ:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Невідома помилка під час аналізу." };
  }
}

export async function getDocuments(params: GetDocumentsParams) {
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "20");
  const { document_type, category, query } = params;

  let filteredDocs = [...testDocuments];

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

  if (query) {
    filteredDocs = filteredDocs.filter((doc) =>
      doc.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + limit);

  return {
    documents: paginatedDocs,
    total: filteredDocs.length,
    page,
    limit,
  };
}
