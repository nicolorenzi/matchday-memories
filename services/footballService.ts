const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_API_KEY ?? '';

const headers = {
  'X-Auth-Token': API_KEY,
};

export interface Competition {
  id: number;
  name: string;
  code: string;
  emblem: string;
  area: { name: string; flag: string };
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  venue?: string;
  website?: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number;
  competition: { id: number; name: string; emblem: string };
  homeTeam: { id: number; name: string; crest: string };
  awayTeam: { id: number; name: string; crest: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

export const SUPPORTED_COMPETITIONS = [
  { code: 'PL',  name: 'Premier League' },
  { code: 'CL',  name: 'Champions League' },
  { code: 'PD',  name: 'La Liga' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'SA',  name: 'Serie A' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'ELC', name: 'Championship' },
];

export const getCompetitions = async (): Promise<Competition[]> => {
  const res = await fetch(`${API_BASE}/competitions?plan=TIER_ONE`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch competitions: ${res.status}`);
  const data = await res.json();
  return data.competitions ?? [];
};

// In-memory cache
let teamCache: Team[] | null = null;
let teamCacheLoading: Promise<Team[]> | null = null;

const loadAllTeams = (): Promise<Team[]> => {
  if (teamCache) return Promise.resolve(teamCache);
  if (teamCacheLoading) return teamCacheLoading;

  // Fetch competitions sequentially to avoid rate limiting (10 req/min on free tier)
  teamCacheLoading = (async () => {
    const allTeams: Team[] = [];
    const seen = new Set<number>();

    for (const comp of SUPPORTED_COMPETITIONS) {
      try {
        const res = await fetch(`${API_BASE}/competitions/${comp.code}/teams`, { headers });
        if (!res.ok) continue;
        const data = await res.json();
        for (const team of (data.teams ?? []) as Team[]) {
          if (!seen.has(team.id)) {
            seen.add(team.id);
            allTeams.push(team);
          }
        }
        // Small delay between requests to stay within rate limit
        await new Promise(r => setTimeout(r, 200));
      } catch {
        // skip failed competition silently
      }
    }

    teamCache = allTeams;
    teamCacheLoading = null;
    return allTeams;
  })();

  return teamCacheLoading;
};

export const searchTeams = async (query: string): Promise<Team[]> => {
  if (!query.trim()) return [];
  const allTeams = await loadAllTeams();
  const q = query.toLowerCase();
  return allTeams.filter(
    t =>
      t.name.toLowerCase().includes(q) ||
      t.shortName?.toLowerCase().includes(q) ||
      t.tla?.toLowerCase().includes(q)
  );
};

export const getTeamMatches = async (teamId: number, limit = 10): Promise<Match[]> => {
  const res = await fetch(
    `${API_BASE}/teams/${teamId}/matches?status=FINISHED&limit=${limit}`,
    { headers }
  );
  if (!res.ok) throw new Error(`Failed to fetch team matches: ${res.status}`);
  const data = await res.json();
  return data.matches ?? [];
};

export const getMatchesByCompetition = async (
  competitionCode: string,
  matchday?: number
): Promise<Match[]> => {
  const url = matchday
    ? `${API_BASE}/competitions/${competitionCode}/matches?matchday=${matchday}`
    : `${API_BASE}/competitions/${competitionCode}/matches?status=FINISHED&limit=10`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch matches: ${res.status}`);
  const data = await res.json();
  return data.matches ?? [];
};

export const getMatchById = async (matchId: number): Promise<Match> => {
  const res = await fetch(`${API_BASE}/matches/${matchId}`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch match: ${res.status}`);
  return res.json();
};