// Users can: 
// - Set account information (pfp, name, bio, location, top 3 matches, lists)
// - View their logs
// - View followers and following 

import { getJournalEntriesByUser } from '@/services/journalService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const mockUser = {
  username: '@ManUtdNico',
  name: 'Nico Lorenzi',
  bio: "Football is my religion. Watching the beautiful game since '98. Obsessed with pressing tactics and set piece analysis.",
  location: 'Milan, Italy',
  avatar: null,
  stats: { logged: 312, following: 48, followers: 127 },
};

const recentMatches = [
  { id: 1, home: 'AC Milan', away: 'Inter Milan', score: '2–1', date: 'Feb 28', competition: 'Serie A' },
  { id: 2, home: 'Man City', away: 'Arsenal', score: '1–1', date: 'Feb 25', competition: 'Premier League' },
  { id: 3, home: 'Barcelona', away: 'Real Madrid', score: '3–2', date: 'Feb 20', competition: 'La Liga' },
];

type Match = typeof recentMatches[0];

const PodiumSlot = ({ rank }: { rank: 1 | 2 | 3 }) => {
  const config = {
    1: { height: 110, color: '#D4AF37' },
    2: { height: 80, color: '#A8A9AD' },
    3: { height: 60, color: '#CD7F32' },
  }[rank];

  return (
    <View style={styles.podiumSlot}>
      <View style={styles.podiumCard}>
        <Text style={styles.podiumBall}>⚽</Text>
        <Text style={styles.podiumNoMatch}>NO MATCH</Text>
      </View>
      <View style={[styles.podiumBlock, { height: config.height, borderColor: config.color + '88' }]}>
        <Text style={[styles.podiumRank, { color: config.color }]}>{rank}</Text>
      </View>
    </View>
  );
};

const MatchRow = ({ match }: { match: Match }) => (
  <View style={styles.matchRow}>
    <View style={styles.matchInfo}>
      <Text style={styles.matchTeams}>
        {match.home} <Text style={styles.matchVs}>vs</Text> {match.away}
      </Text>
      <Text style={styles.matchMeta}>{match.competition} · {match.date}</Text>
    </View>
    <Text style={styles.matchScore}>{match.score}</Text>
  </View>
);

const NavButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.navButton} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.navButtonLeft}>
      <Text style={styles.navButtonLabel}>{label}</Text>
    </View>
    <Text style={styles.navButtonArrow}>›</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const MOCK_USER_ID = "demoUser123";
  const [entries, setEntries] = useState<any[]>([]);
  const initials = mockUser.name.split(' ').map(n => n[0]).join('');

  useEffect(() => {
    const fetchEntries = async () => {
      const data = await getJournalEntriesByUser(MOCK_USER_ID);
      setEntries(data);
    };

    fetchEntries();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Nav bar */}
      <View style={styles.navbar}>
        <Text style={styles.navLogo}>Matchday Memories</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>

            {/* Name + username + stats */}
            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>{mockUser.name}</Text>
              <Text style={styles.profileUsername}>{mockUser.username}</Text>
              <View style={styles.statsRow}>
                {([['Logged', mockUser.stats.logged], ['Following', mockUser.stats.following], ['Followers', mockUser.stats.followers]] as [string, number][]).map(([label, val]) => (
                  <View key={label} style={styles.statItem}>
                    <Text style={styles.statValue}>{val}</Text>
                    <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.bio}>{mockUser.bio}</Text>
          <Text style={styles.location}>📍 {mockUser.location}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Favorite Matches Podium */}
        <View style={styles.podiumSection}>
          <Text style={styles.sectionTitle}>FAVORITE MATCHES</Text>
          <View style={styles.podiumContainer}>
            <View style={styles.podiumRow}>
              <PodiumSlot rank={2} />
              <PodiumSlot rank={1} />
              <PodiumSlot rank={3} />
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom section */}
        <View style={styles.bottomSection}>

          {/* Recent matches */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>RECENT</Text>
              <TouchableOpacity>
                <Text style={styles.viewDiary}>VIEW HISTORY ›</Text>
              </TouchableOpacity>
            </View>
            {entries.map(entry => (
              <View key={entry.id} style={styles.matchRow}>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchTeams}>
                    {entry.matchId}
                  </Text>
                  <Text style={styles.matchMeta}>
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.matchMeta}>
                    {entry.content}
                  </Text>
                </View>
                <Text style={styles.matchScore}>
                  {entry.rating} ⭐
                </Text>
              </View>
            ))}
          </View>

          {/* Nav buttons */}
          <View style={styles.navButtons}>
            <NavButton label="MATCHES" onPress={() => router.push("/profile/matches")} />
            <NavButton label="LISTS" onPress={() => router.push("/profile/lists")} />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  navLogo: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 22,
    letterSpacing: 2,
    color: '#3a7d3a',
  },
  settingsButton: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    padding: 8,
  },
  settingsIcon: {
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },

  // Profile
  profileSection: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a3f1a',
    borderWidth: 2.5,
    borderColor: 'rgba(58,125,58,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 26,
    color: '#90EE90',
    letterSpacing: 1,
  },
  profileMeta: {
    flex: 1,
    paddingTop: 2,
  },
  profileName: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 20,
    letterSpacing: 0.5,
    color: '#111',
    marginBottom: 4,
  },
  profileUsername: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 13,
    color: '#677d67',
    letterSpacing: 1,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 18,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 20,
    color: '#111',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  statLabel: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 10,
    color: 'rgba(0,0,0,0.35)',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  bio: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 13,
    letterSpacing: 0.4,
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 20,
    marginBottom: 10,
  },
  location: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 12,
    color: 'rgba(0,0,0,0.32)',
    letterSpacing: 0.8,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginHorizontal: 22,
    marginBottom: 24,
  },

  // Podium
  podiumSection: {
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  sectionTitle: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 18,
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.7)',
    marginBottom: 14,
  },
  podiumContainer: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingTop: 20,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
  },
  podiumCard: {
    width: 80,
    height: 100,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 4,
  },
  podiumBall: {
    fontSize: 22,
  },
  podiumNoMatch: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 9,
    color: 'rgba(0,0,0,0.2)',
    letterSpacing: 1,
    textAlign: 'center',
  },
  podiumBlock: {
    width: '90%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRank: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 28,
    opacity: 0.7,
    letterSpacing: 1,
  },

  // Bottom section
  bottomSection: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 24,
  },
  recentSection: {
    gap: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewDiary: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 12,
    color: '#3a7d3a',
    letterSpacing: 1,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.025)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 8,
  },
  matchInfo: {
    flex: 1,
  },
  matchTeams: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 14,
    letterSpacing: 0.5,
    color: '#111',
  },
  matchVs: {
    color: '#3a7d3a',
  },
  matchMeta: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 11,
    color: 'rgba(0,0,0,0.38)',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  matchScore: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 18,
    color: '#111',
    letterSpacing: 1,
    minWidth: 40,
    textAlign: 'right',
  },
  navButtons: {
    gap: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  navButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navButtonEmoji: {
    fontSize: 18,
  },
  navButtonLabel: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#111',
  },
  navButtonArrow: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 20,
    color: 'rgba(0,0,0,0.22)',
  },

  // Placeholder screen
  placeholderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 14,
    letterSpacing: 1,
    color: '#3a7d3a',
  },
  placeholderTitle: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 20,
    letterSpacing: 2,
    color: '#111',
  },
  placeholderBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 40,
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  placeholderHeading: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 18,
    letterSpacing: 1.5,
    color: '#111',
  },
  placeholderSub: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 13,
    color: 'rgba(0,0,0,0.38)',
    letterSpacing: 0.5,
  },
});
