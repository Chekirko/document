"use client";

import Link from "next/link";
import { Calendar, FileText, Hash } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { formUrlQuery } from "@/lib/url";

interface TestDocument {
  id: number;
  title: string;
  content: string;
  document_type: string;
  date_created: string;
  categories: string[];
  summary?: string;
  simple_explanation?: string;
  key_points?: string[];
  confidence_score?: number;
}

interface DocumentsListProps {
  documents: TestDocument[];
  searchQuery?: string;
}

const DocumentsList = ({ documents, searchQuery }: DocumentsListProps) => {
  const searchParams = useSearchParams();

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
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const extractDocumentNumber = (title: string) => {
    const match = title.match(/№\s*(\d+)/);
    return match ? match[1] : null;
  };

  const handleCategoryClick = (category: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "category",
      value: category,
    });
    window.location.href = newUrl;
  };

  const clearAllFilters = () => {
    window.location.href = "/";
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-lg">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Документи не знайдені
        </h3>
        <p className="text-gray-600 mb-4">
          {searchQuery
            ? `За запитом "${searchQuery}" нічого не знайдено.`
            : "Спробуйте змінити параметри пошуку або використати інші фільтри."}
        </p>
        {(searchQuery || searchParams.toString()) && (
          <button
            onClick={clearAllFilters}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Очистити всі фільтри
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="text-sm text-gray-600">
        Знайдено документів: <strong>{documents.length}</strong>
        {searchQuery && (
          <span className="ml-2">
            за запитом <strong>&quot;{searchQuery}&quot;</strong>
          </span>
        )}
      </div>

      {/* Documents list */}
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {doc.title}
                {extractDocumentNumber(doc.title) && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    <Hash className="h-3 w-3 mr-1" />
                    {extractDocumentNumber(doc.title)}
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getDocumentTypeLabel(doc.document_type)}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(doc.date_created)}
                </span>
                {doc.confidence_score && (
                  <span className="text-green-600">
                    Релевантність: {(doc.confidence_score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {doc.simple_explanation && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                🤝 Зрозумілою мовою:
              </h4>
              <p className="text-blue-800">{doc.simple_explanation}</p>
            </div>
          )}

          {doc.key_points && doc.key_points.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                📋 Ключові пункти:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {doc.key_points.map((point, index) => (
                  <li key={index} className="text-gray-700">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {doc.categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer transition-colors"
                title={`Фільтрувати по категорії "${category}"`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Link
              href={`/documents/${doc.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Переглянути повний текст →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentsList;
