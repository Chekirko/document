export interface TestDocument {
  id: number;
  title: string;
  name: string;
  short: string;
  content: string;
  document_type:
    | "council_decision"
    | "executive_decision"
    | "mayor_order"
    | "draft_decision";
  date_created: string;
  categories: string[];
  summary?: string;
  simple_explanation?: string;
  key_points?: string[];
  confidence_score?: number;
  semantic_similarity?: number;
}

export interface DocumentAnalysis {
  id: number;
  summary: string;
  simple_explanation: string;
  key_points: string[];
  related_topics: string[];
  confidence: number;
  processing_time: string;
}

export interface SearchParams {
  // 🔹 Основні поля фільтрації
  type?: string; // Тип документа (council_decision, mayor_order тощо)
  category?: string; // Категорія (бюджет, освіта, медицина тощо)
  number?: string; // Номер документа ("№ 123")
  title?: string; // Назва документа
  content?: string; // Зміст документа

  // 🔹 Фільтри за датою
  year?: string; // Рік (наприклад, "2024")
  month?: string; // Місяць (наприклад, "10")
  type_date?: string; // 0 = дата публікації, 1 = дата документа

  // 🔹 Додаткові або службові поля
  dateFrom?: string; // Можна залишити для майбутніх фільтрів по діапазону
  dateTo?: string;
  tab?: string; // Якщо є вкладки на сторінці
  mode?: string; // Режим відображення або пошуку
  view?: string; // Тип вигляду (наприклад, "grid" | "list")
  page?: string; // Пагінація (номер сторінки)
  query?: string; // Пошуковий запит
}

export interface PageProps {
  searchParams: Promise<SearchParams>;
}
