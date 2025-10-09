import { getDocumentById } from "@/lib/actions/actions"; // Імпортуємо нашу функцію
import DocumentView from "@/components/DocumentView"; // Це буде наш новий клієнтський компонент
import { notFound } from "next/navigation";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

// Сторінка тепер є асинхронною функцією!
export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;
  const documentId = parseInt(id);

  // Перевіряємо, чи ID є числом
  if (isNaN(documentId)) {
    return notFound(); // Стандартна сторінка 404 від Next.js
  }

  // Отримуємо дані прямо на сервері. Більше ніяких useEffect для початкового завантаження!
  const document = await getDocumentById(documentId);

  // Якщо документ не знайдено, показуємо сторінку 404
  if (!document) {
    return notFound();
  }

  // Ми передаємо отримані дані в чисто клієнтський компонент,
  // який буде відповідати за інтерактивність (кнопки, аналіз і т.д.)
  return <DocumentView initialDocument={document} />;
}
