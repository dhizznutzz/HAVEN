interface SentimentResult {
  sentiment_score: number;
  risk_level: 'none' | 'low' | 'medium' | 'high';
  positive: number;
  negative: number;
  neutral: number;
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${aiServiceUrl}/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error('Sentiment service unavailable');
    return await response.json();
  } catch {
    // Fallback if Python service is unavailable
    return {
      sentiment_score: 0,
      risk_level: 'none',
      positive: 0.33,
      negative: 0.33,
      neutral: 0.34,
    };
  }
}
