"use client"; // Обов'язкова директива, що позначає цей компонент як клієнтський

import { useState, useTransition } from "react";
import { ArrowLeft, FileText, Calendar, Tag, Brain, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

// Важливо: переконайтеся, що шлях до файлу з типами правильний
// Якщо ви створили src/lib/data.ts, як у попередньому прикладі
import type { TestDocument, DocumentAnalysis } from "@/types";
import { analyzeDocumentAction } from "@/lib/actions/actions";
// Цей інтерфейс описує дані, які повертає ваш API для аналізу

// Пропси для нашого компонента: він отримує вже завантажений документ
interface DocumentViewProps {
  initialDocument: TestDocument;
}

export default function DocumentView({ initialDocument }: DocumentViewProps) {
  const router = useRouter();

  // Стан для документа ініціалізується одразу з пропсів.
  // Більше не потрібен стан `loading` для початкового завантаження.
  const [document] = useState<TestDocument>(initialDocument);

  // Ці стани потрібні для асинхронної дії на стороні клієнта (запит аналізу)
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  //   const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Ця функція залишається, оскільки вона викликається дією користувача (кліком)
  //   const fetchAnalysis = async () => {
  //     if (!document) return;

  //     try {
  //       setAnalysisLoading(true);
  //       setError(null); // Скидаємо попередні помилки

  //       // Робимо запит до API-ендпоінту, що відповідає за аналіз
  //       const response = await fetch(`/api/documents/${document.id}/analyze`);
  //       const data = await response.json();

  //       if (response.ok) {
  //         setAnalysis(data);
  //         setShowAnalysis(true);
  //       } else {
  //         // Обробка помилок від API
  //         throw new Error(data.error || "Помилка отримання аналізу");
  //       }
  //     } catch (error) {
  //       let errorMessage = "Сталася невідома помилка";

  //       // Перевіряємо, чи є `error` екземпляром класу Error
  //       if (error instanceof Error) {
  //         errorMessage = error.message; // Тепер TypeScript знає, що тут є властивість `message`
  //       }

  //       console.error(errorMessage);
  //       setError(errorMessage);
  //     } finally {
  //       setAnalysisLoading(false);
  //     }
  //   };

  const handleAnalysis = () => {
    if (!document) return;

    setError(null);

    // `startTransition` повідомляє React, що ми починаємо оновлення,
    // яке може зайняти деякий час. Це дозволяє UI залишатися відгукливим.
    startTransition(async () => {
      // Просто викликаємо нашу асинхронну функцію напряму!
      const result = await analyzeDocumentAction(document.id);

      if (result.success) {
        // Якщо все добре, оновлюємо стан даними
        setAnalysis(result.data);
        setShowAnalysis(true);
      } else {
        // Якщо сталася помилка на сервері, показуємо її
        setError(result.error);
      }
    });
  };

  // Допоміжні функції для форматування
  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      council_decision: "Рішення міської ради",
      executive_decision: "Рішення виконкому",
      mayor_order: "Розпорядження мера",
      draft_decision: "Проект рішення",
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Помилка формату дати:", e);
      return "Невірна дата";
    }
  };

  // JSX для відображення сторінки
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Назад
            </button>
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Документи онлайн
                </h1>
                <p className="text-sm text-gray-600">Деталі документа</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Header */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getDocumentTypeLabel(document.document_type)}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {document.title}
              </h1>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(document.date_created)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {document.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Analysis Button */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-600" />
                  AI-Аналіз документа
                </h2>
                {!showAnalysis && (
                  <button
                    onClick={handleAnalysis}
                    disabled={isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
                  >
                    {isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Аналізую...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        <span>Отримати аналіз</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

              {showAnalysis && analysis && (
                <div className="space-y-6 animate-fade-in">
                  {/* Simple Explanation */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                      🤝 Зрозумілою мовою:
                    </h3>
                    <p className="text-blue-800">
                      {analysis.simple_explanation}
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                      📋 Короткий підсумок:
                    </h3>
                    <p className="text-green-800">{analysis.summary}</p>
                  </div>

                  {/* Key Points */}
                  {analysis.key_points && analysis.key_points.length > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                        🔍 Ключові моменти:
                      </h3>
                      <ul className="space-y-2">
                        {analysis.key_points.map((point, index) => (
                          <li
                            key={index}
                            className="flex items-start text-yellow-800"
                          >
                            <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Analysis Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Аналіз від{" "}
                        {new Date(analysis.processing_time).toLocaleString(
                          "uk-UA"
                        )}
                      </span>
                      <span>
                        Точність: {(analysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Document Content */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Повний текст документа
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
                {document.content}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Інформація про документ
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Тип документа</dt>
                  <dd className="text-gray-900">
                    {getDocumentTypeLabel(document.document_type)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Дата створення</dt>
                  <dd className="text-gray-900">
                    {formatDate(document.date_created)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">ID документа</dt>
                  <dd className="text-gray-900">#{document.id}</dd>
                </div>
              </div>
            </div>

            {/* Related Topics */}
            {analysis &&
              analysis.related_topics &&
              analysis.related_topics.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Пов&apos;язані теми
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.related_topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Дії</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  📄 <span className="ml-2">Роздрукувати</span>
                </button>
                <button
                  onClick={() =>
                    navigator.share?.({
                      title: document.title,
                      url: window.location.href,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  🔗 <span className="ml-2">Поділитися</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
