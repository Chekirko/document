// "use client";

// import { useState, useEffect } from "react";
// import {
//   ArrowLeft,
//   FileText,
//   Calendar,
//   Tag,
//   Brain,
//   Clock,
//   AlertCircle,
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// interface DocumentAnalysis {
//   id: number;
//   summary: string;
//   simple_explanation: string;
//   key_points: string[];
//   related_topics: string[];
//   confidence: number;
//   processing_time: string;
// }

// interface TestDocument {
//   id: number;
//   title: string;
//   content: string;
//   document_type: string;
//   date_created: string;
//   categories: string[];
//   summary?: string;
//   simple_explanation?: string;
//   key_points?: string[];
// }

// interface DocumentDetailPageProps {
//   params: { id: string };
// }

// export default function DocumentDetailPage({
//   params,
// }: DocumentDetailPageProps) {
//   const router = useRouter();
//   const [document, setDocument] = useState<TestDocument | null>(null);
//   const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [analysisLoading, setAnalysisLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showAnalysis, setShowAnalysis] = useState(false);

//   useEffect(() => {
//     if (params.id) {
//       fetchDocument();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [params.id]);

//   // const fetchDocument = async () => {
//   //   try {
//   //     setLoading(true);
//   //     // Спочатку отримуємо всі документи і знаходимо потрібний
//   //     const response = await fetch("/api/documents");
//   //     const data = await response.json();

//   //     const foundDoc = data.documents.find(
//   //       (doc: TestDocument) => doc.id === parseInt(params.id)
//   //     );

//   //     if (!foundDoc) {
//   //       setError("Документ не знайдено");
//   //       return;
//   //     }

//   //     setDocument(foundDoc);
//   //   } catch (error) {
//   //     console.error("Помилка завантаження документа:", error);
//   //     setError("Помилка завантаження документа");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const fetchDocument = async () => {
//     try {
//       setLoading(true);
//       setError(null); // Скидаємо помилку перед новим запитом

//       // === ЗМІНЕНО: Запитуємо конкретний документ за його ID ===
//       const response = await fetch(`/api/documents/${params.id}`);

//       if (!response.ok) {
//         if (response.status === 404) {
//           setError("Документ не знайдено");
//         } else {
//           throw new Error("Не вдалося завантажити документ");
//         }
//         return;
//       }

//       const foundDoc = await response.json();
//       setDocument(foundDoc);
//       // =======================================================
//     } catch (err) {
//       console.error("Помилка завантаження документа:", err);
//       setError("Помилка завантаження документа");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAnalysis = async () => {
//     if (!document) return;

//     try {
//       setAnalysisLoading(true);
//       const response = await fetch(`/api/documents/${document.id}/analyze`);
//       const data = await response.json();

//       if (response.ok) {
//         setAnalysis(data);
//         setShowAnalysis(true);
//       } else {
//         setError("Помилка отримання аналізу");
//       }
//     } catch (error) {
//       console.error("Помилка аналізу:", error);
//       setError("Помилка аналізу документа");
//     } finally {
//       setAnalysisLoading(false);
//     }
//   };

//   const getDocumentTypeLabel = (type: string) => {
//     const types: Record<string, string> = {
//       council_decision: "Рішення міської ради",
//       executive_decision: "Рішення виконкому",
//       mayor_order: "Розпорядження мера",
//       draft_decision: "Проект рішення",
//     };
//     return types[type] || type;
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("uk-UA", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Завантаження документа...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !document) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">
//             {error || "Документ не знайдено"}
//           </h2>
//           <button
//             onClick={() => router.back()}
//             className="text-blue-600 hover:text-blue-800 font-medium"
//           >
//             ← Повернутися назад
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white shadow-lg border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center py-6">
//             <button
//               onClick={() => router.back()}
//               className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
//             >
//               <ArrowLeft className="h-5 w-5 mr-1" />
//               Назад
//             </button>
//             <div className="flex items-center space-x-3">
//               <FileText className="h-8 w-8 text-blue-600" />
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   Документи онлайн
//                 </h1>
//                 <p className="text-sm text-gray-600">Деталі документа</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Document Header */}
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <div className="mb-4">
//                 <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
//                   {getDocumentTypeLabel(document.document_type)}
//                 </span>
//               </div>

//               <h1 className="text-2xl font-bold text-gray-900 mb-4">
//                 {document.title}
//               </h1>

//               <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
//                 <span className="flex items-center">
//                   <Calendar className="h-4 w-4 mr-1" />
//                   {formatDate(document.date_created)}
//                 </span>
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 {document.categories.map((category) => (
//                   <span
//                     key={category}
//                     className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
//                   >
//                     <Tag className="h-3 w-3 mr-1" />
//                     {category}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* AI Analysis Button */}
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-gray-900 flex items-center">
//                   <Brain className="h-5 w-5 mr-2 text-blue-600" />
//                   AI-Аналіз документа
//                 </h2>
//                 {!showAnalysis && (
//                   <button
//                     onClick={fetchAnalysis}
//                     disabled={analysisLoading}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
//                   >
//                     {analysisLoading ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                         <span>Аналізую...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Brain className="h-4 w-4" />
//                         <span>Отримати аналіз</span>
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>

//               {showAnalysis && analysis && (
//                 <div className="space-y-6">
//                   {/* Simple Explanation */}
//                   <div className="p-4 bg-blue-50 rounded-lg">
//                     <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
//                       🤝 Зрозумілою мовою:
//                     </h3>
//                     <p className="text-blue-800">
//                       {analysis.simple_explanation}
//                     </p>
//                   </div>

//                   {/* Summary */}
//                   <div className="p-4 bg-green-50 rounded-lg">
//                     <h3 className="font-semibold text-green-900 mb-2 flex items-center">
//                       📋 Короткий підсумок:
//                     </h3>
//                     <p className="text-green-800">{analysis.summary}</p>
//                   </div>

//                   {/* Key Points */}
//                   {analysis.key_points && analysis.key_points.length > 0 && (
//                     <div className="p-4 bg-yellow-50 rounded-lg">
//                       <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
//                         🔍 Ключові моменти:
//                       </h3>
//                       <ul className="space-y-2">
//                         {analysis.key_points.map((point, index) => (
//                           <li
//                             key={index}
//                             className="flex items-start text-yellow-800"
//                           >
//                             <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                             <span>{point}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}

//                   {/* Analysis Metadata */}
//                   <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
//                     <div className="flex items-center space-x-4">
//                       <span className="flex items-center">
//                         <Clock className="h-4 w-4 mr-1" />
//                         Аналіз від{" "}
//                         {new Date(analysis.processing_time).toLocaleString(
//                           "uk-UA"
//                         )}
//                       </span>
//                       <span>
//                         Точність: {(analysis.confidence * 100).toFixed(0)}%
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Document Content */}
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                 Повний текст документа
//               </h2>
//               <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
//                 {document.content}
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Document Info */}
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h3 className="font-semibold text-gray-900 mb-4">
//                 Інформація про документ
//               </h3>
//               <div className="space-y-3 text-sm">
//                 <div>
//                   <dt className="font-medium text-gray-500">Тип документа</dt>
//                   <dd className="text-gray-900">
//                     {getDocumentTypeLabel(document.document_type)}
//                   </dd>
//                 </div>
//                 <div>
//                   <dt className="font-medium text-gray-500">Дата створення</dt>
//                   <dd className="text-gray-900">
//                     {formatDate(document.date_created)}
//                   </dd>
//                 </div>
//                 <div>
//                   <dt className="font-medium text-gray-500">ID документа</dt>
//                   <dd className="text-gray-900">#{document.id}</dd>
//                 </div>
//               </div>
//             </div>

//             {/* Related Topics */}
//             {analysis &&
//               analysis.related_topics &&
//               analysis.related_topics.length > 0 && (
//                 <div className="bg-white rounded-lg shadow-lg p-6">
//                   <h3 className="font-semibold text-gray-900 mb-4">
//                     Пов&apos;язані теми
//                   </h3>
//                   <div className="space-y-2">
//                     {analysis.related_topics.map((topic) => (
//                       <span
//                         key={topic}
//                         className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm mr-2 mb-2"
//                       >
//                         {topic}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//             {/* Actions */}
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h3 className="font-semibold text-gray-900 mb-4">Дії</h3>
//               <div className="space-y-3">
//                 <button
//                   onClick={() => window.print()}
//                   className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   📄 Роздрукувати
//                 </button>
//                 <button
//                   onClick={() =>
//                     navigator.share?.({
//                       title: document.title,
//                       url: window.location.href,
//                     })
//                   }
//                   className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   🔗 Поділитися
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { getDocumentById } from "@/lib/actions/actions"; // Імпортуємо нашу функцію
import DocumentView from "@/components/DocumentView"; // Це буде наш новий клієнтський компонент
import { notFound } from "next/navigation";

interface DocumentDetailPageProps {
  params: { id: string };
}

// Сторінка тепер є асинхронною функцією!
export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;
  const documentId = parseInt(id);

  // Перевіряємо, чи ID є числом
  if (isNaN(documentId)) {
    return notFound(); // Стандартна сторінка 404 від Next.js
  }

  // Отримуємо дані прямо на сервері. Більше ніяких useEffect для початкового завантаження!
  const document = await getDocumentById(documentId);

  // Якщо документ не знайдено, показуємо сторінку 404
  if (!document) {
    return notFound();
  }

  // Ми передаємо отримані дані в чисто клієнтський компонент,
  // який буде відповідати за інтерактивність (кнопки, аналіз і т.д.)
  return <DocumentView initialDocument={document} />;
}
