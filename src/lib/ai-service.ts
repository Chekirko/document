// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export interface AIAnalysisResult {
//   summary: string;
//   simple_explanation: string;
//   key_points: string[];
//   category: string;
//   confidence: number;
// }

// export class AIService {
//   async analyzeDocument(
//     title: string,
//     content: string
//   ): Promise<AIAnalysisResult> {
//     const prompt = `
// Проаналізуй цей документ міської ради та дай відповідь у форматі JSON:

// Назва: ${title}
// Зміст: ${content}

// Потрібно створити:
// 1. summary - коротке резюме (1-2 речення)
// 2. simple_explanation - пояснення простою мовою для звичайних громадян
// 3. key_points - масив з 3-5 ключових пунктів
// 4. category - основна категорія (бюджет, освіта, медицина, транспорт, благоустрій, земельні питання, комунальні послуги, соціальні питання, інше)
// 5. confidence - рівень впевненості в аналізі (0-1)

// Відповідай ТІЛЬКИ валідним JSON без додаткового тексту:
// `;

//     try {
//       const response = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.7,
//       });

//       const result = JSON.parse(response.choices[0].message.content || "{}");
//       return result;
//     } catch (error) {
//       console.error("AI Analysis Error:", error);
//       // Fallback response
//       return {
//         summary: "Автоматичний аналіз тимчасово недоступний",
//         simple_explanation: "Детальний аналіз документа буде доступний пізніше",
//         key_points: ["Документ потребує ручного аналізу"],
//         category: "інше",
//         confidence: 0.5,
//       };
//     }
//   }

//   async generateChatResponse(
//     query: string,
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     relevantDocs: any[]
//   ): Promise<{
//     response: string;
//     sources: { title: string; confidence: number }[];
//     confidence: number;
//   }> {
//     const docsContext = relevantDocs
//       .map((doc) => `Документ: ${doc.title}\nЗміст: ${doc.content}\n---`)
//       .join("\n");

//     const prompt = `
// Ти - асистент міської ради, який допомагає громадянам знаходити інформацію в документах.
// Відповідай українською мовою на основі наданих документів.

// Питання користувача: ${query}

// Релевантні документи:
// ${docsContext}

// Дай корисну відповідь на основі цих документів. Якщо інформації недостатньо, чесно про це скажи.
// `;

//     try {
//       const response = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.7,
//       });

//       return {
//         response:
//           response.choices[0].message.content ||
//           "Вибачте, не можу сформувати відповідь",
//         sources: relevantDocs.map((doc) => ({
//           title: doc.title,
//           confidence: 0.8,
//         })),
//         confidence: 0.8,
//       };
//     } catch (error) {
//       console.error("Chat Response Error:", error);
//       return {
//         response: "Вибачте, сталася помилка при обробці вашого запитання.",
//         sources: [],
//         confidence: 0.0,
//       };
//     }
//   }
// }

// export const aiService = new AIService();

import OpenAI from "openai";

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
  async analyzeDocument(
    title: string,
    content: string
  ): Promise<AIAnalysisResult> {
    const prompt = `
Проаналізуй цей документ міської ради та дай відповідь у форматі JSON:

Назва: ${title}
Зміст: ${content}

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
        response_format: { type: "json_object" }, // 🔑 гарантія JSON
      });

      const raw = response.choices[0].message.content || "{}";
      const result = JSON.parse(raw);
      return result;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      // Fallback response
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relevantDocs: any[]
  ): Promise<{
    response: string;
    sources: { title: string; confidence: number }[];
    confidence: number;
  }> {
    const docsContext = relevantDocs
      .map((doc) => `Документ: ${doc.title}\nЗміст: ${doc.content}\n---`)
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
          confidence: 0.8,
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
