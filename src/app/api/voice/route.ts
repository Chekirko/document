import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe", // або "whisper-1"
      language: "uk",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("Voice recognition error:", error);
    return NextResponse.json(
      { error: "Помилка під час розпізнавання голосу" },
      { status: 500 }
    );
  }
}
