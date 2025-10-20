import OpenAI from "openai";
import { TestDocument } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAnalysisResult {
  summary: string;
  simple_explanation: string;
  key_points: string[];
  category: string;
  confidence: number;
}

export class AIService {
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Обмежуємо довжину тексту для кращої векторизації (перші 8000 символів)
      const truncatedText = text.slice(0, 8000);

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: truncatedText,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("Embedding generation error:", error);
      throw error;
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }

  async semanticSearch(
    query: string,
    documents: TestDocument[],
    limit: number = 20,
    similarityThreshold: number = 0.4 // ЗНИЖЕНО з 0.5 до 0.4
  ): Promise<TestDocument[]> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.error("OpenAI API key is not configured");
        throw new Error("API key missing");
      }

      console.log(`[AI Search] Generating embedding for query: "${query}"`);
      const queryEmbedding = await this.generateEmbedding(query);

      console.log(`[AI Search] Processing ${documents.length} documents...`);

      const documentsWithEmbeddings = await Promise.all(
        documents.map(async (doc, index) => {
          // Включаємо всі важливі поля документа
          const docText = `${doc.title}. ${
            doc.content
          }. Категорії: ${doc.categories.join(", ")}. ${doc.summary || ""} ${
            doc.simple_explanation || ""
          }`;

          try {
            const embedding = await this.generateEmbedding(docText);
            const similarity = this.cosineSimilarity(queryEmbedding, embedding);

            if (index < 3) {
              console.log(
                `[AI Search] Doc #${doc.id} "${doc.title.slice(
                  0,
                  50
                )}..." similarity: ${similarity.toFixed(3)}`
              );
            }

            return {
              ...doc,
              confidence_score: similarity,
              semantic_similarity: similarity,
            };
          } catch (error) {
            console.error(
              `Error generating embedding for doc ${doc.id}:`,
              error
            );
            return {
              ...doc,
              confidence_score: 0,
              semantic_similarity: 0,
            };
          }
        })
      );

      const results = documentsWithEmbeddings
        .filter((doc) => (doc.semantic_similarity ?? 0) > similarityThreshold)
        .sort(
          (a, b) => (b.semantic_similarity ?? 0) - (a.semantic_similarity ?? 0)
        )
        .slice(0, limit);

      console.log(
        `[AI Search] Found ${results.length} documents above threshold ${similarityThreshold}`
      );

      if (results.length > 0) {
        console.log(`[AI Search] Top 3 results:`);
        results.slice(0, 3).forEach((doc, i) => {
          console.log(
            `  ${i + 1}. "${doc.title.slice(
              0,
              60
            )}..." (score: ${doc.semantic_similarity?.toFixed(3)})`
          );
        });
      }

      return results;
    } catch (error) {
      console.error("Semantic search error:", error);
      throw error;
    }
  }

  private fallbackKeywordSearch(
    query: string,
    documents: TestDocument[],
    limit: number,
    minScore: number = 0.2 // ЗНИЖЕНО з 0.3 до 0.2
  ): TestDocument[] {
    const queryWords = query
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 2);

    console.log(
      `[Keyword Search] Searching for words: ${queryWords.join(", ")}`
    );

    const results = documents.map((doc) => {
      const docText = (
        doc.title +
        " " +
        doc.content +
        " " +
        doc.categories.join(" ") +
        " " +
        (doc.summary || "") +
        " " +
        (doc.simple_explanation || "")
      ).toLowerCase();

      let totalScore = 0;

      queryWords.forEach((word) => {
        const occurrences = (docText.match(new RegExp(word, "g")) || []).length;
        const titleBonus = doc.title.toLowerCase().includes(word) ? 0.5 : 0;
        totalScore += occurrences + titleBonus;
      });

      const similarity =
        queryWords.length > 0 ? totalScore / queryWords.length : 0;

      return {
        ...doc,
        confidence_score: Math.min(similarity, 1),
        semantic_similarity: Math.min(similarity, 1),
      };
    });

    const filtered = results
      .filter((doc) => (doc.confidence_score ?? 0) > minScore)
      .sort((a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0))
      .slice(0, limit);

    console.log(
      `[Keyword Search] Found ${filtered.length} documents above score ${minScore}`
    );

    return filtered;
  }

  async hybridSearch(
    query: string,
    documents: TestDocument[],
    limit: number = 20
  ): Promise<TestDocument[]> {
    try {
      console.log(`\n[Hybrid Search] Starting for query: "${query}"`);

      // Спроба AI пошуку з нижчим порогом
      const semanticResults = await this.semanticSearch(
        query,
        documents,
        limit * 2,
        0.35 // ЗНИЖЕНО з 0.55 до 0.35
      );

      const keywordResults = this.fallbackKeywordSearch(
        query,
        documents,
        limit * 2,
        0.2 // ЗНИЖЕНО з 0.3 до 0.2
      );

      const combinedScores = new Map<number, TestDocument>();

      // AI результати мають вищу вагу (70%)
      semanticResults.forEach((doc) => {
        combinedScores.set(doc.id, {
          ...doc,
          confidence_score: (doc.semantic_similarity ?? 0) * 0.7,
        });
      });

      // Keyword результати додають менше (30%)
      keywordResults.forEach((doc) => {
        const existing = combinedScores.get(doc.id);
        if (existing) {
          existing.confidence_score =
            (existing.confidence_score ?? 0) +
            (doc.confidence_score ?? 0) * 0.3;
        } else {
          combinedScores.set(doc.id, {
            ...doc,
            confidence_score: (doc.confidence_score ?? 0) * 0.3,
          });
        }
      });

      const results = Array.from(combinedScores.values())
        .sort((a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0))
        .slice(0, limit);

      console.log(
        `[Hybrid Search] Returning ${results.length} combined results\n`
      );

      return results;
    } catch (error) {
      console.error(
        "Hybrid search error, falling back to keyword only:",
        error
      );
      return this.fallbackKeywordSearch(query, documents, limit, 0.3);
    }
  }

  async analyzeDocument(
    title: string,
    content: string
  ): Promise<AIAnalysisResult> {
    const prompt = `
Проаналізуй цей документ міської ради та дай відповідь у форматі JSON:

Назва: ${title}
Зміст: ${content.slice(0, 4000)}

Потрібно створити:
1. summary - коротке резюме (1-2 речення)
2. simple_explanation - пояснення простою мовою для звичайних громадян
3. key_points - масив з 3-5 ключових пунктів
4. category - основна категорія (бюджет, освіта, медицина, транспорт, благоустрій, земельні питання, комунальні послуги, соціальні питання, інше)
5. confidence - рівень впевненості в аналізі (0-1)
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0].message.content || "{}";
      const result = JSON.parse(raw);
      return result;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return {
        summary: "Автоматичний аналіз тимчасово недоступний",
        simple_explanation: "Детальний аналіз документа буде доступний пізніше",
        key_points: ["Документ потребує ручного аналізу"],
        category: "інше",
        confidence: 0.5,
      };
    }
  }

  async generateChatResponse(
    query: string,
    relevantDocs: TestDocument[]
  ): Promise<{
    response: string;
    sources: { title: string; confidence: number }[];
    confidence: number;
  }> {
    const docsContext = relevantDocs
      .map(
        (doc) =>
          `Документ: ${doc.title}\nЗміст: ${doc.content.slice(0, 2000)}\n---`
      )
      .join("\n");

    const prompt = `
Ти - асистент міської ради, який допомагає громадянам знаходити інформацію в документах.
Відповідай українською мовою на основі наданих документів.

Питання користувача: ${query}

Релевантні документи:
${docsContext}

Дай корисну відповідь на основі цих документів. Якщо інформації недостатньо, чесно про це скажи.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      return {
        response:
          response.choices[0].message.content ||
          "Вибачте, не можу сформувати відповідь",
        sources: relevantDocs.map((doc) => ({
          title: doc.title,
          confidence: doc.confidence_score ?? 0.8,
        })),
        confidence: 0.8,
      };
    } catch (error) {
      console.error("Chat Response Error:", error);
      return {
        response: "Вибачте, сталася помилка при обробці вашого запитання.",
        sources: [],
        confidence: 0.0,
      };
    }
  }
}

export const aiService = new AIService();
// ai-service.ts
// import OpenAI from "openai";
// import type { TestDocument } from "@/types";
// // import { SearchUtils } from "./search-utils";

// /**
//  * AI service for semantic search, query rewriting, hybrid fallback and document analysis.
//  * - No mutation of TestDocument shape (uses optional fields semantic_similarity, confidence_score)
//  * - Embeddings cached in memory (Map). Replace with persistent vector DB in prod.
//  */

// /* ---------- Configuration ---------- */
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// if (!OPENAI_API_KEY) {
//   // Fail fast — better to know immediately in dev
//   throw new Error("OPENAI_API_KEY is not set in environment variables");
// }

// const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// const EMBEDDING_MODEL = "text-embedding-3-small";
// const QUERY_REWRITE_MODEL = "gpt-4o-mini";
// const ANALYSIS_MODEL = "gpt-4o-mini";

// /* ---------- Types ---------- */

// export interface AIAnalysisResult {
//   summary: string;
//   simple_explanation: string;
//   key_points: string[];
//   category: string;
//   confidence: number; // 0..1
// }

// /* ---------- Helpers & Type Guards ---------- */

// function normalizeTextForEmbedding(input: string): string {
//   return input
//     .slice(0, 8000)
//     .replace(/<[^>]+>/g, " ")
//     .replace(/\s+/g, " ")
//     .replace(/[^\p{L}\p{N}\s]/gu, "")
//     .toLowerCase()
//     .trim();
// }

// function isNumberArray(x: unknown): x is number[] {
//   return (
//     Array.isArray(x) && x.length > 0 && x.every((v) => typeof v === "number")
//   );
// }

// function safeParseJson<T>(text: string): T | null {
//   try {
//     return JSON.parse(text) as T;
//   } catch {
//     // try to extract JSON block
//     const m = text.match(/\{[\s\S]*\}/);
//     if (!m) return null;
//     try {
//       return JSON.parse(m[0]) as T;
//     } catch {
//       return null;
//     }
//   }
// }

// /* ---------- AIService ---------- */

// export class AIService {
//   // Cache of embeddings by document id
//   private readonly embeddingCacheById = new Map<number, number[]>();
//   // Cache of embeddings by normalized text (string hash)
//   private readonly embeddingCacheByText = new Map<string, number[]>();

//   /**
//    * Rewrite user query to a denser search phrase (adds synonyms / clarifies implied intent).
//    * Returns the rewritten string (or original on failure).
//    */
//   public async rewriteQuery(userQuery: string): Promise<string> {
//     if (!userQuery || userQuery.trim().length === 0) return userQuery;

//     const systemPrompt =
//       "Ти — помічник, який переформулює запити під пошук документів. " +
//       "Виділи ключові слова, додай синоніми та альтернативні формулювання. " +
//       "Поверни один короткий рядок українською без зайвих пояснень.";

//     try {
//       const response = await openai.chat.completions.create({
//         model: QUERY_REWRITE_MODEL,
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: userQuery },
//         ],
//         temperature: 0.25,
//         max_tokens: 120,
//       });

//       const text = response.choices?.[0]?.message?.content?.trim();
//       return text && text.length > 0 ? text : userQuery;
//     } catch (err) {
//       // graceful fallback
//       console.warn("rewriteQuery failed — using original query", err);
//       return userQuery;
//     }
//   }

//   /**
//    * Create or return cached embedding for a given text.
//    * Uses an in-memory cache keyed by normalized text.
//    */
//   public async embeddingForText(text: string): Promise<number[]> {
//     const normalized = normalizeTextForEmbedding(text);
//     if (normalized.length === 0) return [];

//     const key = this.hashString(normalized);
//     const cached = this.embeddingCacheByText.get(key);
//     if (cached) return cached;

//     const resp = await openai.embeddings.create({
//       model: EMBEDDING_MODEL,
//       input: normalized,
//     });

//     const maybeEmbedding = resp.data?.[0]?.embedding;
//     if (!isNumberArray(maybeEmbedding)) {
//       throw new Error("Invalid embedding response from OpenAI");
//     }
//     this.embeddingCacheByText.set(key, maybeEmbedding);
//     return maybeEmbedding;
//   }

//   /**
//    * Ensure (create if needed) embedding for a document and cache it by id.
//    * Document shape isn't mutated; embedding is stored only in the service cache.
//    */
//   public async ensureDocumentEmbedding(doc: TestDocument): Promise<number[]> {
//     const cached = this.embeddingCacheById.get(doc.id);
//     if (cached) return cached;

//     const textForEmbed = [
//       doc.title ?? "",
//       doc.name ?? "",
//       doc.short ?? "",
//       doc.content ?? "",
//       (doc.categories || []).join(" "),
//       doc.summary ?? "",
//       doc.simple_explanation ?? "",
//     ].join(". ");

//     if (textForEmbed.trim().length === 0) {
//       const empty: number[] = [];
//       this.embeddingCacheById.set(doc.id, empty);
//       return empty;
//     }

//     const emb = await this.embeddingForText(textForEmbed);
//     this.embeddingCacheById.set(doc.id, emb);
//     return emb;
//   }

//   private cosineSimilarity(a: number[], b: number[]): number {
//     if (!a.length || !b.length || a.length !== b.length) return 0;
//     let dot = 0;
//     let na = 0;
//     let nb = 0;
//     for (let i = 0; i < a.length; i++) {
//       dot += a[i] * b[i];
//       na += a[i] * a[i];
//       nb += b[i] * b[i];
//     }
//     if (na === 0 || nb === 0) return 0;
//     return dot / (Math.sqrt(na) * Math.sqrt(nb));
//   }

//   /**
//    * Main semantic search entrypoint.
//    * - rewrites query
//    * - computes embedding for query
//    * - computes (or fetches) embeddings for documents
//    * - ranks by cosine similarity
//    * - uses hybrid fallback if coverage is low
//    *
//    * Returns copies of TestDocument with semantic_similarity and confidence_score set.
//    */
//   public async semanticSearch(
//     query: string,
//     documents: ReadonlyArray<TestDocument>,
//     limit = 20,
//     similarityThreshold = 0.4
//   ): Promise<TestDocument[]> {
//     if (!query || query.trim().length === 0) return [];

//     // 1. rewrite
//     const refined = await this.rewriteQuery(query);

//     // 2. query embedding
//     let queryEmbedding: number[];
//     try {
//       queryEmbedding = await this.embeddingForText(refined);
//     } catch (err) {
//       console.error(
//         "Failed to create query embedding, falling back to keyword search",
//         err
//       );
//       return this.keywordFallback(query, Array.from(documents), limit, 0.2);
//     }

//     // 3. score documents
//     const scored: Array<{ doc: TestDocument; score: number }> = [];
//     // sequential to avoid throttling — can be parallelized with concurrency control if desired
//     for (const doc of documents) {
//       try {
//         const docEmb = await this.ensureDocumentEmbedding(doc);
//         const score = docEmb.length
//           ? this.cosineSimilarity(queryEmbedding, docEmb)
//           : 0;
//         scored.push({ doc, score });
//       } catch (err) {
//         // on per-doc failure — treat as zero score and continue
//         console.error("Error embedding doc id", doc.id, err);
//         scored.push({ doc, score: 0 });
//       }
//     }

//     // sort & filter
//     const filtered = scored
//       .filter(({ score }) => score > similarityThreshold)
//       .sort((a, b) => b.score - a.score)
//       .slice(0, limit)
//       .map(({ doc, score }) => {
//         const copy: TestDocument = { ...doc };
//         copy.semantic_similarity = score;
//         copy.confidence_score = score;
//         return copy;
//       });

//     const topScore = filtered[0]?.semantic_similarity ?? 0;
//     if (filtered.length === 0 || topScore < 0.55) {
//       // Insufficient coverage -> hybrid fallback
//       return this.hybridSearch(query, Array.from(documents), limit);
//     }

//     return filtered;
//   }

//   /* ---------- Keyword fallback (simple, robust) ---------- */

//   private keywordFallback(
//     query: string,
//     documents: TestDocument[],
//     limit: number,
//     minScore = 0.2
//   ): TestDocument[] {
//     const words = query
//       .toLowerCase()
//       .split(/\s+/)
//       .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
//       .filter((w) => w.length > 2);

//     const scored = documents.map((doc) => {
//       const docText = [
//         doc.title,
//         doc.name,
//         doc.short,
//         doc.content,
//         (doc.categories || []).join(" "),
//         doc.summary ?? "",
//         doc.simple_explanation ?? "",
//       ]
//         .join(" ")
//         .toLowerCase();

//       let total = 0;
//       for (const w of words) {
//         if (!w) continue;
//         const safe = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//         const occurrences = (docText.match(new RegExp(safe, "g")) || []).length;
//         const bonus =
//           (doc.title?.toLowerCase().includes(w) ? 0.5 : 0) +
//           (doc.name?.toLowerCase().includes(w) ? 0.3 : 0);
//         total += occurrences + bonus;
//       }

//       const sim = words.length ? total / words.length : 0;
//       const copy: TestDocument = { ...doc };
//       copy.confidence_score = Math.min(sim, 1);
//       copy.semantic_similarity = Math.min(sim, 1);
//       return copy;
//     });

//     return scored
//       .filter((d) => (d.confidence_score ?? 0) > minScore)
//       .sort((a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0))
//       .slice(0, limit);
//   }

//   /* ---------- Hybrid search (semantic + keyword) ---------- */

//   public async hybridSearch(
//     query: string,
//     documents: TestDocument[],
//     limit = 20
//   ): Promise<TestDocument[]> {
//     // Get semantic candidates with lower threshold (to increase recall)
//     const semanticCandidates = await this.semanticSearchInternal(
//       query,
//       documents,
//       limit * 2,
//       0.35
//     );
//     const keywordCandidates = this.keywordFallback(
//       query,
//       documents,
//       limit * 2,
//       0.1
//     );

//     // combine with weights
//     const combined = new Map<
//       number,
//       { doc: TestDocument; combinedScore: number }
//     >();

//     for (const s of semanticCandidates) {
//       combined.set(s.id, {
//         doc: s,
//         combinedScore: (s.semantic_similarity ?? 0) * 0.7,
//       });
//     }

//     for (const k of keywordCandidates) {
//       const existing = combined.get(k.id);
//       const kScore = (k.confidence_score ?? 0) * 0.3;
//       if (existing) {
//         existing.combinedScore += kScore;
//       } else {
//         combined.set(k.id, { doc: k, combinedScore: kScore });
//       }
//     }

//     const merged = Array.from(combined.values())
//       .sort((a, b) => b.combinedScore - a.combinedScore)
//       .slice(0, limit)
//       .map(({ doc, combinedScore }) => {
//         const copy: TestDocument = { ...doc };
//         copy.confidence_score = combinedScore;
//         // preserve highest of semantic_similarity or combinedScore for semantics field
//         copy.semantic_similarity = Math.max(
//           doc.semantic_similarity ?? 0,
//           combinedScore
//         );
//         return copy;
//       });

//     // If still empty, fallback to keyword-only
//     if (merged.length === 0) {
//       return this.keywordFallback(query, documents, limit, 0.05);
//     }

//     return merged;
//   }

//   /**
//    * Internal helper to run semantic scoring without doing hybrid fallback again (prevents recursion).
//    * Returns TestDocument[] with semantic_similarity/confidence_score fields set.
//    */
//   private async semanticSearchInternal(
//     query: string,
//     documents: TestDocument[],
//     limit = 20,
//     similarityThreshold = 0.35
//   ): Promise<TestDocument[]> {
//     // rewrite + embedding
//     const refined = await this.rewriteQuery(query);
//     let queryEmbedding: number[];
//     try {
//       queryEmbedding = await this.embeddingForText(refined);
//     } catch (err) {
//       console.log(err);
//       return this.keywordFallback(query, documents, limit, 0.0);
//     }

//     const scored: Array<{ doc: TestDocument; score: number }> = [];
//     // Note: still sequential for stability
//     for (const doc of documents) {
//       try {
//         const emb = await this.ensureDocumentEmbedding(doc);
//         const score = emb.length
//           ? this.cosineSimilarity(queryEmbedding, emb)
//           : 0;
//         const copy: TestDocument = { ...doc };
//         copy.semantic_similarity = score;
//         copy.confidence_score = score;
//         scored.push({ doc: copy, score });
//       } catch (err) {
//         console.log(err);
//         const copy: TestDocument = {
//           ...doc,
//           semantic_similarity: 0,
//           confidence_score: 0,
//         };
//         scored.push({ doc: copy, score: 0 });
//       }
//     }

//     const result = scored
//       .filter(({ score }) => score > similarityThreshold)
//       .sort((a, b) => b.score - a.score)
//       .slice(0, limit)
//       .map(({ doc }) => doc);

//     return result;
//   }

//   /* ---------- Document analysis & chat response ---------- */

//   public async analyzeDocument(
//     title: string,
//     content: string
//   ): Promise<AIAnalysisResult> {
//     const prompt = `
// Проаналізуй документ і поверни JSON з полями:
// 1) summary - 1-2 речення
// 2) simple_explanation - пояснення простою мовою
// 3) key_points - масив 3-5 пунктів
// 4) category - одна з: бюджет, освіта, медицина, транспорт, благоустрій, земельні питання, комунальні послуги, соціальні питання, інше
// 5) confidence - число 0-1

// Назва: ${title}
// Зміст: ${content.slice(0, 4000)}
// `;

//     try {
//       const response = await openai.chat.completions.create({
//         model: ANALYSIS_MODEL,
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.6,
//         max_tokens: 600,
//       });

//       const raw = response.choices?.[0]?.message?.content ?? "{}";
//       const parsed = safeParseJson<Partial<AIAnalysisResult>>(raw);

//       if (!parsed) {
//         throw new Error("Unable to parse analysis response as JSON");
//       }

//       return {
//         summary: parsed.summary ?? "Резюме недоступне",
//         simple_explanation: parsed.simple_explanation ?? "Пояснення недоступне",
//         key_points: parsed.key_points ?? ["Потрібен ручний аналіз"],
//         category: parsed.category ?? "інше",
//         confidence:
//           typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
//       };
//     } catch (err) {
//       console.error("analyzeDocument error", err);
//       return {
//         summary: "Автоматичний аналіз тимчасово недоступний",
//         simple_explanation: "Детальний аналіз документа буде доступний пізніше",
//         key_points: ["Документ потребує ручного аналізу"],
//         category: "інше",
//         confidence: 0.5,
//       };
//     }
//   }

//   public async generateChatResponse(
//     query: string,
//     relevantDocs: TestDocument[]
//   ): Promise<{
//     response: string;
//     sources: Array<{ title: string; confidence: number }>;
//     confidence: number;
//   }> {
//     const docsContext = relevantDocs
//       .map(
//         (d) =>
//           `Документ: ${d.title}\nКоротко: ${
//             d.short ?? ""
//           }\nФрагмент: ${d.content.slice(0, 800)}\n---`
//       )
//       .join("\n");

//     const prompt = `
// Ти — офіційний асистент міської ради. Відповідай українською, спираючись на надані документи.
// Користувацьке запитання: ${query}

// Релевантні документи:
// ${docsContext}

// Дай чітку, корисну відповідь. Якщо інформації замало — чесно напиши, що потрібно уточнити.
// `;

//     try {
//       const response = await openai.chat.completions.create({
//         model: ANALYSIS_MODEL,
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.6,
//         max_tokens: 700,
//       });

//       const text =
//         response.choices?.[0]?.message?.content ??
//         "Вибачте, не вдалося сформувати відповідь.";
//       const maxConfidence = Math.max(
//         ...(relevantDocs.map((d) => d.confidence_score ?? 0.5) || [0.5])
//       );

//       return {
//         response: text,
//         sources: relevantDocs.map((d) => ({
//           title: d.title,
//           confidence: d.confidence_score ?? 0.5,
//         })),
//         confidence: maxConfidence,
//       };
//     } catch (err) {
//       console.error("generateChatResponse error", err);
//       return {
//         response: "Виникла помилка при формуванні відповіді.",
//         sources: [],
//         confidence: 0,
//       };
//     }
//   }

//   /* ---------- Utilities ---------- */

//   private hashString(str: string): string {
//     // simple but deterministic string hash -> string
//     let h = 2166136261 >>> 0;
//     for (let i = 0; i < str.length; i++) {
//       h ^= str.charCodeAt(i);
//       h = Math.imul(h, 16777619);
//     }
//     return (h >>> 0).toString(16);
//   }

//   /* Optional: expose caches for inspection (readonly) */
//   public getCachedEmbeddingForId(id: number): number[] | undefined {
//     return this.embeddingCacheById.get(id);
//   }

//   public clearCaches(): void {
//     this.embeddingCacheById.clear();
//     this.embeddingCacheByText.clear();
//   }
// }

// /* ---------- Export singleton ---------- */

// export const aiService = new AIService();
