export interface TestDocument {
  id: number;
  title: string;
  content: string;
  // Використовуємо строгий тип, оскільки він більш надійний
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
