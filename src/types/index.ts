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
  query?: string;
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  number?: string;
  tab?: string;
  mode?: string;
  view?: string;
  page?: string;
}

export interface PageProps {
  searchParams: Promise<SearchParams>;
}
