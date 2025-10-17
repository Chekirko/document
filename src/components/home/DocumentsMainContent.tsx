import { TestDocument } from "@/types";
import { FileText } from "lucide-react";
import { DocumentCard } from "./DocumentCard";

export function DocumentsMainContent({
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
