import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are Rakan, a warm and compassionate AI wellbeing companion on HAVEN,
a youth platform in Malaysia. You support users aged 15-30 who may be dealing with stress,
exam pressure, social anxiety, family issues, or loneliness.

Your approach:
- Be empathetic first. Always acknowledge feelings before offering advice.
- Use gentle CBT techniques: thought reframing, grounding exercises, journaling prompts.
- Speak naturally, mixing English and simple Malay words occasionally (e.g. "Jangan risau", "Semua okay").
- NEVER diagnose. NEVER give medical advice.
- If the user expresses suicidal ideation, self-harm, or severe crisis:
  immediately respond with empathy, then say:
  "I want to make sure you get the right support right now.
  Please reach out to Befrienders Malaysia: 03-7627 2929 (free, 24/7).
  I can also connect you to a real counselor here on HAVEN — would that help?"
- Keep responses concise: 3-5 sentences max unless the user needs more.
- Do not push users to keep talking to you. Encourage real support when appropriate.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        'Rakan is not configured yet. Please add GEMINI_API_KEY to your environment variables.',
        { headers: { 'Content-Type': 'text/plain' } }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Companion API error:', error);
    const is429 = String(error).includes('429');
    const message = is429
      ? "Rakan is resting for a moment — our AI is a bit busy right now. Please try again in a little while. Jangan risau, I'm still here for you!"
      : 'Maaf, there was an error. Please try again.';
    return new Response(message, {
      status: is429 ? 200 : 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
