// import { AIAnalysisResult } from "./ai-service";
import { TestDocument } from "@/types";

export interface SearchResult extends TestDocument {
  confidence_score: number;
  matched_fields: string[];
  highlight_snippets: string[];
}

export class SearchUtils {
  // Покращена функція семантичного пошуку
  static performSemanticSearch(
    query: string,
    documents: TestDocument[],
    limit: number = 20
  ): SearchResult[] {
    const queryWords = this.tokenize(query.toLowerCase());

    const results = documents.map((doc) => {
      const docText = `${doc.title} ${doc.content} ${doc.categories.join(
        " "
      )} ${doc.summary || ""} ${doc.simple_explanation || ""}`.toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const docWords = this.tokenize(docText);

      // Розрахунок різних типів збігів
      const titleScore = this.calculateFieldScore(
        queryWords,
        doc.title.toLowerCase(),
        3.0
      );
      const contentScore = this.calculateFieldScore(
        queryWords,
        doc.content.toLowerCase(),
        1.0
      );
      const categoryScore = this.calculateFieldScore(
        queryWords,
        doc.categories.join(" ").toLowerCase(),
        2.0
      );
      const summaryScore = this.calculateFieldScore(
        queryWords,
        (doc.summary || "").toLowerCase(),
        1.5
      );

      // Комбінований скор
      const totalScore =
        titleScore + contentScore + categoryScore + summaryScore;
      const normalizedScore = Math.min(1.0, totalScore / queryWords.length);

      // Визначаємо в яких полях знайдені збіги
      const matchedFields: string[] = [];
      if (titleScore > 0) matchedFields.push("title");
      if (contentScore > 0) matchedFields.push("content");
      if (categoryScore > 0) matchedFields.push("categories");
      if (summaryScore > 0) matchedFields.push("summary");

      // Створюємо виділені фрагменти
      const highlightSnippets = this.createHighlightSnippets(query, doc);

      return {
        ...doc,
        confidence_score: normalizedScore,
        matched_fields: matchedFields,
        highlight_snippets: highlightSnippets,
      };
    });

    return results
      .filter((result) => result.confidence_score > 0.1)
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, limit);
  }

  // Токенізація тексту
  private static tokenize(text: string): string[] {
    return text
      .replace(/[^\w\sа-яїієґ]/gi, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .map((word) => word.toLowerCase());
  }

  // Розрахунок скору для конкретного поля
  private static calculateFieldScore(
    queryWords: string[],
    fieldText: string,
    weight: number
  ): number {
    let score = 0;
    const fieldWords = this.tokenize(fieldText);

    for (const queryWord of queryWords) {
      for (const fieldWord of fieldWords) {
        if (fieldWord.includes(queryWord) || queryWord.includes(fieldWord)) {
          // Точний збіг дає більший скор
          const similarity =
            queryWord === fieldWord
              ? 1.0
              : Math.max(queryWord.length, fieldWord.length) /
                (queryWord.length + fieldWord.length);
          score += similarity * weight;
        }
      }
    }

    return score;
  }

  // Створення виділених фрагментів
  private static createHighlightSnippets(
    query: string,
    doc: TestDocument
  ): string[] {
    const snippets: string[] = [];
    const queryWords = this.tokenize(query.toLowerCase());

    // Шукаємо фрагменти в заголовку
    if (queryWords.some((word) => doc.title.toLowerCase().includes(word))) {
      snippets.push(doc.title);
    }

    // Шукаємо фрагменти в резюме
    if (
      doc.summary &&
      queryWords.some((word) => doc.summary!.toLowerCase().includes(word))
    ) {
      snippets.push(doc.summary);
    }

    // Шукаємо фрагменти в контенті
    const sentences = doc.content.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (queryWords.some((word) => sentence.toLowerCase().includes(word))) {
        const snippet = sentence.trim();
        if (snippet.length > 20) {
          snippets.push(snippet);
          if (snippets.length >= 3) break;
        }
      }
    }

    return snippets.slice(0, 3);
  }

  // Знаходження схожих документів
  static findRelatedDocuments(
    targetDoc: TestDocument,
    allDocuments: TestDocument[],
    limit: number = 5
  ): TestDocument[] {
    const targetCategories = new Set(targetDoc.categories);

    const related = allDocuments
      .filter((doc) => doc.id !== targetDoc.id)
      .map((doc) => {
        let similarity = 0;

        // Схожість за категоріями
        const commonCategories = doc.categories.filter((cat) =>
          targetCategories.has(cat)
        ).length;
        similarity +=
          commonCategories /
          Math.max(targetCategories.size, doc.categories.length);

        // Схожість за типом документа
        if (doc.document_type === targetDoc.document_type) {
          similarity += 0.3;
        }

        // Схожість за ключовими словами в заголовку
        const titleWords1 = this.tokenize(targetDoc.title.toLowerCase());
        const titleWords2 = this.tokenize(doc.title.toLowerCase());
        const commonTitleWords = titleWords1.filter((word) =>
          titleWords2.some((w) => w.includes(word) || word.includes(w))
        ).length;
        similarity +=
          (commonTitleWords /
            Math.max(titleWords1.length, titleWords2.length)) *
          0.5;

        return { ...doc, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return related.map(({ similarity, ...doc }) => doc);
  }

  // Категоризація документа на основі контенту
  static categorizeDocument(doc: TestDocument): string {
    const text = `${doc.title} ${doc.content}`.toLowerCase();

    const categoryKeywords = {
      бюджет: [
        "бюджет",
        "кошти",
        "гривень",
        "фінанс",
        "витрат",
        "дохід",
        "грошей",
        "виділ",
      ],
      освіта: [
        "школ",
        "освіт",
        "учні",
        "вчител",
        "навчан",
        "дитяч",
        "садок",
        "студент",
      ],
      медицина: [
        "медицин",
        "лікарн",
        "здоров",
        "поліклінік",
        "лікар",
        "пацієнт",
        "ліцензу",
      ],
      транспорт: [
        "транспорт",
        "дорог",
        "автобус",
        "тролейбус",
        "тротуар",
        "проїзд",
        "маршрут",
      ],
      благоустрій: [
        "благоустрій",
        "парк",
        "сквер",
        "озеленен",
        "прибиран",
        "лавочк",
        "майданчик",
      ],
      "комунальні послуги": [
        "комунальн",
        "вод",
        "теплопостач",
        "електр",
        "газ",
        "каналізац",
        "тариф",
      ],
      будівництво: [
        "будівництв",
        "ремонт",
        "реконструкц",
        "будівел",
        "споруд",
        "капітальн",
      ],
      культура: [
        "культур",
        "мистецтв",
        "театр",
        "музей",
        "бібліотек",
        "концерт",
        "фестивал",
      ],
      спорт: [
        "спорт",
        "стадіон",
        "спортзал",
        "змаган",
        "тренер",
        "секції",
        "фізкультур",
      ],
    };

    let maxScore = 0;
    let bestCategory = "інше";

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.reduce((sum, keyword) => {
        const matches = (text.match(new RegExp(keyword, "g")) || []).length;
        return sum + matches;
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  // Генерація тегів для документа
  static generateTags(doc: TestDocument): string[] {
    const text = `${doc.title} ${doc.content} ${
      doc.summary || ""
    }`.toLowerCase();

    const commonTags = [
      "рішення",
      "розпорядження",
      "проект",
      "програма",
      "план",
      "бюджет",
      "кошти",
      "фінансування",
      "виділення",
      "витрати",
      "місто",
      "міський",
      "міська",
      "громада",
      "мешканці",
      "розвиток",
      "модернізація",
      "покращення",
      "створення",
      "безпека",
      "якість",
      "сервіс",
      "послуги",
    ];

    const foundTags = commonTags.filter(
      (tag) => text.includes(tag) || text.includes(tag.slice(0, -1))
    );

    // Додаємо категорії як теги
    foundTags.push(...doc.categories);

    // Видаляємо дублікати та обмежуємо кількість
    return Array.from(new Set(foundTags)).slice(0, 8);
  }
}
