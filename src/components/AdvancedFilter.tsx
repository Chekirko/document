// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import { Filter, X, Calendar, Hash } from "lucide-react";

// import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
// import { cn } from "@/lib/utils";

// const documentTypes = [
//   { name: "Всі типи", value: "" },
//   { name: "Рішення ради", value: "council_decision" },
//   { name: "Рішення виконкому", value: "executive_decision" },
//   { name: "Розпорядження мера", value: "mayor_order" },
//   { name: "Проект рішення", value: "draft_decision" },
// ];

// const categories = [
//   { name: "Всі категорії", value: "" },
//   { name: "Бюджет", value: "бюджет" },
//   { name: "Освіта", value: "освіта" },
//   { name: "Медицина", value: "медицина" },
//   { name: "Транспорт", value: "транспорт" },
//   { name: "Благоустрій", value: "благоустрій" },
//   { name: "Комунальні послуги", value: "комунальні послуги" },
//   { name: "Культура", value: "культура" },
//   { name: "Спорт", value: "спорт" },
// ];

// interface DocumentFiltersProps {
//   className?: string;
// }

// const DocumentFilters = ({ className }: DocumentFiltersProps) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const documentTypeParam = searchParams.get("type") || "";
//   const categoryParam = searchParams.get("category") || "";
//   const dateFromParam = searchParams.get("dateFrom") || "";
//   const dateToParam = searchParams.get("dateTo") || "";
//   const documentNumberParam = searchParams.get("number") || "";

//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(
//     !!(dateFromParam || dateToParam || documentNumberParam)
//   );

//   const handleFilterChange = (key: string, value: string) => {
//     let newUrl = "";

//     if (
//       value === "" ||
//       value === documentTypeParam ||
//       value === categoryParam
//     ) {
//       // Видаляємо фільтр, якщо вибрано "Всі" або той самий фільтр
//       newUrl = removeKeysFromUrlQuery({
//         params: searchParams.toString(),
//         keysToRemove: [key],
//       });
//     } else {
//       newUrl = formUrlQuery({
//         params: searchParams.toString(),
//         key,
//         value,
//       });
//     }

//     router.push(newUrl, { scroll: false });
//   };

//   const handleDateChange = (key: string, value: string) => {
//     let newUrl = "";

//     if (value === "") {
//       newUrl = removeKeysFromUrlQuery({
//         params: searchParams.toString(),
//         keysToRemove: [key],
//       });
//     } else {
//       newUrl = formUrlQuery({
//         params: searchParams.toString(),
//         key,
//         value,
//       });
//     }

//     router.push(newUrl, { scroll: false });
//   };

//   const clearAllFilters = () => {
//     const newUrl = removeKeysFromUrlQuery({
//       params: searchParams.toString(),
//       keysToRemove: ["type", "category", "dateFrom", "dateTo", "number"],
//     });

//     router.push(newUrl, { scroll: false });
//   };

//   const getActiveFiltersCount = () => {
//     return [
//       documentTypeParam,
//       categoryParam,
//       dateFromParam,
//       dateToParam,
//       documentNumberParam,
//     ].filter(Boolean).length;
//   };

//   const removeFilter = (key: string) => {
//     const newUrl = removeKeysFromUrlQuery({
//       params: searchParams.toString(),
//       keysToRemove: [key],
//     });

//     router.push(newUrl, { scroll: false });
//   };

//   return (
//     <div className={cn("space-y-4", className)}>
//       {/* Quick filters row */}
//       <div className="flex gap-4 items-center flex-wrap">
//         <div className="flex items-center space-x-2">
//           <Filter className="h-4 w-4 text-gray-500" />
//           <span className="text-sm text-gray-600">Фільтри:</span>
//         </div>

//         {/* Document Type Filter */}
//         <select
//           value={documentTypeParam}
//           onChange={(e) => handleFilterChange("type", e.target.value)}
//           className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm bg-white"
//         >
//           {documentTypes.map((type) => (
//             <option key={type.value} value={type.value}>
//               {type.name}
//             </option>
//           ))}
//         </select>

//         {/* Category Filter */}
//         <select
//           value={categoryParam}
//           onChange={(e) => handleFilterChange("category", e.target.value)}
//           className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm bg-white"
//         >
//           {categories.map((category) => (
//             <option key={category.value} value={category.value}>
//               {category.name}
//             </option>
//           ))}
//         </select>

//         {/* Advanced Filters Toggle */}
//         <button
//           onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//           className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1 text-sm bg-white"
//         >
//           <Calendar className="h-4 w-4" />
//           <span>Більше фільтрів</span>
//           {getActiveFiltersCount() > 2 && (
//             <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//               {getActiveFiltersCount() - 2}
//             </span>
//           )}
//         </button>

//         {/* Clear All Button */}
//         {getActiveFiltersCount() > 0 && (
//           <button
//             onClick={clearAllFilters}
//             className="px-3 py-2 text-red-600 hover:text-red-700 flex items-center space-x-1 text-sm"
//           >
//             <X className="h-4 w-4" />
//             <span>Очистити всі</span>
//           </button>
//         )}
//       </div>

//       {/* Advanced filters */}
//       {showAdvancedFilters && (
//         <div className="border-t border-gray-200 pt-4 animate-fade-in">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <Hash className="h-4 w-4 inline mr-1" />
//                 Номер документа
//               </label>
//               <input
//                 type="text"
//                 value={documentNumberParam}
//                 onChange={(e) => handleDateChange("number", e.target.value)}
//                 placeholder="Наприклад: 156"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Пошук по номеру в назві документа
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <Calendar className="h-4 w-4 inline mr-1" />
//                 Дата від
//               </label>
//               <input
//                 type="date"
//                 value={dateFromParam}
//                 onChange={(e) => handleDateChange("dateFrom", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <Calendar className="h-4 w-4 inline mr-1" />
//                 Дата до
//               </label>
//               <input
//                 type="date"
//                 value={dateToParam}
//                 onChange={(e) => handleDateChange("dateTo", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Active filters display */}
//       {getActiveFiltersCount() > 0 && (
//         <div className="flex flex-wrap gap-2 pt-2">
//           <span className="text-sm text-gray-600">Активні фільтри:</span>

//           {documentTypeParam && (
//             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
//               Тип:{" "}
//               {documentTypes.find((t) => t.value === documentTypeParam)?.name}
//               <button
//                 onClick={() => removeFilter("type")}
//                 className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//               >
//                 <X className="h-3 w-3" />
//               </button>
//             </span>
//           )}

//           {categoryParam && (
//             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
//               Категорія: {categoryParam}
//               <button
//                 onClick={() => removeFilter("category")}
//                 className="ml-1 hover:bg-green-200 rounded-full p-0.5"
//               >
//                 <X className="h-3 w-3" />
//               </button>
//             </span>
//           )}

//           {documentNumberParam && (
//             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
//               Номер: {documentNumberParam}
//               <button
//                 onClick={() => removeFilter("number")}
//                 className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
//               >
//                 <X className="h-3 w-3" />
//               </button>
//             </span>
//           )}

//           {dateFromParam && (
//             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
//               Від: {new Date(dateFromParam).toLocaleDateString("uk-UA")}
//               <button
//                 onClick={() => removeFilter("dateFrom")}
//                 className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
//               >
//                 <X className="h-3 w-3" />
//               </button>
//             </span>
//           )}

//           {dateToParam && (
//             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
//               До: {new Date(dateToParam).toLocaleDateString("uk-UA")}
//               <button
//                 onClick={() => removeFilter("dateTo")}
//                 className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
//               >
//                 <X className="h-3 w-3" />
//               </button>
//             </span>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentFilters;

"use client";

import { useSearchParams, useRouter } from "next/navigation";
// import { useState } from "react";

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

const years = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

const months = [
  { name: "Січень", value: "1" },
  { name: "Лютий", value: "2" },
  { name: "Березень", value: "3" },
  { name: "Квітень", value: "4" },
  { name: "Травень", value: "5" },
  { name: "Червень", value: "6" },
  { name: "Липень", value: "7" },
  { name: "Серпень", value: "8" },
  { name: "Вересень", value: "9" },
  { name: "Жовтень", value: "10" },
  { name: "Листопад", value: "11" },
  { name: "Грудень", value: "12" },
];

interface DocumentFiltersProps {
  className?: string;
}

const DocumentFilters = ({ className }: DocumentFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const documentTypeParam = searchParams.get("type") || "";
  const categoryParam = searchParams.get("category") || "";
  // const dateFromParam = searchParams.get("dateFrom") || "";
  // const dateToParam = searchParams.get("dateTo") || "";
  const documentNumberParam = searchParams.get("number") || "";
  const titleParam = searchParams.get("title") || "";
  const contentParam = searchParams.get("content") || "";
  const yearParam = searchParams.get("year") || "";
  const monthParam = searchParams.get("month") || "";
  const typeDateParam = searchParams.get("type_date") || "0";

  const handleFilterChange = (key: string, value: string) => {
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

  // const clearAllFilters = () => {
  //   const newUrl = removeKeysFromUrlQuery({
  //     params: searchParams.toString(),
  //     keysToRemove: [
  //       "type",
  //       "category",
  //       "dateFrom",
  //       "dateTo",
  //       "number",
  //       "title",
  //       "content",
  //       "year",
  //       "month",
  //       "type_date",
  //     ],
  //   });

  //   router.push(newUrl, { scroll: false });
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className={cn("w-full bg-transparent", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Назва */}
        <div className="relative">
          <input
            type="text"
            value={titleParam}
            onChange={(e) => handleFilterChange("title", e.target.value)}
            placeholder=" "
            id="search-title"
            autoComplete="off"
            className="w-full px-0 py-2 border-b-2 border-black  outline-none transition-colors peer bg-transparent"
          />
          <label
            htmlFor="search-title"
            className="absolute left-0 top-2 text-gray-500 transition-all duration-200 pointer-events-none
                       peer-focus:text-xs peer-focus:-top-4 peer-focus:text-black
                       peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
          >
            Назва
          </label>
        </div>

        {/* Зміст */}
        <div className="relative">
          <input
            type="text"
            value={contentParam}
            onChange={(e) => handleFilterChange("content", e.target.value)}
            placeholder=" "
            id="search-content"
            autoComplete="off"
            className="w-full px-0 py-2 border-b-2 border-black focus:border-black outline-none transition-colors peer bg-transparent"
          />
          <label
            htmlFor="search-content"
            className="absolute left-0 top-2 text-gray-500 transition-all duration-200 pointer-events-none
                       peer-focus:text-xs peer-focus:-top-4 peer-focus:text-black
                       peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
          >
            Зміст
          </label>
        </div>

        {/* Рік */}
        <div className="relative">
          <select
            value={yearParam}
            onChange={(e) => handleFilterChange("year", e.target.value)}
            className="w-full px-3 py-3 bg-transparent rounded border-none outline-none appearance-none cursor-pointer text-gray-700
                       focus:ring-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            <option value="" disabled>
              Рік
            </option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Місяць */}
        <div className="relative">
          <select
            value={monthParam}
            onChange={(e) => handleFilterChange("month", e.target.value)}
            className="w-full px-3 py-3 bg-transparent rounded border-none outline-none appearance-none cursor-pointer text-gray-700
                       focus:ring-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            <option value="" disabled>
              Місяць
            </option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.name}
              </option>
            ))}
          </select>
        </div>

        {/* По даті публікації/документа */}
        <div className="relative">
          <select
            value={typeDateParam}
            onChange={(e) => handleFilterChange("type_date", e.target.value)}
            className="w-full px-3 py-3 bg-transparent rounded border-none outline-none appearance-none cursor-pointer text-gray-700
                       focus:ring-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            <option value="0">По даті публікації</option>
            <option value="1">По даті документа</option>
          </select>
        </div>

        {/* Номер */}
        <div className="relative">
          <input
            type="text"
            value={documentNumberParam}
            onChange={(e) => handleFilterChange("number", e.target.value)}
            placeholder=" "
            id="search-number"
            autoComplete="off"
            className="w-full px-0 py-2 border-b-2 border-black focus:border-black outline-none transition-colors peer bg-transparent"
          />
          <label
            htmlFor="search-number"
            className="absolute left-0 top-2 text-gray-500 transition-all duration-200 pointer-events-none
                       peer-focus:text-xs peer-focus:-top-4 peer-focus:text-black
                       peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-4"
          >
            Номер
          </label>
        </div>

        {/* Тип документа */}
        <div className="relative">
          <select
            value={documentTypeParam}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-3 py-3 bg-transparent rounded border-none outline-none appearance-none cursor-pointer text-gray-700
                       focus:ring-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            <option value="" disabled>
              Тип документа
            </option>
            {documentTypes.slice(1).map((type) => (
              <option key={type.value} value={type.value}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопка Застосувати */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-black text-white rounded-full font-medium transition-all duration-300
                     hover:bg-[linear-gradient(68.94deg,#c3aab2_-4.77%,#9ec_46.72%,#80c0c8_90.23%,#4b8bfa_134.46%)] hover:from-gray-800 hover:to-black
                     active:scale-[0.98]"
        >
          Застосувати
        </button>
      </form>

      {/* Теги категорій */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.slice(1).map((category) => (
          <button
            key={category.value}
            onClick={() => handleFilterChange("category", category.value)}
            className={cn(
              "px-3  py-1.5 rounded-full text-sm transition-all duration-200",
              categoryParam === category.value
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-700 hover:bg-black hover:text-white"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DocumentFilters;
