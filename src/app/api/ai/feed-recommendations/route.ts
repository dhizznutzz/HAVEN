import { GoogleGenerativeAI } from '@google/generative-ai';
import { ALL_CIRCLES } from '@/data/circles-data';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Compact circle list for AI context
const CIRCLES_CONTEXT = ALL_CIRCLES.map(c =>
  `${c.id} | ${c.name} | ${c.category} | tags: ${c.interest_tags.join(', ')}`
).join('\n');

const FALLBACK_SKILLS = [
  { name: 'Python Programming', reason: 'High demand in Malaysian tech and data roles', resources: ['freeCodeCamp', 'CS50P'] },
  { name: 'UI/UX Design', reason: 'Growing need for product designers in KL', resources: ['Figma Community', 'Google UX Certificate'] },
  { name: 'Public Speaking', reason: 'Valued across every Malaysian career path', resources: ['Toastmasters Malaysia', 'TED Masterclass'] },
];

export async function POST(req: Request) {
  try {
    const { likedPosts } = await req.json() as {
      likedPosts: { tags: string[]; pillar: string; content: string }[];
    };

    if (!likedPosts?.length) {
      return Response.json({ circles: [], skills: FALLBACK_SKILLS, opportunity_types: [] });
    }

    // Build interest summary from liked posts
    const allTags = likedPosts.flatMap(p => p.tags);
    const tagFreq = allTags.reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    const topTags = Object.entries(tagFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
    const pillars = [...new Set(likedPosts.map(p => p.pillar))];
    const contentSnippets = likedPosts.slice(0, 3).map(p => p.content.slice(0, 120)).join(' | ');

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(clientFallback(topTags, pillars));
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are a recommendation engine for HAVEN, a Malaysian youth platform.
Analyse the user's liked content and return personalised recommendations.
Respond ONLY in valid JSON with no markdown fences.`,
    });

    const prompt = `The user has liked ${likedPosts.length} post(s) about: ${topTags.join(', ')}.
Pillars engaged: ${pillars.join(', ')}.
Sample content: "${contentSnippets}"

Available circles (id | name | category | tags):
${CIRCLES_CONTEXT}

Return JSON with exactly this shape:
{
  "circle_ids": ["<3 circle IDs from the list above that best match>"],
  "skills": [
    { "name": "...", "reason": "...(1 short sentence, Malaysia-relevant)", "resources": ["...", "..."] }
  ],
  "opportunity_types": ["volunteer|internship|program|event (pick 1-2 that fit)"],
  "summary": "...(1 sentence: what this user seems interested in)"
}
Skills should be exactly 3, relevant to Malaysian youth job market aged 15-30.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Resolve circle IDs to full circle data
    const circles = (parsed.circle_ids as string[])
      .map(id => ALL_CIRCLES.find(c => c.id === id))
      .filter(Boolean)
      .slice(0, 3)
      .map(c => ({ id: c!.id, name: c!.name, emoji: c!.emoji, category: c!.category, member_count: c!.member_count }));

    return Response.json({
      circles,
      skills: parsed.skills?.slice(0, 3) ?? FALLBACK_SKILLS,
      opportunity_types: parsed.opportunity_types ?? [],
      summary: parsed.summary ?? '',
      top_tags: topTags,
    });

  } catch (error) {
    const is429 = String(error).includes('429');
    if (is429) {
      const { likedPosts } = await req.json().catch(() => ({ likedPosts: [] }));
      const tags = (likedPosts as any[]).flatMap((p: any) => p.tags ?? []);
      return Response.json(clientFallback(tags, []));
    }
    console.error('feed-recommendations error:', error);
    return Response.json({ circles: [], skills: FALLBACK_SKILLS, opportunity_types: [] });
  }
}

function clientFallback(tags: string[], pillars: string[]) {
  // Score circles by tag overlap
  const scored = ALL_CIRCLES.map(c => ({
    id: c.id, name: c.name, emoji: c.emoji, category: c.category, member_count: c.member_count,
    score: c.interest_tags.filter(t => tags.some(ut => ut.includes(t) || t.includes(ut))).length,
  }));
  const circles = scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const fallbackCircles = circles.length > 0 ? circles : ALL_CIRCLES.slice(0, 3).map(c => ({
    id: c.id, name: c.name, emoji: c.emoji, category: c.category, member_count: c.member_count,
  }));

  const oppTypes = pillars.includes('connect') ? ['volunteer', 'program']
    : pillars.includes('grow') ? ['internship', 'program']
    : ['internship', 'volunteer'];

  return {
    circles: fallbackCircles,
    skills: FALLBACK_SKILLS,
    opportunity_types: oppTypes,
    top_tags: tags.slice(0, 5),
  };
}
