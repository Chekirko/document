// "use client";

// import { useState, useEffect } from "react";
// import { Search, FileText, Bot, Calendar, Filter, Hash, X } from "lucide-react";
// import { useRouter } from "next/navigation";

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
//   confidence_score?: number;
// }

// interface ChatMessage {
//   id: string;
//   type: "user" | "assistant";
//   content: string;
//   timestamp: Date;
//   sources?: { title: string; confidence: number }[];
// }

// export default function HomePage() {
//   const [documents, setDocuments] = useState<TestDocument[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [documentType, setDocumentType] = useState("");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [documentNumber, setDocumentNumber] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const [chatLoading, setChatLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState<"search" | "chat">("search");
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

//   const router = useRouter();

//   useEffect(() => {
//     const activeFilters: { [key: string]: string } = {};

//     if (documentType) activeFilters.document_type = documentType;
//     if (selectedCategory) activeFilters.category = selectedCategory;
//     if (dateFrom) activeFilters.date_from = dateFrom;
//     if (dateTo) activeFilters.date_to = dateTo;
//     if (documentNumber) activeFilters.document_number = documentNumber;

//     fetchDocuments(1, activeFilters);
//   }, [documentType, selectedCategory, dateFrom, dateTo, documentNumber]);

//   const fetchDocuments = async (page = 1, filters = {}) => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({
//         page: page.toString(),
//         limit: "20",
//         ...filters,
//       });

//       const response = await fetch(`/api/documents?${params}`);
//       const data = await response.json();
//       setDocuments(data.documents);
//     } catch (error) {
//       console.error("Помилка завантаження документів:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) {
//       // Якщо запит порожній, показуємо всі документи з поточними фільтрами
//       const activeFilters: { [key: string]: string } = {};
//       if (documentType) activeFilters.document_type = documentType;
//       if (selectedCategory) activeFilters.category = selectedCategory;
//       if (dateFrom) activeFilters.date_from = dateFrom;
//       if (dateTo) activeFilters.date_to = dateTo;
//       if (documentNumber) activeFilters.document_number = documentNumber;

//       fetchDocuments(1, activeFilters);
//       return;
//     }

//     setLoading(true);
//     try {
//       // Включаємо фільтри в семантичний пошук
//       const filters: { [key: string]: string } = {};
//       if (documentType) filters.document_type = documentType;
//       if (selectedCategory) filters.category = selectedCategory;
//       if (dateFrom) filters.date_from = dateFrom;
//       if (dateTo) filters.date_to = dateTo;
//       if (documentNumber) filters.document_number = documentNumber;

//       const response = await fetch("/api/search", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           query: searchQuery,
//           search_type: "hybrid",
//           filters: filters,
//           limit: 20,
//         }),
//       });

//       const data = await response.json();
//       setDocuments(data.results || data);
//     } catch (error) {
//       console.error("Помилка пошуку:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearAllFilters = () => {
//     setSearchQuery("");
//     setSelectedCategory("");
//     setDocumentType("");
//     setDateFrom("");
//     setDateTo("");
//     setDocumentNumber("");
//   };

//   const getActiveFiltersCount = () => {
//     return [
//       documentType,
//       selectedCategory,
//       dateFrom,
//       dateTo,
//       documentNumber,
//     ].filter(Boolean).length;
//   };

//   const extractDocumentNumber = (title: string) => {
//     // Витягуємо номер документа з заголовка (наприклад, "№ 156" або "№156")
//     const match = title.match(/№\s*(\d+)/);
//     return match ? match[1] : null;
//   };

//   const handleChatSubmit = async () => {
//     if (!chatInput.trim()) return;

//     const userMessage: ChatMessage = {
//       id: Date.now().toString(),
//       type: "user",
//       content: chatInput,
//       timestamp: new Date(),
//     };

//     setChatMessages((prev) => [...prev, userMessage]);
//     setChatInput("");
//     setChatLoading(true);

//     try {
//       const response = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query: chatInput }),
//       });

//       const data = await response.json();

//       const assistantMessage: ChatMessage = {
//         id: (Date.now() + 1).toString(),
//         type: "assistant",
//         content: data.response,
//         timestamp: new Date(),
//         sources: data.sources,
//       };

//       setChatMessages((prev) => [...prev, assistantMessage]);
//     } catch (error) {
//       console.error("Помилка чату:", error);
//       const errorMessage: ChatMessage = {
//         id: (Date.now() + 1).toString(),
//         type: "assistant",
//         content: "Вибачте, сталася помилка при обробці запитання.",
//         timestamp: new Date(),
//       };
//       setChatMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setChatLoading(false);
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

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white shadow-lg border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div className="flex items-center space-x-3">
//               <FileText className="h-8 w-8 text-blue-600" />
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   Документи онлайн
//                 </h1>
//                 <p className="text-sm text-gray-600">
//                   Інтелектуальний портал документів міської ради
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Navigation Tabs */}
//         <div className="mb-8">
//           <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
//             <button
//               onClick={() => setActiveTab("search")}
//               className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
//                 activeTab === "search"
//                   ? "bg-blue-600 text-white shadow-sm"
//                   : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
//               }`}
//             >
//               <Search className="h-4 w-4" />
//               <span>Пошук документів</span>
//             </button>
//             <button
//               onClick={() => setActiveTab("chat")}
//               className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
//                 activeTab === "chat"
//                   ? "bg-blue-600 text-white shadow-sm"
//                   : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
//               }`}
//             >
//               <Bot className="h-4 w-4" />
//               <span>AI-Асистент</span>
//             </button>
//           </div>
//         </div>

//         {activeTab === "search" && (
//           <div className="space-y-6">
//             {/* Search Interface */}
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <div className="space-y-4">
//                 {/* Main search input */}
//                 <div className="flex gap-4">
//                   <div className="flex-1">
//                     <input
//                       type="text"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//                       placeholder="Введіть ваш запит... (наприклад: 'ремонт доріг' або 'виділення коштів')"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <button
//                     onClick={handleSearch}
//                     disabled={loading}
//                     className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
//                   >
//                     <Search className="h-4 w-4" />
//                     <span>Знайти</span>
//                   </button>
//                 </div>

//                 {/* Quick filters row */}
//                 <div className="flex gap-4 items-center flex-wrap">
//                   <div className="flex items-center space-x-2">
//                     <Filter className="h-4 w-4 text-gray-500" />
//                     <span className="text-sm text-gray-600">Фільтри:</span>
//                   </div>

//                   <select
//                     value={documentType}
//                     onChange={(e) => setDocumentType(e.target.value)}
//                     className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
//                   >
//                     <option value="">Всі типи</option>
//                     <option value="council_decision">Рішення ради</option>
//                     <option value="executive_decision">
//                       Рішення виконкому
//                     </option>
//                     <option value="mayor_order">Розпорядження мера</option>
//                     <option value="draft_decision">Проект рішення</option>
//                   </select>

//                   <select
//                     value={selectedCategory}
//                     onChange={(e) => setSelectedCategory(e.target.value)}
//                     className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
//                   >
//                     <option value="">Всі категорії</option>
//                     <option value="бюджет">Бюджет</option>
//                     <option value="освіта">Освіта</option>
//                     <option value="медицина">Медицина</option>
//                     <option value="транспорт">Транспорт</option>
//                     <option value="благоустрій">Благоустрій</option>
//                     <option value="комунальні послуги">
//                       Комунальні послуги
//                     </option>
//                   </select>

//                   <button
//                     onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//                     className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1 text-sm"
//                   >
//                     <Calendar className="h-4 w-4" />
//                     <span>Більше фільтрів</span>
//                     {getActiveFiltersCount() > 2 && (
//                       <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                         {getActiveFiltersCount() - 2}
//                       </span>
//                     )}
//                   </button>

//                   {getActiveFiltersCount() > 0 && (
//                     <button
//                       onClick={clearAllFilters}
//                       className="px-3 py-2 text-red-600 hover:text-red-700 flex items-center space-x-1 text-sm"
//                     >
//                       <X className="h-4 w-4" />
//                       <span>Очистити</span>
//                     </button>
//                   )}
//                 </div>

//                 {/* Advanced filters */}
//                 {showAdvancedFilters && (
//                   <div className="border-t border-gray-200 pt-4 mt-4">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           <Hash className="h-4 w-4 inline mr-1" />
//                           Номер документа
//                         </label>
//                         <input
//                           type="text"
//                           value={documentNumber}
//                           onChange={(e) => setDocumentNumber(e.target.value)}
//                           placeholder="Наприклад: 156"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                         />
//                         <p className="text-xs text-gray-500 mt-1">
//                           Пошук по номеру в назві документа
//                         </p>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           <Calendar className="h-4 w-4 inline mr-1" />
//                           Дата від
//                         </label>
//                         <input
//                           type="date"
//                           value={dateFrom}
//                           onChange={(e) => setDateFrom(e.target.value)}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           <Calendar className="h-4 w-4 inline mr-1" />
//                           Дата до
//                         </label>
//                         <input
//                           type="date"
//                           value={dateTo}
//                           onChange={(e) => setDateTo(e.target.value)}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Active filters display */}
//                 {getActiveFiltersCount() > 0 && (
//                   <div className="flex flex-wrap gap-2 pt-2">
//                     <span className="text-sm text-gray-600">
//                       Активні фільтри:
//                     </span>
//                     {documentType && (
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
//                         Тип: {getDocumentTypeLabel(documentType)}
//                         <button
//                           onClick={() => setDocumentType("")}
//                           className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </span>
//                     )}
//                     {selectedCategory && (
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
//                         Категорія: {selectedCategory}
//                         <button
//                           onClick={() => setSelectedCategory("")}
//                           className="ml-1 hover:bg-green-200 rounded-full p-0.5"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </span>
//                     )}
//                     {documentNumber && (
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
//                         Номер: {documentNumber}
//                         <button
//                           onClick={() => setDocumentNumber("")}
//                           className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </span>
//                     )}
//                     {dateFrom && (
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
//                         Від: {new Date(dateFrom).toLocaleDateString("uk-UA")}
//                         <button
//                           onClick={() => setDateFrom("")}
//                           className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </span>
//                     )}
//                     {dateTo && (
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
//                         До: {new Date(dateTo).toLocaleDateString("uk-UA")}
//                         <button
//                           onClick={() => setDateTo("")}
//                           className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Results */}
//             <div className="space-y-4">
//               {loading ? (
//                 <div className="text-center py-12">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                   <p className="mt-4 text-gray-600">
//                     Завантаження документів...
//                   </p>
//                 </div>
//               ) : (
//                 documents.map((doc) => (
//                   <div
//                     key={doc.id}
//                     className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
//                   >
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="flex-1">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                           {doc.title}
//                           {extractDocumentNumber(doc.title) && (
//                             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                               <Hash className="h-3 w-3 mr-1" />
//                               {extractDocumentNumber(doc.title)}
//                             </span>
//                           )}
//                         </h3>
//                         <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                             {getDocumentTypeLabel(doc.document_type)}
//                           </span>
//                           <span className="flex items-center">
//                             <Calendar className="h-4 w-4 mr-1" />
//                             {formatDate(doc.date_created)}
//                           </span>
//                           {doc.confidence_score && (
//                             <span className="text-green-600">
//                               Релевантність:{" "}
//                               {(doc.confidence_score * 100).toFixed(0)}%
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {doc.simple_explanation && (
//                       <div className="mb-4 p-3 bg-blue-50 rounded-lg">
//                         <h4 className="font-medium text-blue-900 mb-2">
//                           🤝 Зрозумілою мовою:
//                         </h4>
//                         <p className="text-blue-800">
//                           {doc.simple_explanation}
//                         </p>
//                       </div>
//                     )}

//                     {doc.key_points && doc.key_points.length > 0 && (
//                       <div className="mb-4">
//                         <h4 className="font-medium text-gray-900 mb-2">
//                           📋 Ключові пункти:
//                         </h4>
//                         <ul className="list-disc list-inside space-y-1">
//                           {doc.key_points.map((point, index) => (
//                             <li key={index} className="text-gray-700">
//                               {point}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}

//                     <div className="flex flex-wrap gap-2 mb-4">
//                       {doc.categories.map((category) => (
//                         <span
//                           key={category}
//                           className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
//                           onClick={() => setSelectedCategory(category)}
//                           title={`Фільтрувати по категорії "${category}"`}
//                         >
//                           {category}
//                         </span>
//                       ))}
//                     </div>

//                     <div className="flex justify-between items-center pt-4 border-t border-gray-200">
//                       <button
//                         // onClick={() =>
//                         //   window.open(`/documents/${doc.id}`, "_blank")
//                         // }
//                         onClick={() => router.push(`/documents/${doc.id}`)}
//                         className="text-blue-600 hover:text-blue-800 font-medium"
//                       >
//                         Переглянути повний текст →
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               )}

//               {!loading && documents.length === 0 && (
//                 <div className="text-center py-12">
//                   <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">
//                     Документи не знайдені
//                   </h3>
//                   <p className="text-gray-600 mb-4">
//                     Спробуйте змінити параметри пошуку або використати інші
//                     ключові слова.
//                   </p>
//                   {getActiveFiltersCount() > 0 && (
//                     <button
//                       onClick={clearAllFilters}
//                       className="text-blue-600 hover:text-blue-800 font-medium"
//                     >
//                       Очистити всі фільтри
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {activeTab === "chat" && (
//           <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
//             {/* Chat Header */}
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <Bot className="h-5 w-5 mr-2 text-blue-600" />
//                 AI-Асистент міської ради
//               </h3>
//               <p className="text-sm text-gray-600 mt-1">
//                 Ставте питання про документи природною мовою
//               </p>
//             </div>

//             {/* Chat Messages */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-4">
//               {chatMessages.length === 0 && (
//                 <div className="text-center py-12">
//                   <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <h4 className="text-lg font-medium text-gray-900 mb-2">
//                     Привіт! Я ваш AI-асистент
//                   </h4>
//                   <p className="text-gray-600 mb-4">
//                     Можу допомогти знайти інформацію в документах міської ради.
//                   </p>
//                   <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-500">
//                     <p>
//                       <strong>Приклади запитів:</strong>
//                     </p>
//                     <p>
//                       • &quot;Скільки коштів виділили на ремонт доріг?&quot;
//                     </p>
//                     <p>
//                       • &quot;Коли останній раз змінювали тарифи на воду?&quot;
//                     </p>
//                     <p>• &quot;Які рішення приймали щодо парків?&quot;</p>
//                     <p>• &quot;Покажи документ номер 156&quot;</p>
//                   </div>
//                 </div>
//               )}

//               {chatMessages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`flex ${
//                     message.type === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-[80%] rounded-lg px-4 py-2 ${
//                       message.type === "user"
//                         ? "bg-blue-600 text-white"
//                         : "bg-gray-100 text-gray-900"
//                     }`}
//                   >
//                     <p className="whitespace-pre-wrap">{message.content}</p>
//                     {message.sources && message.sources.length > 0 && (
//                       <div className="mt-2 pt-2 border-t border-gray-300">
//                         <p className="text-xs font-medium mb-1">Джерела:</p>
//                         {message.sources.map((source, index) => (
//                           <p key={index} className="text-xs">
//                             • {source.title} (релевантність:{" "}
//                             {(source.confidence * 100).toFixed(0)}%)
//                           </p>
//                         ))}
//                       </div>
//                     )}
//                     <p className="text-xs opacity-70 mt-1">
//                       {message.timestamp.toLocaleTimeString("uk-UA", {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </p>
//                   </div>
//                 </div>
//               ))}

//               {chatLoading && (
//                 <div className="flex justify-start">
//                   <div className="bg-gray-100 rounded-lg px-4 py-2">
//                     <div className="flex items-center space-x-2">
//                       <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full"></div>
//                       <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full delay-100"></div>
//                       <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full delay-200"></div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Chat Input */}
//             <div className="px-6 py-4 border-t border-gray-200">
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={chatInput}
//                   onChange={(e) => setChatInput(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
//                   placeholder="Поставте своє запитання..."
//                   disabled={chatLoading}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//                 <button
//                   onClick={handleChatSubmit}
//                   disabled={chatLoading || !chatInput.trim()}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   Надіслати
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { Suspense } from "react";
import { FileText, Search, Bot } from "lucide-react";
import Link from "next/link";

// import DocumentSearch from "@/components/search/DocumentSearch";
import DocumentFilters from "@/components/AdvancedFilter";
import DocumentsList from "@/components/home/DocumentsList";
import ChatInterface from "@/components/home/ChatInterface";
import { testDocuments } from "@/data/test-documents";
import { SearchUtils } from "@/lib/search-utils";

interface SearchParams {
  query?: string;
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  number?: string;
  tab?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams.tab || "search";

  // Фільтруємо документи на сервері на основі URL параметрів
  let filteredDocuments = [...testDocuments];

  // Фільтр за типом документа
  if (searchParams.type) {
    filteredDocuments = filteredDocuments.filter(
      (doc) => doc.document_type === searchParams.type
    );
  }

  // Фільтр за категорією
  if (searchParams.category) {
    filteredDocuments = filteredDocuments.filter((doc) =>
      doc.categories.some((cat) =>
        cat.toLowerCase().includes(searchParams.category!.toLowerCase())
      )
    );
  }

  // Фільтр за номером документа
  if (searchParams.number) {
    filteredDocuments = filteredDocuments.filter((doc) => {
      const match = doc.title.match(/№\s*(\d+)/);
      return match && match[1].includes(searchParams.number!);
    });
  }

  // Фільтр за датою "від"
  if (searchParams.dateFrom) {
    const dateFrom = new Date(searchParams.dateFrom);
    filteredDocuments = filteredDocuments.filter((doc) => {
      const docDate = new Date(doc.date_created);
      return docDate >= dateFrom;
    });
  }

  // Фільтр за датою "до"
  if (searchParams.dateTo) {
    const dateTo = new Date(searchParams.dateTo);
    filteredDocuments = filteredDocuments.filter((doc) => {
      const docDate = new Date(doc.date_created);
      return docDate <= dateTo;
    });
  }

  // Семантичний пошук якщо є query
  if (searchParams.query) {
    const searchResults = SearchUtils.performSemanticSearch(
      searchParams.query,
      filteredDocuments,
      20
    );
    filteredDocuments = searchResults;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Документи онлайн
                </h1>
                <p className="text-sm text-gray-600">
                  Інтелектуальний портал документів міської ради
                </p>
              </div>
            </div>
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
                <Suspense fallback={<div>Завантаження пошуку...</div>}>
                  {/* <DocumentSearch /> */}
                </Suspense>

                <Suspense fallback={<div>Завантаження фільтрів...</div>}>
                  <DocumentFilters />
                </Suspense>
              </div>
            </div>

            {/* Results */}
            <Suspense
              fallback={
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Завантаження документів...
                  </p>
                </div>
              }
            >
              <DocumentsList
                documents={filteredDocuments}
                searchQuery={searchParams.query}
              />
            </Suspense>
          </div>
        ) : (
          <Suspense fallback={<div>Завантаження чату...</div>}>
            <ChatInterface />
          </Suspense>
        )}
      </div>
    </div>
  );
}
