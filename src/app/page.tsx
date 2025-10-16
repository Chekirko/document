import { Suspense } from "react";
import { FileText, Search, Bot } from "lucide-react";
import Link from "next/link";

import DocumentSearch from "@/components/Search";
import DocumentFilters from "@/components/AdvancedFilter";
import ChatInterface from "@/components/home/ChatInterface";
import { testDocuments } from "@/data/test-documents";
import { SearchUtils } from "@/lib/search-utils";
import type { TestDocument } from "@/types";

interface SearchParams {
  query?: string;
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  number?: string;
  tab?: string;
  mode?: string;
  view?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

function DocumentCard({ doc }: { doc: TestDocument }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Link
      href={`/documents/${doc.id}`}
      className="group block border-black pt-5 pb-8 transition-all rounded-lg p-4"
    >
      {/* Дата публікації */}
      <p className="text-sm md:text-base leading-5 mb-5 pb-2.5 border-b-2 border-black">
        {formatDate(doc.date_created)}
      </p>

      {/* Назва документа - Title + Name */}
      <h4 className="text-lg md:text-xl lg:text-2xl leading-[1.2] md:leading-[1.25] lg:leading-[1.3] font-normal pr-8 md:pr-10 relative">
        <span className="line-clamp-6">
          {doc.title}
          {doc.name && ` «${doc.name}»`}
        </span>

        {/* Стрілка при ховері */}
        <span className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg
            width="24"
            height="24"
            className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.097 8.13h16.064v16h-2V11.535L8.803 24.838 7.392 23.42 20.74 10.129H8.097v-2Z"
              fill="#000"
            />
          </svg>
        </span>
      </h4>
    </Link>
  );
}

// Компонент зі списком документів
function DocumentsMainContent({
  documents,
  searchQuery,
  currentView,
}: {
  documents: TestDocument[];
  searchQuery?: string;
  currentView: string;
}) {
  // Фільтруємо документи за типом перегляду
  const filteredDocs =
    currentView === "projects"
      ? documents.filter((d) => d.document_type === "draft_decision")
      : documents.filter((d) => d.document_type !== "draft_decision");

  if (filteredDocs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Документи не знайдено
        </h3>
        <p className="text-gray-600">
          Спробуйте змінити параметри пошуку або фільтри
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {searchQuery && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            Знайдено результатів:{" "}
            <span className="font-bold">{filteredDocs.length}</span>
            {searchQuery && ` за запитом "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Сітка документів - дві колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
}

// Компонент пагінації
function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}) {
  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, "http://localhost");
    url.searchParams.set("page", page.toString());
    return url.pathname + url.search;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // Перша сторінка
    if (startPage > 1) {
      pages.push(
        <Link key={1} href={getPageUrl(1)}>
          <li
            className={`page ${
              currentPage === 1 ? "active" : ""
            } border-2 border-transparent rounded-full px-3 py-1 cursor-pointer hover:border-black`}
          >
            1
          </li>
        </Link>
      );
      if (startPage > 2) {
        pages.push(
          <li key="dots1" className="page inactive px-2">
            ...
          </li>
        );
      }
    }

    // Сторінки між
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link key={i} href={getPageUrl(i)}>
          <li
            className={`page ${
              currentPage === i ? "active border-black" : ""
            } border-2 border-transparent rounded-full px-3 py-1 cursor-pointer hover:border-black`}
          >
            {i}
          </li>
        </Link>
      );
    }

    // Остання сторінка
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <li key="dots2" className="page inactive px-2">
            ...
          </li>
        );
      }
      pages.push(
        <Link key={totalPages} href={getPageUrl(totalPages)}>
          <li
            className={`page ${
              currentPage === totalPages ? "active" : ""
            } border-2 border-transparent rounded-full px-3 py-1 cursor-pointer hover:border-black`}
          >
            {totalPages}
          </li>
        </Link>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-between items-center border-t-2 border-black pt-5 mt-8">
      {/* Попередня сторінка */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center text-black hover:underline"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M23.2588 12.0021L2.00012 11.9566M2.00012 11.9566L12.6521 22.6086M2.00012 11.9566L12.6067 1.35001"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
          <p>Попередня сторінка</p>
        </Link>
      ) : (
        <div className="flex items-center text-gray-400">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M23.2588 12.0021L2.00012 11.9566M2.00012 11.9566L12.6521 22.6086M2.00012 11.9566L12.6067 1.35001"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <p>Попередня сторінка</p>
        </div>
      )}

      {/* Номери сторінок */}
      <ul className="flex items-center space-x-2">{renderPageNumbers()}</ul>

      {/* Наступна сторінка */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center text-black hover:underline"
        >
          <p>Наступна сторінка</p>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2"
          >
            <path
              d="M1 11.9566L22.2587 12.0021M22.2587 12.0021L11.6067 1.3501M22.2587 12.0021L11.6521 22.6087"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
        </Link>
      ) : (
        <div className="flex items-center text-gray-400">
          <p>Наступна сторінка</p>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2"
          >
            <path
              d="M1 11.9566L22.2587 12.0021M22.2587 12.0021L11.6067 1.3501M22.2587 12.0021L11.6521 22.6087"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

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
        const searchResults = await aiService.hybridSearch(
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
        <div className="mb-8">
          <div className="flex space-x-1 bg-transparent rounded-lg p-1">
            {/* AI-Асистент зліва */}
            <Link
              href="/?tab=chat"
              className={`flex items-center space-x-2 px-6 py-3 font-medium  ${
                activeTab === "chat"
                  ? "border-b border-black pointer-events-none"
                  : "text-gray-600 hover:text-gray-900 "
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>AI-Асистент</span>
            </Link>
            {/* Пошук справа */}
            <Link
              href="/?tab=search"
              className={`flex items-center space-x-2 px-6 py-3  font-medium  ${
                activeTab === "search"
                  ? "border-b border-black pointer-events-none"
                  : "text-gray-600 hover:text-gray-900 "
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Пошук документів</span>
            </Link>
          </div>
        </div>

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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-8 rounded-xl shadow-lg mb-8 animate-fade-in">
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
