"use client";

import { useState } from "react";
import { Bot } from "lucide-react";

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
        sources: data.sources,
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

  return (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
      {/* Chat Header */}
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
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-xs font-medium mb-1">Джерела:</p>
                  {message.sources.map((source, index) => (
                    <p key={index} className="text-xs">
                      • {source.title} (релевантність:{" "}
                      {(source.confidence * 100).toFixed(0)}%)
                    </p>
                  ))}
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
              <div className="flex items-center space-x-2">
                <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full"></div>
                <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full delay-100"></div>
                <div className="animate-bounce w-2 h-2 bg-gray-500 rounded-full delay-200"></div>
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
  );
};

export default ChatInterface;
