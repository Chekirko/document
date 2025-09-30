"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";

interface DocumentSearchProps {
  placeholder?: string;
  otherClasses?: string;
}

const DocumentSearch = ({
  placeholder = "Введіть ваш запит... (наприклад: 'ремонт доріг' або 'виділення коштів')",
  otherClasses = "",
}: DocumentSearchProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const searchMode = searchParams.get("mode") || "simple";

  const [searchQuery, setSearchQuery] = useState(query);
  const [isAISearching, setIsAISearching] = useState(false);

  // Простий пошук з debounce (працює автоматично)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        // Якщо режим був AI, змінюємо на простий при зміні тексту
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });

        // Видаляємо режим AI якщо він був
        const finalUrl = removeKeysFromUrlQuery({
          params: new URL(newUrl, window.location.origin).search.slice(1),
          keysToRemove: ["mode"],
        });

        router.push(finalUrl, { scroll: false });
      } else {
        if (pathname === "/") {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query", "mode"],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, searchParams, pathname]);

  // AI семантичний пошук (тільки по кліку)
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setIsAISearching(true);

    try {
      // Додаємо режим AI до URL
      let newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "query",
        value: searchQuery,
      });

      newUrl = formUrlQuery({
        params: new URL(newUrl, window.location.origin).search.slice(1),
        key: "mode",
        value: "ai",
      });

      router.push(newUrl, { scroll: false });
    } catch (error) {
      console.error("AI search error:", error);
    } finally {
      // Затримка для UX (показати що щось відбувається)
      setTimeout(() => setIsAISearching(false), 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      // Shift+Enter = AI пошук
      e.preventDefault();
      handleAISearch();
    }
  };

  return (
    <div className={`flex gap-2 ${otherClasses}`}>
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        {searchMode === "ai" && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              AI пошук
            </span>
          </div>
        )}
      </div>

      {/* Кнопка AI пошуку */}
      <button
        onClick={handleAISearch}
        disabled={!searchQuery.trim() || isAISearching}
        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
        title="Семантичний пошук через AI (Shift+Enter)"
      >
        {isAISearching ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="hidden sm:inline">AI шукає...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI пошук</span>
          </>
        )}
      </button>

      {/* {searchQuery && (
        <div className="text-xs text-gray-500 px-1">
          Натисніть{" "}
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">
            Shift+Enter
          </kbd>{" "}
          для AI пошуку
        </div>
      )} */}
    </div>
  );
};

export default DocumentSearch;
