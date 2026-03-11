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

const TEAM_ALIASES: Record<string, string[]> = {
  'wolves':         ['wolverhampton'],
  'spurs':          ['tottenham'],
  'man utd':        ['manchester united'],
  'man united':     ['manchester united'],
  'man u':          ['manchester united'],
  'man city':       ['manchester city'],
  'man c':          ['manchester city'],
  'barca':          ['barcelona'],
  'fcb':            ['barcelona'],
  'atletico':       ['atlético'],
  'atletico madrid':['atlético madrid'],
  'psg':            ['paris saint-germain', 'paris'],
  'paris sg':       ['paris saint-germain'],
  'inter':          ['inter milan', 'internazionale'],
  'inter milan':    ['internazionale'],
  'ac milan':       ['milan'],
  'bayern':         ['bayern munich', 'fc bayern'],
  'dortmund':       ['borussia dortmund'],
  'bvb':            ['borussia dortmund'],
  'gladbach':       ['borussia mönchengladbach'],
  'leverkusen':     ['bayer leverkusen'],
  'juve':           ['juventus'],
  'napoli':         ['ssc napoli'],
  'roma':           ['as roma'],
  'lazio':          ['ss lazio'],
  'ajax':           ['afc ajax'],
  'celtic':         ['celtic fc'],
  'rangers':        ['rangers fc'],
  'newcastle':      ['newcastle united'],
  'villa':          ['aston villa'],
  'west ham':       ['west ham united'],
  'forest':         ['nottingham forest'],
  'nott':           ['nottingham'],
  'brighton':       ['brighton & hove albion', 'brighton and hove'],
  'leicester':      ['leicester city'],
  'boro':           ['middlesbrough'],
  'sheff utd':      ['sheffield united'],
  'sheff wed':      ['sheffield wednesday'],
  'palace':         ['crystal palace'],
  'saints':         ['southampton'],
  'hammers':        ['west ham'],
  'gooners':        ['arsenal'],
  'gunners':        ['arsenal'],
  'blues':          ['chelsea', 'everton', 'birmingham'],
  'toffees':        ['everton'],
  'reds':           ['liverpool', 'manchester united'],
  'foxes':          ['leicester'],
  'hornets':        ['watford'],
  'bees':           ['brentford'],
  'cherries':       ['bournemouth'],
  'swans':          ['swansea'],
  'blades':         ['sheffield united'],
  'clarets':        ['burnley'],
};

export const COMPETITION_ALIASES: Record<string, string[]> = {
  'ucl':            ['champions league'],
  'cl':             ['champions league'],
  'champions':      ['champions league'],
  'prem':           ['premier league'],
  'epl':            ['premier league'],
  'pl':             ['premier league'],
  'bpl':            ['premier league'],
  'laliga':         ['la liga'],
  'primera':        ['la liga'],
  'bundes':         ['bundesliga'],
  'serie':          ['serie a'],
  'calcio':         ['serie a'],
  'ligue':          ['ligue 1'],
  'ligue 1':        ['ligue 1'],
  'championship':   ['championship'],
  'champ':          ['championship'],
  'el':             ['europa league'],
  'uel':            ['europa league'],
  'fa cup':         ['fa cup'],
  'facup':          ['fa cup'],
  'carabao':        ['carabao cup', 'efl cup'],
  'league cup':     ['carabao cup', 'efl cup'],
};

// Expand a query using alias maps — returns all terms to search for
export const expandQuery = (
  query: string,
  aliasMap: Record<string, string[]>
): string[] => {
  const q = query.toLowerCase().trim();
  const terms = new Set<string>([q]);
  const expansions = aliasMap[q];     
  if (expansions) expansions.forEach(e => terms.add(e));
  return Array.from(terms);
};

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

// In-memory cache so we only fetch all teams once per app session
let teamCache: Team[] | null = null;
let teamCacheLoading: Promise<Team[]> | null = null;

const loadAllTeams = (): Promise<Team[]> => {
  // Return cached result immediately
  if (teamCache) return Promise.resolve(teamCache);
  // Return in-flight request if already loading
  if (teamCacheLoading) return teamCacheLoading;

  // Fetch competitions sequentially to avoid rate limiting
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
      } catch {}
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
  const terms = expandQuery(query, TEAM_ALIASES);
  return allTeams.filter(t => {
    const name = t.name.toLowerCase();
    const short = t.shortName?.toLowerCase() ?? '';
    const tla = t.tla?.toLowerCase() ?? '';
    return terms.some(term =>
      name.includes(term) || short.includes(term) || tla.includes(term)
    );
  });
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

// In-memory cache per competition code
const matchCache: Record<string, Match[]> = {};
let allMatchesCache: Match[] | null = null;
let allMatchesCacheLoading: Promise<Match[]> | null = null;

export const getMatchesByCompetition = async (
  competitionCode: string,
  matchday?: number
): Promise<Match[]> => {
  const cacheKey = matchday ? `${competitionCode}-${matchday}` : competitionCode;
  if (matchCache[cacheKey]) return matchCache[cacheKey];

  const url = matchday
    ? `${API_BASE}/competitions/${competitionCode}/matches?matchday=${matchday}`
    : `${API_BASE}/competitions/${competitionCode}/matches?status=FINISHED&limit=10`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch matches: ${res.status}`);
  const data = await res.json();
  const matches = data.matches ?? [];
  matchCache[cacheKey] = matches;
  return matches;
};

const loadAllMatches = (): Promise<Match[]> => {
  if (allMatchesCache) return Promise.resolve(allMatchesCache);
  if (allMatchesCacheLoading) return allMatchesCacheLoading;

  allMatchesCacheLoading = (async () => {
    const all: Match[] = [];
    const seen = new Set<number>();

    for (const comp of SUPPORTED_COMPETITIONS) {
      try {
        const matches = await getMatchesByCompetition(comp.code);
        for (const m of matches) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            all.push(m);
          }
        }
        await new Promise(r => setTimeout(r, 200));
      } catch {}
    }

    allMatchesCache = all;
    allMatchesCacheLoading = null;
    return all;
  })();

  return allMatchesCacheLoading;
};

export const searchMatches = async (query: string): Promise<Match[]> => {
  if (!query.trim()) return [];
  const all = await loadAllMatches();
  const terms = expandQuery(query, { ...TEAM_ALIASES, ...COMPETITION_ALIASES });
  return all.filter(m => {
    const home = m.homeTeam.name.toLowerCase();
    const away = m.awayTeam.name.toLowerCase();
    const comp = m.competition.name.toLowerCase();
    return terms.some(term =>
      home.includes(term) || away.includes(term) || comp.includes(term)
    );
  });
};

export const getMatchById = async (matchId: number): Promise<Match> => {
  const res = await fetch(`${API_BASE}/matches/${matchId}`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch match: ${res.status}`);
  return res.json();
};