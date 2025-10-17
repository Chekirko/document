import { Suspense } from "react";
import Link from "next/link";

import DocumentSearch from "@/components/Search";
import DocumentFilters from "@/components/AdvancedFilter";
import ChatInterface from "@/components/home/ChatInterface";
import { testDocuments } from "@/data/test-documents";
import { SearchUtils } from "@/lib/search-utils";
import { Pagination } from "@/components/home/Pagination";
import { DocumentsMainContent } from "@/components/home/DocumentsMainContent";
import { PageProps } from "@/types";
import { NavigationTabs } from "@/components/home/NavigationTabs";

export default async function HomePage(props: PageProps) {
  const params = await props.searchParams;
  const activeTab = params.tab || "chat";
  const currentView = params.view || "accepted";
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = 12;

  // Фільтруємо документи на сервері на основі URL параметрів
  let filteredDocuments = [...testDocuments];

  // Фільтр за типом документа
  if (params.type) {
    filteredDocuments = filteredDocuments.filter(
      (doc) => doc.document_type === params.type
    );
  }

  // Фільтр за категорією
  if (params.category) {
    filteredDocuments = filteredDocuments.filter((doc) =>
      doc.categories.some((cat) =>
        cat.toLowerCase().includes(params.category!.toLowerCase())
      )
    );
  }

  // Фільтр за номером документа
  if (params.number) {
    filteredDocuments = filteredDocuments.filter((doc) => {
      const match = doc.title.match(/№\s*(\d+)/);
      return match && match[1].includes(params.number!);
    });
  }

  // Фільтр за датою "від"
  if (params.dateFrom) {
    const dateFrom = new Date(params.dateFrom);
    filteredDocuments = filteredDocuments.filter((doc) => {
      const docDate = new Date(doc.date_created);
      return docDate >= dateFrom;
    });
  }

  // Фільтр за датою "до"
  if (params.dateTo) {
    const dateTo = new Date(params.dateTo);
    filteredDocuments = filteredDocuments.filter((doc) => {
      const docDate = new Date(doc.date_created);
      return docDate <= dateTo;
    });
  }

  // ПОШУК - виконується тільки якщо є query
  if (params.query) {
    const searchMode = params.mode || "simple";

    if (searchMode === "ai") {
      const { aiService } = await import("@/lib/ai-service");

      try {
        console.log(`Starting AI search for query: "${params.query}"`);
        const searchResults = await aiService.semanticSearch(
          params.query,
          filteredDocuments,
          20
        );

        if (searchResults.length === 0) {
          const fallbackResults = SearchUtils.performSemanticSearch(
            params.query,
            filteredDocuments,
            20
          );
          filteredDocuments = fallbackResults;
        } else {
          filteredDocuments = searchResults;
        }
      } catch (error) {
        console.error("AI search error, falling back to simple search:", error);
        const searchResults = SearchUtils.performSemanticSearch(
          params.query,
          filteredDocuments,
          20
        );
        filteredDocuments = searchResults;
      }
    } else {
      const searchResults = SearchUtils.performSemanticSearch(
        params.query,
        filteredDocuments,
        20
      );
      filteredDocuments = searchResults;
    }
  }

  // Пагінація
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Формуємо базовий URL для пагінації
  const baseUrl = `/?tab=${activeTab}&view=${currentView}${
    params.query ? `&query=${params.query}` : ""
  }${params.type ? `&type=${params.type}` : ""}${
    params.category ? `&category=${params.category}` : ""
  }${params.dateFrom ? `&dateFrom=${params.dateFrom}` : ""}${
    params.dateTo ? `&dateTo=${params.dateTo}` : ""
  }${params.number ? `&number=${params.number}` : ""}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <NavigationTabs activeTab={activeTab} />

        {activeTab === "search" ? (
          <div className="space-y-6">
            {/* Перемикач Проекти / Прийняті */}
            <div className="flex space-x-4 border-gray-300 pb-2 mb-6">
              <Link
                href={`/?tab=search&view=projects`}
                className={`pb-2 px-1 ${
                  currentView === "projects"
                    ? "border-b-2 border-black font-medium pointer-events-none"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Проєкти
              </Link>
              <Link
                href={`/?tab=search&view=accepted`}
                className={`pb-2 px-1 ${
                  currentView === "accepted"
                    ? "border-b-2 border-black font-medium pointer-events-none"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Прийняті
              </Link>
            </div>

            <h4 className="text-2xl font-bold mb-6">Рішення громади</h4>

            {/* Main Layout: Content + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - 2 columns */}
              <div className="lg:col-span-2">
                <Suspense
                  fallback={
                    <div className="text-center py-12 bg-white rounded-lg shadow-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">
                        Завантаження документів...
                      </p>
                    </div>
                  }
                >
                  <DocumentsMainContent
                    documents={paginatedDocuments}
                    searchQuery={params.query}
                    currentView={currentView}
                  />
                </Suspense>

                {/* Пагінація */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl={baseUrl}
                  />
                )}
              </div>

              {/* Sidebar - 1 column */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-6">
                  {/* Пошук */}
                  <Suspense
                    fallback={
                      <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                    }
                  >
                    <DocumentSearch />
                  </Suspense>

                  {/* Фільтри */}
                  <Suspense
                    fallback={
                      <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    }
                  >
                    <DocumentFilters />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="bg-white rounded-lg shadow-lg h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Завантаження чату...</p>
                </div>
              </div>
            }
          >
            <div className="bg-accent-main text-white text-center py-8 rounded-xl shadow-lg mb-8 animate-fade-in">
              <h2 className="text-3xl font-bold mb-2">
                Запитай про потрібний тобі документ простою мовою 💬
              </h2>
            </div>
            <ChatInterface />
          </Suspense>
        )}
      </div>
    </div>
  );
}
