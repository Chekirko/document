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
3. key_points - масив з 3-5 ключових пунктів, , які були б корисними і цікавими для мешканців, і які були б змістовними (кожен пункт - повноцінне речення. Наприклад: "Програма сприяння діяльності ОСББ у Бориславі надає мешканцям фінансову підтримку для проведення капітальних ремонтів (покрівель, мереж, утеплення фасадів тощо) багатоквартирних будинків. 

Найбільш дієвим стимулом є співфінансування цих робіт, де частка міського бюджету становить 70%, а внесок співвласників — 30% від загальної вартості. 

ОСББ отримують можливість відмовлятися від неякісних послуг та вибирати компанію-виконавця, а також залучати грантові та кредитні кошти для енергозберігаючих заходів. 

Програма також покриває витрати на виготовлення технічного паспорта на будинок та забезпечує навчальну і практичну допомогу при створенні та діяльності об'єднань")
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
    // Створюємо контекст з нумерованими документами
    const docsContext = relevantDocs
      .map(
        (doc, idx) =>
          `[ДОКУМЕНТ_${idx}] (реальний ID: ${doc.id})
Назва: ${doc.title}
Зміст: ${doc.content}
---`
      )
      .join("\n\n");

    const prompt = `
  Ти - асистент міської ради, який допомагає громадянам знаходити інформацію в документах.
  Відповідай виключно українською мовою на основі наданих документів.

  Питання користувача: ${query}

  Релевантні документи:
  ${docsContext}

  ІНСТРУКЦІЇ:
1. Уважно прочитай кожен документ. ОСОБЛИВО УВАЖНО читай поле content КОЖНОГО ДОКУМЕНТА!
2. Знайди конкретну інформацію, що відповідає на питання
3. Якщо інформація є в документах - ОБОВ'ЯЗКОВО її використай. Якщо в документах є релевантна інформація - ти ПОВИНЕН її знайти та використати!
4. Вкажи точні цифри, дати, суми якщо вони є
5. Обов'язково вкажи ID документів, звідки взята інформація

КРИТИЧНО ВАЖЛИВО ПРО ID:
- Кожен документ має ID  на початку, перед назвою.
- В used_doc_ids вказуй ТОЧНО ці числа (ID документа)
- Перевіряй двічі, що вказуєш правильний ID документа, з якого взяв інформацію

  ВАЖЛИВО:
  1. Дай корисну відповідь на основі цих документів
  2. Якщо інформації недостатньо, чесно про це скажи. Також треба гарно пожартувати, якщо нема відповіді. Наприклад на запитання "Чи купляла міська рада в цьому році слона?", якщо нема відповіді, то можна жартома відповісти "Ні. Жодна притомна тварина не погодиться працювати в комунальній сфері"
  3. Поверни відповідь у JSON форматі:
  {
    "answer": "твоя відповідь тут" // детальна відповідь з конкретними даними
    "used_doc_indices": [0, 2] // масив НОМЕРІВ документів (0, 1, 2...)  які ти РЕАЛЬНО використав для відповіді
  }

  Якщо жоден документ не містить релевантної інформації, used_doc_indices має бути порожнім масивом [].
  `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0].message.content || "{}";
      const parsed = JSON.parse(raw) as {
        answer?: string;
        used_doc_indices?: number[];
      };

      const answerText =
        parsed.answer || "Вибачте, не можу сформувати відповідь";
      const usedIndices = new Set(parsed.used_doc_indices || []);
      const actuallyUsedDocs = relevantDocs.filter((_, idx) =>
        usedIndices.has(idx)
      );

      // Якщо AI не вказав жодного документа, але дав відповідь - беремо топ-3 за confidence
      const sourcesToReturn =
        actuallyUsedDocs.length > 0
          ? actuallyUsedDocs
          : relevantDocs.slice(0, 3);

      const maxConfidence =
        sourcesToReturn.length > 0
          ? Math.max(...sourcesToReturn.map((d) => d.confidence_score ?? 0.5))
          : 0.3;

      return {
        response: answerText,
        sources: sourcesToReturn.map((doc) => ({
          title: doc.title,
          confidence: doc.confidence_score ?? 0.8,
        })),
        confidence: maxConfidence,
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
