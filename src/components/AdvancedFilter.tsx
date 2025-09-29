"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Filter, X, Calendar, Hash } from "lucide-react";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";

const documentTypes = [
  { name: "Всі типи", value: "" },
  { name: "Рішення ради", value: "council_decision" },
  { name: "Рішення виконкому", value: "executive_decision" },
  { name: "Розпорядження мера", value: "mayor_order" },
  { name: "Проект рішення", value: "draft_decision" },
];

const categories = [
  { name: "Всі категорії", value: "" },
  { name: "Бюджет", value: "бюджет" },
  { name: "Освіта", value: "освіта" },
  { name: "Медицина", value: "медицина" },
  { name: "Транспорт", value: "транспорт" },
  { name: "Благоустрій", value: "благоустрій" },
  { name: "Комунальні послуги", value: "комунальні послуги" },
  { name: "Культура", value: "культура" },
  { name: "Спорт", value: "спорт" },
];

interface DocumentFiltersProps {
  className?: string;
}

const DocumentFilters = ({ className }: DocumentFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const documentTypeParam = searchParams.get("type") || "";
  const categoryParam = searchParams.get("category") || "";
  const dateFromParam = searchParams.get("dateFrom") || "";
  const dateToParam = searchParams.get("dateTo") || "";
  const documentNumberParam = searchParams.get("number") || "";

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    !!(dateFromParam || dateToParam || documentNumberParam)
  );

  const handleFilterChange = (key: string, value: string) => {
    let newUrl = "";

    if (
      value === "" ||
      value === documentTypeParam ||
      value === categoryParam
    ) {
      // Видаляємо фільтр, якщо вибрано "Всі" або той самий фільтр
      newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: [key],
      });
    } else {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key,
        value,
      });
    }

    router.push(newUrl, { scroll: false });
  };

  const handleDateChange = (key: string, value: string) => {
    let newUrl = "";

    if (value === "") {
      newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: [key],
      });
    } else {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key,
        value,
      });
    }

    router.push(newUrl, { scroll: false });
  };

  const clearAllFilters = () => {
    const newUrl = removeKeysFromUrlQuery({
      params: searchParams.toString(),
      keysToRemove: ["type", "category", "dateFrom", "dateTo", "number"],
    });

    router.push(newUrl, { scroll: false });
  };

  const getActiveFiltersCount = () => {
    return [
      documentTypeParam,
      categoryParam,
      dateFromParam,
      dateToParam,
      documentNumberParam,
    ].filter(Boolean).length;
  };

  const removeFilter = (key: string) => {
    const newUrl = removeKeysFromUrlQuery({
      params: searchParams.toString(),
      keysToRemove: [key],
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick filters row */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Фільтри:</span>
        </div>

        {/* Document Type Filter */}
        <select
          value={documentTypeParam}
          onChange={(e) => handleFilterChange("type", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          {documentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.name}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={categoryParam}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1 text-sm bg-white"
        >
          <Calendar className="h-4 w-4" />
          <span>Більше фільтрів</span>
          {getActiveFiltersCount() > 2 && (
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {getActiveFiltersCount() - 2}
            </span>
          )}
        </button>

        {/* Clear All Button */}
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 text-red-600 hover:text-red-700 flex items-center space-x-1 text-sm"
          >
            <X className="h-4 w-4" />
            <span>Очистити всі</span>
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Номер документа
              </label>
              <input
                type="text"
                value={documentNumberParam}
                onChange={(e) => handleDateChange("number", e.target.value)}
                placeholder="Наприклад: 156"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Пошук по номеру в назві документа
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Дата від
              </label>
              <input
                type="date"
                value={dateFromParam}
                onChange={(e) => handleDateChange("dateFrom", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Дата до
              </label>
              <input
                type="date"
                value={dateToParam}
                onChange={(e) => handleDateChange("dateTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm text-gray-600">Активні фільтри:</span>

          {documentTypeParam && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Тип:{" "}
              {documentTypes.find((t) => t.value === documentTypeParam)?.name}
              <button
                onClick={() => removeFilter("type")}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {categoryParam && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Категорія: {categoryParam}
              <button
                onClick={() => removeFilter("category")}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {documentNumberParam && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Номер: {documentNumberParam}
              <button
                onClick={() => removeFilter("number")}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {dateFromParam && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              Від: {new Date(dateFromParam).toLocaleDateString("uk-UA")}
              <button
                onClick={() => removeFilter("dateFrom")}
                className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {dateToParam && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              До: {new Date(dateToParam).toLocaleDateString("uk-UA")}
              <button
                onClick={() => removeFilter("dateTo")}
                className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentFilters;
