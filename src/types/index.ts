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
