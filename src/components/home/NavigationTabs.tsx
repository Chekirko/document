// components/home/NavigationTabs.tsx
import Link from "next/link";
import { Search, Bot } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
}

export function NavigationTabs({ activeTab }: NavigationTabsProps) {
  return (
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
  );
}
