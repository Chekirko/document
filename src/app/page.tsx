import { Suspense } from "react";
import { FileText, Search, Bot, Clock, Tag, Calendar } from "lucide-react";
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
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

// Компонент для відображення документа
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
      className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
    >
      {/* Title - назва документа як є в системі */}
      <p className="text-xs text-gray-500 mb-2">{doc.title}</p>

      {/* Name - великими літерами, жирним шрифтом */}
      <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
        {doc.name}
      </h3>

      {/* Категорії */}
      {doc.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {doc.categories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              <Tag className="h-3 w-3 mr-1" />
              {category}
            </span>
          ))}
          {doc.categories.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              +{doc.categories.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Дата публікації */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          Дата публікації: {formatDate(doc.date_created)}
        </span>
        <span className="text-blue-600 hover:text-blue-700 font-medium">
          Детальніше →
        </span>
      </div>
    </Link>
  );
}

// Компонент для сайдбару з нещодавно доданими
function RecentDocumentsSidebar() {
  const recentDocs = testDocuments
    .sort(
      (a, b) =>
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    )
    .slice(0, 8);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-blue-600" />
        Нещодавно додані
      </h2>
      <div className="space-y-3">
        {recentDocs.map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.id}`}
            className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
              {doc.name}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(doc.date_created).toLocaleDateString("uk-UA")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Компонент для розділу документів за типом
function DocumentSection({
  title,
  documents,
  icon,
}: {
  title: string;
  documents: TestDocument[];
  icon: string;
}) {
  if (documents.length === 0) return null;

  // Показуємо тільки 5 останніх документів, відсортованих за датою
  const latestDocuments = documents
    .sort(
      (a, b) =>
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    )
    .slice(0, 5);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center pb-3 border-b-2 border-blue-600">
        <span className="text-2xl mr-2">{icon}</span>
        {title}
        <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Документів: {documents.length}
        </span>
      </h2>
      <div className="space-y-4">
        {latestDocuments.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>

      {/* Кнопка "Усі" - поки заглушка */}
      <Link
        href="/documents" // сюди постав шлях, куди має вести "Усі"
        className="mt-4 block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
      >
        Усі
      </Link>
    </div>
  );
}

// Основний компонент зі списком документів
function DocumentsMainContent({
  documents,
  searchQuery,
}: {
  documents: TestDocument[];
  searchQuery?: string;
}) {
  // Групуємо документи за типом
  const councilDocs = documents.filter(
    (d) => d.document_type === "council_decision"
  );
  const executiveDocs = documents.filter(
    (d) => d.document_type === "executive_decision"
  );
  const mayorDocs = documents.filter((d) => d.document_type === "mayor_order");

  if (documents.length === 0) {
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
    <div>
      {searchQuery && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            Знайдено результатів:{" "}
            <span className="font-bold">{documents.length}</span>
            {searchQuery && ` за запитом "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Дві колонки для основних розділів */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ліва колонка */}
        <div className="space-y-6">
          {/* Міська рада - зверху лівої колонки */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <DocumentSection
              title="Міська рада"
              documents={councilDocs}
              icon="🏛️"
            />
          </div>

          {/* Розпорядження - знизу лівої колонки */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <DocumentSection
              title="Розпорядження"
              documents={mayorDocs}
              icon="📋"
            />
          </div>
        </div>

        {/* Права колонка */}
        <div>
          {/* Виконавчий комітет - зверху правої колонки */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <DocumentSection
              title="Виконавчий комітет"
              documents={executiveDocs}
              icon="⚖️"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage(props: PageProps) {
  const params = await props.searchParams;
  const activeTab = params.tab || "search";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Документи онлайн
                </h1>
                <p className="text-sm text-gray-600">
                  Інтелектуальний портал документів міської ради
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <Link
              href="/?tab=search"
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === "search"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Пошук документів</span>
            </Link>
            <Link
              href="/?tab=chat"
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === "chat"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>AI-Асистент</span>
            </Link>
          </div>
        </div>

        {activeTab === "search" ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-4">
                <Suspense
                  fallback={
                    <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  }
                >
                  <DocumentSearch />
                </Suspense>

                <Suspense
                  fallback={
                    <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                  }
                >
                  <DocumentFilters />
                </Suspense>
              </div>
            </div>

            {/* Main Layout: Sidebar + Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - 1 column */}
              <div className="lg:col-span-1">
                <Suspense
                  fallback={
                    <div className="bg-white rounded-lg shadow-lg p-6 h-96 animate-pulse"></div>
                  }
                >
                  <RecentDocumentsSidebar />
                </Suspense>
              </div>

              {/* Main Content - 3 columns */}
              <div className="lg:col-span-3">
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
                    documents={filteredDocuments}
                    searchQuery={params.query}
                  />
                </Suspense>
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
            <ChatInterface />
          </Suspense>
        )}
      </div>
    </div>
  );
}
