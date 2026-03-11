// Users can: 
// - Search for:
//  matches -> clicking match takes you to match details page, can choose to rate or review
//  teams -> clicking team takes you to team details page (all games per competiton, can choose year)
//  competitions -> clicking competition takes you to comp details page (all games per season, can choose year)

import {
  Competition,
  COMPETITION_ALIASES,
  expandQuery,
  getCompetitions,
  Match,
  searchMatches,
  searchTeams,
  Team,
} from '@/services/footballService';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'matches' | 'teams' | 'competitions';

const formatDate = (utcDate: string) => {
  const d = new Date(utcDate);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatScore = (match: Match) => {
  const { home, away } = match.score.fullTime;
  if (home === null || away === null) return 'vs';
  return `${home} – ${away}`;
};

// Row components 

const MatchRow = ({ match, onPress }: { match: Match; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.matchMeta}>
      <Text style={styles.competitionLabel}>{match.competition.name.toUpperCase()}</Text>
      <Text style={styles.dateLabel}>{formatDate(match.utcDate)}</Text>
    </View>
    <View style={styles.matchRow}>
      <View style={styles.teamSide}>
        {match.homeTeam.crest
          ? <Image source={{ uri: match.homeTeam.crest }} style={styles.crest} />
          : <View style={styles.crestPlaceholder} />}
        <Text style={styles.teamName} numberOfLines={1}>{match.homeTeam.name}</Text>
      </View>
      <Text style={styles.score}>{formatScore(match)}</Text>
      <View style={[styles.teamSide, styles.teamSideRight]}>
        <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={1}>{match.awayTeam.name}</Text>
        {match.awayTeam.crest
          ? <Image source={{ uri: match.awayTeam.crest }} style={styles.crest} />
          : <View style={styles.crestPlaceholder} />}
      </View>
    </View>
  </TouchableOpacity>
);

const TeamRow = ({ team, onPress }: { team: Team; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowInner}>
      {team.crest
        ? <Image source={{ uri: team.crest }} style={styles.crest} />
        : <View style={styles.crestPlaceholder} />}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{team.name}</Text>
        {team.venue ? <Text style={styles.rowSub}>{team.venue.toUpperCase()}</Text> : null}
      </View>
      <Text style={styles.arrow}>›</Text>
    </View>
  </TouchableOpacity>
);

const CompetitionRow = ({ competition, onPress }: { competition: Competition; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowInner}>
      {competition.emblem
        ? <Image source={{ uri: competition.emblem }} style={styles.crest} />
        : <View style={styles.crestPlaceholder} />}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{competition.name}</Text>
        <Text style={styles.rowSub}>{competition.area.name.toUpperCase()}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </View>
  </TouchableOpacity>
);

export default function SearchScreen() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const [hasSearched, setHasSearched] = useState(false);

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);

  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload competitions once
  useEffect(() => {
    getCompetitions().then(setAllCompetitions).catch(() => {});
  }, []);

  // On each query change, fetch/filter all three types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setHasSearched(false);
      setAllMatches([]);
      setAllTeams([]);
      return;
    }

    setHasSearched(true);
    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const [teamsResult, matchesResult] = await Promise.allSettled([
          searchTeams(query),
          searchMatches(query),
        ]);

        if (teamsResult.status === 'fulfilled') setAllTeams(teamsResult.value);
        if (matchesResult.status === 'fulfilled') setAllMatches(matchesResult.value);
      } catch {

      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query]);

  // Competitions filtered client-side
  const filteredCompetitions = allCompetitions.filter(c => {
    if (!query.trim()) return false;
    const terms = expandQuery(query, COMPETITION_ALIASES);
    return terms.some(term =>
      c.name.toLowerCase().includes(term) ||
      c.area.name.toLowerCase().includes(term)
    );
  });

  const activeData: (Match | Team | Competition)[] =
    activeTab === 'matches' ? allMatches :
    activeTab === 'teams' ? allTeams :
    filteredCompetitions;

  const tabCount = (tab: Tab): number => {
    if (!hasSearched) return 0;
    if (tab === 'matches') return allMatches.length;
    if (tab === 'teams') return allTeams.length;
    return filteredCompetitions.length;
  };

  const renderEmpty = () => {
    if (!hasSearched || loading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>NO {activeTab.toUpperCase()} FOUND</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navLogo}>Matchday Memories</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="SEARCH MATCHES, TEAMS, COMPETITIONS..."
            placeholderTextColor="rgba(0,0,0,0.25)"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Idle state */}
      {!hasSearched ? (
        <View style={styles.idleState}>
          <Text style={styles.idleTitle}>FIND YOUR MATCH</Text>
          <Text style={styles.idleSub}>SEARCH BY TEAM, COMPETITION, OR MATCH</Text>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabs}>
            {(['matches', 'teams', 'competitions'] as Tab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.toUpperCase()}
                </Text>
                <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>
                    {loading ? '…' : tabCount(tab)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Results */}
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#3a7d3a" />
            </View>
          ) : (
            <FlatList<Match | Team | Competition>
              style={styles.list}
              contentContainerStyle={styles.listContent}
              data={activeData}
              keyExtractor={item => String(item.id)}
              ListEmptyComponent={renderEmpty}
              renderItem={({ item }) => {
                if (activeTab === 'matches') {
                  return (
                    <MatchRow
                      match={item as Match}
                      onPress={() => router.push(`/match/${(item as Match).id}` as any)}
                    />
                  );
                }
                if (activeTab === 'teams') {
                  return (
                    <TeamRow
                      team={item as Team}
                      onPress={() => router.push(`/team/${(item as Team).id}` as any)}
                    />
                  );
                }
                return (
                  <CompetitionRow
                    competition={item as Competition}
                    onPress={() => router.push(`/competition/${(item as Competition).id}` as any)}
                  />
                );
              }}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  navbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  navLogo: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 22,
    letterSpacing: 2,
    color: '#3a7d3a',
  },

  // Search bar
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontFamily: 'BebasNeue-Regular',
    fontSize: 13,
    letterSpacing: 0.8,
    paddingVertical: 12,
    color: '#111',
  },
  clearIcon: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    gap: 5,
  },
  tabActive: {
    backgroundColor: '#3a7d3a',
    borderColor: '#3a7d3a',
  },
  tabText: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 11,
    letterSpacing: 1,
    color: 'rgba(0,0,0,0.4)',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
  },
  tabBadgeTextActive: {
    color: '#fff',
  },

  // List
  list: { flex: 1 },
  listContent: { padding: 16, gap: 10 },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  // Match card
  matchMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  competitionLabel: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: '#3a7d3a',
  },
  dateLabel: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 10,
    letterSpacing: 0.5,
    color: 'rgba(0,0,0,0.35)',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamSideRight: {
    justifyContent: 'flex-end',
  },
  teamName: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 13,
    letterSpacing: 0.5,
    color: '#111',
    flex: 1,
  },
  teamNameRight: {
    textAlign: 'right',
  },
  score: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 18,
    letterSpacing: 1,
    color: '#111',
    minWidth: 54,
    textAlign: 'center',
  },
  crest: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  crestPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  // Team / competition rows
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 15,
    letterSpacing: 0.5,
    color: '#111',
  },
  rowSub: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 11,
    letterSpacing: 0.8,
    color: 'rgba(0,0,0,0.35)',
    marginTop: 2,
  },
  arrow: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 20,
    color: 'rgba(0,0,0,0.2)',
  },

  // States
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 60,
  },
  idleEmoji: { fontSize: 48, marginBottom: 4 },
  idleTitle: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 22,
    letterSpacing: 2,
    color: '#111',
  },
  idleSub: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 12,
    letterSpacing: 1,
    color: 'rgba(0,0,0,0.3)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 14,
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.3)',
  },
});