import { analyzeSentiment } from '@/lib/ai/sentiment';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return Response.json({ error: 'No text provided' }, { status: 400 });

    const result = await analyzeSentiment(text);
    return Response.json(result);
  } catch (error) {
    console.error('Sentiment API error:', error);
    return Response.json({
      sentiment_score: 0,
      risk_level: 'none',
      positive: 0.33,
      negative: 0.33,
      neutral: 0.34,
    });
  }
}
