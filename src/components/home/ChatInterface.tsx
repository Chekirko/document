"use client";

import { useState, useRef } from "react";
import { Bot, X, GripVertical, Mic, Loader2 } from "lucide-react";
import Link from "next/link";
import { testDocuments } from "@/data/test-documents";
import type { TestDocument } from "@/types";
import Image from "next/image";

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
  const [selectedDoc, setSelectedDoc] = useState<TestDocument | null>(null);
  const [panelWidth, setPanelWidth] = useState(40);

  // Голосові стани
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(
    null
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isResizing = useRef(false);

  // ====== Перетягування роздільника ======
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

  // ====== Відправлення тексту ======
  const handleChatSubmit = async (query?: string) => {
    const text = query ?? chatInput;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
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

      // Озвучення відповіді
      await playTTS(data.response);
    } catch (error) {
      console.error("Помилка чату:", error);
    } finally {
      setChatLoading(false);
    }
  };

  // ====== Вибір документа ======
  const handleSelectDoc = (title: string) => {
    const found = testDocuments.find((d) => d.title === title);
    if (found) setSelectedDoc(found);
  };

  // ====== Голосовий ввід ======
  const startRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        await handleVoiceUpload(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Помилка при доступі до мікрофона:", error);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
  };

  // ====== Надсилання аудіо ======
  const handleVoiceUpload = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "voice.webm");
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) await handleChatSubmit(data.text);
    } catch (error) {
      console.error("Помилка при надсиланні голосу:", error);
    }
  };

  // ====== Озвучення відповіді ======
  const playTTS = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      setAudioInstance(audio);

      audio.onended = () => {
        setIsSpeaking(false);
        setAudioInstance(null);
      };

      await audio.play();
    } catch (error) {
      console.error("Помилка TTS:", error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioInstance) {
      audioInstance.pause();
      setAudioInstance(null);
      setIsSpeaking(false);
    }
  };

  // ====== UI ======
  return (
    <div className="flex flex-col  lg:flex-row bg-white rounded-lg shadow-lg min-h-[600px] h-full relative">
      {/* ЛІВА ЧАСТИНА: ЧАТ */}
      <div
        className={`flex-1  flex flex-col ${
          selectedDoc ? "lg:w-[60%]" : "w-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white z-20">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-600" />
            AI-Асистент міської ради
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Пишіть або говоріть свої запитання
          </p>
        </div>

        {/* Повідомлення */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
          {/* Індикатор запису */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-yellow-400 animate-pulse"></div>
            </div>
          )}

          {/* Індикатор озвучення */}
          {isSpeaking && chatMessages.length > 0 && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <div className="w-4 h-4 rounded-full bg-[#cdf4df] animate-ping"></div>
                <span>Відповідь озвучується...</span>
                <button
                  onClick={stopSpeaking}
                  className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Зупинити
                </button>
              </div>
            </div>
          )}

          {chatMessages.length === 0 && !isRecording && (
            <div className="text-center flex flex-col items-center lg:py-12 ">
              <div className="flex justify-center items-center gap-4">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Привіт! Я ваш AI-асистент
                </h4>
              </div>

              <p className="text-gray-600 mb-4">
                Можу допомогти знайти інформацію в документах міської ради.
              </p>
              <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-500">
                <p>
                  <strong>Приклади запитів:</strong>
                </p>
                <p>• “Скільки коштів виділили на ремонт доріг?”</p>
                <p>• “Коли змінювали тарифи на воду?”</p>
                <p>• “Які рішення приймали щодо парків?”</p>
              </div>
              <Image
                src="/bg.png"
                alt="AI"
                width={260}
                height={260}
                className="lg:absolute bottom-0 left-0 select-none pointer-events-none"
              />
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
                    ? "bg-[#cdf4df] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.sources && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs font-medium mb-2 text-gray-600">
                      Джерела:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.slice(0, 5).map((source, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectDoc(source.title)}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                        >
                          {source.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <Loader2 className="animate-spin h-4 w-4 text-gray-500" />
              </div>
            </div>
          )}
        </div>

        {/* Ввід + Мікрофон */}
        <div className="px-6 py-4 border-t border-gray-200 flex-col sm:flex-row flex gap-2 bg-white z-20">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
            placeholder="Поставте своє запитання..."
            disabled={chatLoading || isRecording}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => handleChatSubmit()}
            disabled={chatLoading || !chatInput.trim()}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-[linear-gradient(68.94deg,#c3aab2_-4.77%,#9ec_46.72%,#80c0c8_90.23%,#4b8bfa_134.46%)] disabled:opacity-50"
          >
            Надіслати
          </button>
          <button
            onClick={startRecording}
            disabled={chatLoading}
            className={`p-3 rounded-full flex justify-center transition ${
              isRecording
                ? "bg-yellow-400 text-white animate-pulse"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title={isRecording ? "Зупинити запис" : "Говорити"}
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ====== Роздільник ====== */}
      {selectedDoc && (
        <div
          onMouseDown={handleMouseDown}
          className="hidden lg:block w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition"
        >
          <GripVertical className="mx-auto text-gray-400" size={16} />
        </div>
      )}

      {/* ====== Канва документа ====== */}
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
            className="block w-full text-center bg-black text-white py-3 rounded-lg font-semibold hover:bg-[linear-gradient(68.94deg,#c3aab2_-4.77%,#9ec_46.72%,#80c0c8_90.23%,#4b8bfa_134.46%)] transition"
          >
            Переглянути документ →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
