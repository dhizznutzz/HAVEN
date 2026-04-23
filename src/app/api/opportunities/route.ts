import { createClient } from '@/lib/supabase/server';

const JSEARCH_HOST = 'jsearch.p.rapidapi.com';
const LINKEDIN_HOST = 'linkedin-job-search-api.p.rapidapi.com';

function mapType(employmentType: string): 'volunteer' | 'internship' | 'program' | 'event' {
  const t = (employmentType ?? '').toUpperCase();
  if (t.includes('INTERN')) return 'internship';
  if (t.includes('PART') || t.includes('VOLUNTEER')) return 'volunteer';
  if (t.includes('CONTRACT') || t.includes('FULL')) return 'internship';
  return 'program';
}

function computeMatch(requiredSkills: string[], userSkills: string[]): number {
  if (!requiredSkills.length || !userSkills.length) return Math.floor(Math.random() * 20 + 60);
  const lower = userSkills.map(s => s.toLowerCase());
  const hits = requiredSkills.filter(s => lower.some(u => s.toLowerCase().includes(u) || u.includes(s.toLowerCase()))).length;
  const raw = Math.round((hits / requiredSkills.length) * 100);
  return Math.min(99, Math.max(50, raw));
}

async function fetchJobs(query: string, numPages = 1) {
  const url = new URL(`https://${JSEARCH_HOST}/search`);
  url.searchParams.set('query', query);
  url.searchParams.set('page', '1');
  url.searchParams.set('num_pages', String(numPages));
  url.searchParams.set('date_posted', 'all');

  const res = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-host': JSEARCH_HOST,
      'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JSearch ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  console.log('[JSearch] status:', json.status, 'count:', json.data?.length ?? 0);
  return (json.data ?? []) as any[];
}

async function fetchLinkedInJobs(keywords: string): Promise<any[]> {
  const url = new URL(`https://${LINKEDIN_HOST}/active-jb-1h`);
  url.searchParams.set('limit', '50');
  url.searchParams.set('offset', '0');
  url.searchParams.set('description_type', 'text');
  if (keywords) url.searchParams.set('keywords', keywords);

  const res = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-host': LINKEDIN_HOST,
      'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const items: any[] = Array.isArray(json) ? json : (json.data ?? json.jobs ?? []);
  console.log('[LinkedIn] count:', items.length);
  return items;
}

function mapLinkedInJob(j: any, userSkills: string[]) {
  const skills: string[] = j.skills ?? j.required_skills ?? [];
  return {
    id: `li_${j.id ?? j.job_id ?? Math.random()}`,
    org_id: j.company?.name ?? j.company_name ?? j.organization ?? '',
    title: j.title ?? j.job_title ?? '',
    description: (j.description ?? j.job_description ?? '').slice(0, 400) || null,
    type: mapType(j.employment_type ?? j.job_type ?? ''),
    location: j.location ?? j.job_location ?? null,
    lat: j.latitude ?? null,
    lng: j.longitude ?? null,
    skills_required: skills.slice(0, 5),
    deadline: j.expiry_date ?? j.job_offer_expiration ?? null,
    slots: null,
    created_at: j.posted_at ?? j.date_posted ?? new Date().toISOString(),
    employer_name: j.company?.name ?? j.company_name ?? j.organization ?? '',
    employer_logo: j.company?.logo ?? j.company_logo ?? null,
    apply_url: j.url ?? j.apply_url ?? j.job_url ?? null,
    match_score: computeMatch(skills, userSkills),
    source: 'linkedin',
  };
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const queryParam = searchParams.get('query') ?? '';
  const typeParam = searchParams.get('type') ?? 'all';

  // Get user profile for personalised matching
  const { data: { user } } = await supabase.auth.getUser();
  let userSkills: string[] = [];
  let userInterests: string[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, interests')
      .eq('id', user.id)
      .single();
    userSkills = profile?.skills ?? [];
    userInterests = profile?.interests ?? [];
  }

  // Build search query — use user skills if no explicit query
  let searchQuery = queryParam;
  if (!searchQuery) {
    const terms = [...userSkills, ...userInterests].slice(0, 2);
    searchQuery = terms.length
      ? `${terms.join(' ')} jobs Malaysia`
      : 'software engineer jobs Malaysia';
  } else if (!searchQuery.toLowerCase().includes('malaysia')) {
    searchQuery = `${searchQuery} Malaysia`;
  }

  const keywords = queryParam || [...userSkills, ...userInterests].slice(0, 2).join(' ');

  const [jsearchResult, linkedinResult] = await Promise.allSettled([
    fetchJobs(searchQuery).catch(err => { console.error('[JSearch]', err); return []; }),
    fetchLinkedInJobs(keywords).catch(err => { console.error('[LinkedIn]', err); return []; }),
  ]);

  const jsearchJobs: any[] = jsearchResult.status === 'fulfilled' ? jsearchResult.value : [];
  const linkedinJobs: any[] = linkedinResult.status === 'fulfilled' ? linkedinResult.value : [];

  if (!jsearchJobs.length && !linkedinJobs.length) {
    const { data } = await supabase
      .from('opportunities')
      .select('*, profiles(username, display_name)')
      .order('created_at', { ascending: false });
    return Response.json(data ?? []);
  }

  const mappedJSearch = jsearchJobs
    .filter((j: any) => j.job_title && j.employer_name)
    .map((j: any) => ({
      id: j.job_id,
      org_id: j.employer_name,
      title: j.job_title,
      description: (j.job_description ?? '').slice(0, 400) || null,
      type: mapType(j.job_employment_type ?? ''),
      location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', ') || null,
      lat: j.job_latitude ?? null,
      lng: j.job_longitude ?? null,
      skills_required: (j.job_required_skills ?? j.job_highlights?.Qualifications ?? []).slice(0, 5),
      deadline: j.job_offer_expiration_datetime_utc ?? null,
      slots: null,
      created_at: j.job_posted_at_datetime_utc ?? new Date().toISOString(),
      employer_name: j.employer_name,
      employer_logo: j.employer_logo ?? null,
      apply_url: j.job_apply_link ?? null,
      match_score: computeMatch(j.job_required_skills ?? [], userSkills),
      source: 'jsearch',
    }));

  const mappedLinkedIn = linkedinJobs
    .filter((j: any) => (j.title ?? j.job_title) && (j.company?.name ?? j.company_name ?? j.organization))
    .map((j: any) => mapLinkedInJob(j, userSkills));

  // Deduplicate by normalised title+company key
  const seen = new Set<string>();
  const merged = [...mappedJSearch, ...mappedLinkedIn].filter(o => {
    const key = `${o.title.toLowerCase()}|${o.employer_name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const opportunities = merged
    .filter((o: any) => typeParam === 'all' || o.type === typeParam)
    .sort((a: any, b: any) => (b.match_score ?? 0) - (a.match_score ?? 0));

  return Response.json(opportunities);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase
    .from('opportunities')
    .insert({ ...body, org_id: user.id })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
