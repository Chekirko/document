"use server";

import { testDocuments } from "@/data/test-documents";

import type { TestDocument } from "@/types";
import { aiService } from "@/lib/ai-service";
import type { DocumentAnalysis } from "@/types";

// Ця функція буде імітувати асинхронний запит до бази даних
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

// Ось наша Server Action. Вона приймає ID документа від клієнта.
export async function analyzeDocumentAction(
  documentId: number
): Promise<ActionResult> {
  // 1. Знаходимо потрібний документ (ця логіка виконується на сервері)
  const document = testDocuments.find((doc) => doc.id === documentId);

  if (!document) {
    return { success: false, error: "Документ не знайдено." };
  }

  try {
    console.log(
      `[Server Action] Запуск аналізу ШІ для документа #${documentId}...`
    );

    // 2. Викликаємо ваш існуючий AI сервіс
    const analysisResult = await aiService.analyzeDocument(
      document.title,
      document.content
    );

    // 3. Форматуємо дані у відповідності до типу DocumentAnalysis, який очікує клієнт
    const fullAnalysisData: DocumentAnalysis = {
      id: documentId,
      summary: analysisResult.summary,
      simple_explanation: analysisResult.simple_explanation,
      key_points: analysisResult.key_points,
      confidence: analysisResult.confidence,
      // Додаємо дані, яких немає у відповіді від ШІ, але є в оригінальному документі
      related_topics: document.categories,
      processing_time: new Date().toISOString(),
    };

    console.log(`[Server Action] Аналіз для #${documentId} успішно завершено.`);

    // 4. Повертаємо успішний результат
    return { success: true, data: fullAnalysisData };
  } catch (error) {
    console.error("[Server Action] Помилка аналізу ШІ:", error);

    // Повертаємо структуровану помилку, якщо щось пішло не так
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Невідома помилка під час аналізу." };
  }
}
