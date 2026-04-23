import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userSkills, userLevel, recentActivity } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({
        skills: [
          { name: 'Python', reason: 'High demand in Malaysian tech sector', resources: ['freeCodeCamp', 'CS50P'] },
          { name: 'UI/UX Design', reason: 'Growing market for digital products', resources: ['Figma Community', 'Google UX Certificate'] },
          { name: 'Data Analysis', reason: 'Essential for modern business roles', resources: ['Kaggle', 'Google Data Analytics'] },
        ],
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are a career and skills advisor for Malaysian youth aged 15-30.
    Recommend the next 3 skills to learn based on the user's profile.
    Consider local job market trends in Malaysia.
    Be specific, practical, and encouraging.
    Respond ONLY in valid JSON with no markdown: { "skills": [{"name": "", "reason": "", "resources": [""]}] }`,
    });

    const result = await model.generateContent(
      `Current skills: ${userSkills.join(', ')}. Level: ${userLevel}. Recent activity: ${recentActivity}`
    );

    const text = result.response.text();
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return Response.json(JSON.parse(cleaned));
  } catch (error) {
    console.error('Recommend API error:', error);
    const is429 = String(error).includes('429');
    if (is429) {
      return Response.json({
        skills: [
          { name: 'Python', reason: 'High demand in Malaysian tech sector', resources: ['freeCodeCamp', 'CS50P'] },
          { name: 'UI/UX Design', reason: 'Growing market for digital products', resources: ['Figma Community', 'Google UX Certificate'] },
          { name: 'Data Analysis', reason: 'Essential for modern business roles', resources: ['Kaggle', 'Google Data Analytics'] },
        ],
      });
    }
    return Response.json({ skills: [] }, { status: 500 });
  }
}
