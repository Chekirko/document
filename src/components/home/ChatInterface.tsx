// "use client";

// import { useState } from "react";
// import { Bot } from "lucide-react";

// interface ChatMessage {
//   id: string;
//   type: "user" | "assistant";
//   content: string;
//   timestamp: Date;
//   sources?: { title: string; confidence: number }[];
// }

// const ChatInterface = () => {
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const [chatLoading, setChatLoading] = useState(false);

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

//   return (
//     <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
//       {/* Chat Header */}
//       <div className="px-6 py-4 border-b border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//           <Bot className="h-5 w-5 mr-2 text-blue-600" />
//           AI-Асистент міської ради
//         </h3>
//         <p className="text-sm text-gray-600 mt-1">
//           Ставте питання про документи природною мовою
//         </p>
//       </div>

//       {/* Chat Messages */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4">
//         {chatMessages.length === 0 && (
//           <div className="text-center py-12">
//             <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h4 className="text-lg font-medium text-gray-900 mb-2">
//               Привіт! Я ваш AI-асистент
//             </h4>
//             <p className="text-gray-600 mb-4">
//               Можу допомогти знайти інформацію в документах міської ради.
//             </p>
//             <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-500">
//               <p>
//                 <strong>Приклади запитів:</strong>
//               </p>
//               <p>• &quot;Скільки коштів виділили на ремонт доріг?&quot;</p>
//               <p>• &quot;Коли останній раз змінювали тарифи на воду?&quot;</p>
//               <p>• &quot;Які рішення приймали щодо парків?&quot;</p>
//               <p>• &quot;Покажи документ номер 156&quot;</p>
//             </div>
//           </div>
//         )}

//         {chatMessages.map((message) => (
//           <div
//             key={message.id}
//             className={`flex ${
//               message.type === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`max-w-[80%] rounded-lg px-4 py-2 ${
//                 message.type === "user"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-900"
//               }`}
//             >
//               <p className="whitespace-pre-wrap">{message.content}</p>
//               {message.sources && message.sources.length > 0 && (
//                 <div className="mt-2 pt-2 border-t border-gray-300">
//                   <p className="text-xs font-medium mb-1">Джерела:</p>
//                   {message.sources.map((source, index) => (
//                     <p key={index} className="text-xs">
//                       • {source.title} (релевантність:{" "}
//                       {(source.confidence * 100).toFixed(0)}%)
//                     </p>
//                   ))}
//                 </div>
//               )}
//               <p className="text-xs opacity-70 mt-1">
//                 {message.timestamp.toLocaleTimeString("uk-UA", {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>
//           </div>
//         ))}

//         {chatLoading && (
//           <div className="flex justify-start">
//             <div className="bg-gray-100 rounded-lg px-4 py-2">
//               <div className="flex items-center space-x-2">
//                 <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full"></div>
//                 <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full delay-100"></div>
//                 <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full delay-200"></div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Chat Input */}
//       <div className="px-6 py-4 border-t border-gray-200">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={chatInput}
//             onChange={(e) => setChatInput(e.target.value)}
//             onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
//             placeholder="Поставте своє запитання..."
//             disabled={chatLoading}
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//           <button
//             onClick={handleChatSubmit}
//             disabled={chatLoading || !chatInput.trim()}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//           >
//             Надіслати
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;

"use client";

import { useState, useRef } from "react";
import { Bot, X, GripVertical } from "lucide-react";
import { testDocuments } from "@/data/test-documents";
import type { TestDocument } from "@/types";
import Link from "next/link";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: { title: string; confidence: number }[];
}

const ChatInterface = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // нові стани для канви
  const [selectedDoc, setSelectedDoc] = useState<TestDocument | null>(null);
  const [panelWidth, setPanelWidth] = useState(40);
  const isResizing = useRef(false);

  // drag-resize
  const handleMouseDown = () => (isResizing.current = true);
  const handleMouseUp = () => (isResizing.current = false);
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.min(
      60,
      Math.max(25, (1 - e.clientX / window.innerWidth) * 100)
    );
    setPanelWidth(newWidth);
  };

  if (typeof window !== "undefined") {
    window.onmousemove = handleMouseMove;
    window.onmouseup = handleMouseUp;
  }

  // ---- Надсилання запиту ----
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: chatInput }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
        sources: data.sources?.slice(0, 5),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Помилка чату:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Вибачте, сталася помилка при обробці запитання.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // ---- Вибір документа ----
  const handleSelectDoc = (title: string) => {
    const found = testDocuments.find((d) => d.title === title);
    if (found) setSelectedDoc(found);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-lg h-[600px] overflow-hidden">
      {/* ========== ЛІВА ЧАСТИНА: ЧАТ (без змін з оригіналу) ========== */}
      <div
        className={`flex-1 flex flex-col ${
          selectedDoc ? "lg:w-[60%]" : "w-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-600" />
            AI-Асистент міської ради
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Ставте питання про документи природною мовою
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Привіт! Я ваш AI-асистент
              </h4>
              <p className="text-gray-600 mb-4">
                Можу допомогти знайти інформацію в документах міської ради.
              </p>
              <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-500">
                <p>
                  <strong>Приклади запитів:</strong>
                </p>
                <p>• &quot;Скільки коштів виділили на ремонт доріг?&quot;</p>
                <p>• &quot;Коли останній раз змінювали тарифи на воду?&quot;</p>
                <p>• &quot;Які рішення приймали щодо парків?&quot;</p>
                <p>• &quot;Покажи документ номер 156&quot;</p>
              </div>
            </div>
          )}

          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {/* Документи-джерела */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs font-medium mb-2 text-gray-600">
                      Джерела:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.slice(0, 5).map((source, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectDoc(source.title)}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                        >
                          {source.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString("uk-UA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <span>Обробляю запит...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
              placeholder="Поставте своє запитання..."
              disabled={chatLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleChatSubmit}
              disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Надіслати
            </button>
          </div>
        </div>
      </div>

      {/* ====== Роздільник (тільки на великих екранах) ====== */}
      {selectedDoc && (
        <div
          onMouseDown={handleMouseDown}
          className="hidden lg:block w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition"
        >
          <GripVertical className="mx-auto text-gray-400" size={16} />
        </div>
      )}

      {/* ====== Права панель (канва з документом) ====== */}
      {selectedDoc && (
        <div
          className="animate-fade-in border-l border-gray-200 bg-white p-6 overflow-y-auto relative"
          style={{ width: `${panelWidth}%` }}
        >
          <button
            onClick={() => setSelectedDoc(null)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {selectedDoc.name}
          </h2>
          <p className="text-sm text-gray-500 mb-4">{selectedDoc.title}</p>

          <div className="space-y-2 text-sm text-gray-700 mb-6">
            <p>
              <strong>Тип документа:</strong> {selectedDoc.document_type}
            </p>
            <p>
              <strong>Дата публікації:</strong>{" "}
              {new Date(selectedDoc.date_created).toLocaleDateString("uk-UA")}
            </p>
            {selectedDoc.categories.length > 0 && (
              <p>
                <strong>Категорії:</strong> {selectedDoc.categories.join(", ")}
              </p>
            )}
          </div>

          <div className="prose max-w-none text-gray-800 mb-8 whitespace-pre-line">
            {selectedDoc.content ||
              "Повний текст цього документа наразі недоступний."}
          </div>

          <Link
            href={`/documents/${selectedDoc.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Переглянути документ →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;

// "use client";

// import { useRef, useState } from "react";
// import { Bot, Mic, Loader2 } from "lucide-react";

// interface ChatMessage {
//   id: string;
//   type: "user" | "assistant";
//   content: string;
//   timestamp: Date;
//   sources?: { title: string; confidence: number }[];
// }

// const ChatInterface = () => {
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const [chatLoading, setChatLoading] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);

//   // ---- ГОЛОСОВИЙ ЗАПИС ----
//   const startRecording = async () => {
//     if (isRecording) {
//       stopRecording();
//       return;
//     }

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       const chunks: BlobPart[] = [];

//       recorder.ondataavailable = (e) => chunks.push(e.data);

//       recorder.onstop = async () => {
//         const blob = new Blob(chunks, { type: "audio/webm" });
//         await handleVoiceUpload(blob);
//       };

//       recorder.start();
//       mediaRecorderRef.current = recorder;
//       setIsRecording(true);
//     } catch (error) {
//       console.error("Помилка при доступі до мікрофона:", error);
//     }
//   };

//   const stopRecording = () => {
//     if (!isRecording) return;
//     setIsRecording(false);
//     mediaRecorderRef.current?.stop();
//   };

//   // ---- НАДСИЛАННЯ АУДІО ----
//   const handleVoiceUpload = async (audioBlob: Blob) => {
//     const formData = new FormData();
//     formData.append("file", audioBlob, "voice.webm");

//     try {
//       const res = await fetch("/api/voice", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (data.text) {
//         await handleChatSubmit(data.text);
//       }
//     } catch (error) {
//       console.error("Помилка при надсиланні голосу:", error);
//     }
//   };

//   // ---- НАДСИЛАННЯ ТЕКСТУ ----
//   const handleChatSubmit = async (query?: string) => {
//     const text = query ?? chatInput;
//     if (!text.trim()) return;

//     const userMessage: ChatMessage = {
//       id: Date.now().toString(),
//       type: "user",
//       content: text,
//       timestamp: new Date(),
//     };

//     setChatMessages((prev) => [...prev, userMessage]);
//     setChatInput("");
//     setChatLoading(true);

//     try {
//       const response = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query: text }),
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
//       await playTTS(data.response);
//     } catch (error) {
//       console.error("Помилка чату:", error);
//     } finally {
//       setChatLoading(false);
//     }
//   };

//   // ---- ОЗВУЧЕННЯ ----
//   const playTTS = async (text: string) => {
//     try {
//       setIsSpeaking(true);
//       const response = await fetch("/api/tts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text }),
//       });

//       const arrayBuffer = await response.arrayBuffer();
//       const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
//       const audioUrl = URL.createObjectURL(blob);
//       const audio = new Audio(audioUrl);
//       audio.onended = () => setIsSpeaking(false);
//       await audio.play();
//     } catch (error) {
//       console.error("Помилка TTS:", error);
//       setIsSpeaking(false);
//     }
//   };

//   // ---- UI ----
//   return (
//     <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col relative overflow-hidden">
//       {/* HEADER */}
//       <div className="px-6 py-4 border-b border-gray-200 z-10 bg-white">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//           <Bot className="h-5 w-5 mr-2 text-blue-600" />
//           AI-Асистент міської ради
//         </h3>
//         <p className="text-sm text-gray-600 mt-1">
//           Пишіть або говоріть свої запитання
//         </p>
//       </div>

//       {/* ПУЛЬСУЮЧЕ КОЛО */}
//       {(isRecording || isSpeaking) && (
//         <div className="absolute inset-0 flex items-center justify-center z-0 bg-white/70 backdrop-blur-sm">
//           <div
//             className={`w-40 h-40 rounded-full ${
//               isRecording ? "bg-red-500" : "bg-blue-500"
//             } animate-ping opacity-70`}
//           ></div>
//         </div>
//       )}

//       {/* CHAT */}
//       {/* CHAT */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 relative">
//         {/* Якщо активний голосовий режим — показуємо тільки коло */}
//         {isRecording || isSpeaking ? (
//           <div className="absolute inset-0 flex items-center justify-center bg-white">
//             <div
//               className={`w-40 h-40 rounded-full ${
//                 isRecording ? "bg-red-500" : "bg-blue-500"
//               } animate-ping opacity-70`}
//             ></div>
//           </div>
//         ) : (
//           <>
//             {chatMessages.length === 0 && (
//               <div className="text-center py-12">
//                 <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h4 className="text-lg font-medium text-gray-900 mb-2">
//                   Привіт! Я ваш AI-асистент
//                 </h4>
//                 <p className="text-gray-600 mb-4">
//                   Можу допомогти знайти інформацію в документах міської ради.
//                 </p>
//                 <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-500">
//                   <p>
//                     <strong>Приклади запитів:</strong>
//                   </p>
//                   <p>• &quot;Скільки коштів виділили на ремонт доріг?&quot;</p>
//                   <p>• &quot;Коли змінювали тарифи на воду?&quot;</p>
//                   <p>• &quot;Які рішення приймали щодо парків?&quot;</p>
//                 </div>
//               </div>
//             )}

//             {chatMessages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${
//                   message.type === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-[80%] rounded-lg px-4 py-2 ${
//                     message.type === "user"
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-100 text-gray-900"
//                   }`}
//                 >
//                   <p className="whitespace-pre-wrap">{message.content}</p>
//                   {message.sources && message.sources.length > 0 && (
//                     <div className="mt-2 pt-2 border-t border-gray-300">
//                       <p className="text-xs font-medium mb-1">Джерела:</p>
//                       {message.sources.map((source, index) => (
//                         <p key={index} className="text-xs">
//                           • {source.title} (релевантність:{" "}
//                           {(source.confidence * 100).toFixed(0)}%)
//                         </p>
//                       ))}
//                     </div>
//                   )}
//                   <p className="text-xs opacity-70 mt-1">
//                     {message.timestamp.toLocaleTimeString("uk-UA", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </p>
//                 </div>
//               </div>
//             ))}

//             {chatLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-gray-100 rounded-lg px-4 py-2">
//                   <Loader2 className="animate-spin h-4 w-4 text-gray-500" />
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* INPUT + MIC */}
//       <div className="px-6 py-4 border-t border-gray-200 flex gap-2 z-10">
//         <input
//           type="text"
//           value={chatInput}
//           onChange={(e) => setChatInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
//           placeholder="Поставте своє запитання..."
//           disabled={chatLoading || isRecording}
//           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         />
//         <button
//           onClick={() => handleChatSubmit()}
//           disabled={chatLoading || !chatInput.trim()}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//         >
//           Надіслати
//         </button>
//         <button
//           onClick={startRecording}
//           disabled={chatLoading}
//           className={`p-3 rounded-full transition ${
//             isRecording
//               ? "bg-red-500 text-white animate-pulse"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//           title={isRecording ? "Зупинити запис" : "Говорити"}
//         >
//           <Mic className="h-5 w-5" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;
