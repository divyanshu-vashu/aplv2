
import { create, SetState, GetState } from 'zustand';
import {
  Match,
  Score,
  Innings,
  FallOfWicket,
  MatchTeam,
  MatchResult,
  PlayerMatchStatsWithBatting,
  PlayerMatchStatsWithBowling,
  Player
} from '../types/index.types';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
  // FieldValue,
  Timestamp
} from 'firebase/firestore';

// type FirestoreMatch = Omit<Match, 'createdAt' | 'updatedAt'> & {
//   createdAt: FieldValue;
//   updatedAt: FieldValue;
// };

interface TossDetails {
  tossWinner: string;
  tossDecision: 'bat' | 'bowl';
}

interface MatchStore {
  matches: Match[];
  currentMatch: Match | null;
  isLoading: boolean;
  error: string | null;
  unsubscribeMatch?: () => void;
  
  // Match actions
  fetchMatches: (leagueId?: string) => Promise<void>;
  fetchMatchById: (id: string) => Promise<void>;
  addMatch: (match: Partial<Match>) => Promise<string>;
  updateMatch: (id: string, match: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  startMatch: (id: string) => Promise<void>;
  updateScore: (id: string, team: 'teamA' | 'teamB', score: Partial<Score>) => Promise<void>;
  addInnings: (matchId: string, team: 'teamA' | 'teamB', innings: Partial<Innings>) => Promise<void>;
  updatePlayerStats: (
    matchId: string,
    playerStats: Partial<PlayerMatchStatsWithBatting | PlayerMatchStatsWithBowling>,
    arrayField: 'teamABatting' | 'teamBBatting' | 'teamABowling' | 'teamBBowling'
  ) => Promise<void>;
  addFallOfWicket: (matchId: string, team: 'teamA' | 'teamB', wicket: FallOfWicket) => Promise<void>;
  completeMatch: (id: string) => Promise<void>;
  updateTossDetails: (matchId: string, tossDetails: TossDetails) => Promise<void>;
  clearCurrentMatch: () => void;
}

export const subscribeToMatch = (matchId: string, callback: (match: Match) => void): (() => void) => {
  const matchRef = doc(db, 'matches', matchId);
  return onSnapshot(matchRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Match);
    }
  });
};

const createDefaultTeam = (teamId = '', name = '', players: Player[] = []): MatchTeam => ({
  teamId,
  name,
  players,
  innings: [],
  score: { runs: 0, wickets: 0, overs: 0, balls: 0 }
});

const createDefaultExtras = () => ({
  byes: 0,
  legByes: 0,
  wides: 0,
  noBalls: 0,
  penalties: 0,
  total: 0
});

// Consolidated determineWinner function
const determineWinner = (match: Match): MatchResult => {
  const teamAScore = match.teamA.score;
  const teamBScore = match.teamB.score;
  
  const teamATotal = teamAScore.runs;
  const teamBTotal = teamBScore.runs;
  
  if (teamBTotal > teamATotal) {
    const wicketMargin = 10 - teamBScore.wickets;
    return {
      winner: match.teamB.name,
      winningTeam: {
        id: match.teamB.teamId,
        name: match.teamB.name,
        margin: {
          wickets: wicketMargin
        }
      },
      margin: `${wicketMargin} wickets`,
      description: `${match.teamB.name} won by ${wicketMargin} wickets`
    };
  } else if (teamATotal > teamBTotal) {
    const runMargin = teamATotal - teamBTotal;
    return {
      winner: match.teamA.name,
      winningTeam: {
        id: match.teamA.teamId,
        name: match.teamA.name,
        margin: {
          runs: runMargin
        }
      },
      margin: `${runMargin} runs`,
      description: `${match.teamA.name} won by ${runMargin} runs`
    };
  }
  
  return {
    winner: 'Draw',
    winningTeam: null,
    margin: 'No margin',
    description: 'Match ended in a draw'
  };
};

// Cleanup utility function
const cleanupMatchListener = (get: GetState<MatchStore>): void => {
  const unsubscribe = get().unsubscribeMatch;
  if (typeof unsubscribe === 'function') {
    unsubscribe();
  }
};

const matchStore = (set: SetState<MatchStore>, get: GetState<MatchStore>): MatchStore => ({
  matches: [],
  currentMatch: null,
  isLoading: false,
  error: null,

  fetchMatches: async (leagueId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const matchesQuery = leagueId
        ? query(collection(db, 'matches'), where('leagueId', '==', leagueId), orderBy('date', 'desc'))
        : query(collection(db, 'matches'), orderBy('date', 'desc'));

      const snapshot = await getDocs(matchesQuery);
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Match, 'id'>)
      })) as Match[];
      
      set({ matches, isLoading: false });
    } catch (error) {
      console.error('Fetch matches error:', error);
      set({ error: 'Failed to fetch matches', isLoading: false });
    }
  },

  fetchMatchById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      cleanupMatchListener(get);

      const unsubscribe = onSnapshot(
        doc(db, 'matches', id),
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const matchData = docSnapshot.data() as Omit<Match, 'id'>;
            
            // Fetch team players if they're not already loaded
            if (!matchData.teamA.players?.length || !matchData.teamB.players?.length) {
              const teamAPlayersQuery = query(
                collection(db, 'players'),
                where('teamId', '==', matchData.teamA.teamId)
              );
              const teamBPlayersQuery = query(
                collection(db, 'players'),
                where('teamId', '==', matchData.teamB.teamId)
              );

              const [teamASnapshot, teamBSnapshot] = await Promise.all([
                getDocs(teamAPlayersQuery),
                getDocs(teamBPlayersQuery)
              ]);

              // Fix: Properly map player data with all required properties
              matchData.teamA.players = teamASnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                teamId: matchData.teamA.teamId,
                role: doc.data().role || 'Batsman',
                careerStats: doc.data().careerStats || {
                  matches: 0,
                  totalRuns: 0,
                  totalBallsFaced: 0,
                  totalFours: 0,
                  totalSixes: 0,
                  highestScore: 0,
                  average: 0,
                  strikeRate: 0,
                  totalWickets: 0,
                  totalOvers: 0,
                  totalMaidens: 0,
                  totalRunsConceded: 0,
                  bestBowling: "0/0",
                  bowlingAverage: 0,
                  bowlingEconomy: 0,
                  totalCatches: 0,
                  totalRunouts: 0,
                  totalStumpings: 0
                }
              })) as Player[];

              matchData.teamB.players = teamBSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                teamId: matchData.teamB.teamId,
                role: doc.data().role || 'Batsman',
                careerStats: doc.data().careerStats || {
                  matches: 0,
                  totalRuns: 0,
                  totalBallsFaced: 0,
                  totalFours: 0,
                  totalSixes: 0,
                  highestScore: 0,
                  average: 0,
                  strikeRate: 0,
                  totalWickets: 0,
                  totalOvers: 0,
                  totalMaidens: 0,
                  totalRunsConceded: 0,
                  bestBowling: "0/0",
                  bowlingAverage: 0,
                  bowlingEconomy: 0,
                  totalCatches: 0,
                  totalRunouts: 0,
                  totalStumpings: 0
                }
              })) as Player[];
            }

            const fullMatchData: Match = {
              id: docSnapshot.id,
              ...matchData
            };
            
            set(state => ({
              currentMatch: fullMatchData,
              matches: state.matches.map(m => m.id === id ? fullMatchData : m),
              isLoading: false
            }));
          } else {
            set({ error: 'Match not found', isLoading: false });
          }
        },
        (error) => {
          console.error('Match listener error:', error);
          set({ error: 'Failed to listen to match updates', isLoading: false });
        }
      );

      set({ unsubscribeMatch: unsubscribe });
    } catch (error) {
      console.error('Fetch match by id error:', error);
      set({ error: 'Failed to fetch match', isLoading: false });
    }
  },

  addMatch: async (match: Partial<Match>) => {
    set({ isLoading: true, error: null });
    try {
      // Ensure players have all required fields
      const processTeam = (team: Partial<MatchTeam> | undefined): MatchTeam => {
        if (!team) return createDefaultTeam();
        
        const processedPlayers = (team.players || []).map(player => ({
          id: player.id,
          name: player.name || '',
          teamId: player.teamId || team.teamId || '',
          role: player.role || 'Batsman',
          isCaptain: player.isCaptain || false,
          isWicketKeeper: player.isWicketKeeper || false,
          careerStats: player.careerStats || {
            matches: 0,
            totalRuns: 0,
            totalBallsFaced: 0,
            totalFours: 0,
            totalSixes: 0,
            highestScore: 0,
            average: 0,
            strikeRate: 0,
            totalWickets: 0,
            totalOvers: 0,
            totalMaidens: 0,
            totalRunsConceded: 0,
            bestBowling: "0/0",
            bowlingAverage: 0,
            bowlingEconomy: 0,
            totalCatches: 0,
            totalRunouts: 0,
            totalStumpings: 0
          }
        }));

        return {
          teamId: team.teamId || '',
          name: team.name || '',
          players: processedPlayers,
          innings: team.innings || [],
          score: team.score || { runs: 0, wickets: 0, overs: 0, balls: 0 }
        };
      };

      const matchData = {
        date: match.date || new Date().toISOString(),
        teamA: processTeam(match.teamA),
        teamB: processTeam(match.teamB),
        venue: match.venue || '',
        leagueId: match.leagueId || '',
        league: match.league || { id: '', name: '' },
        tossWinner: match.tossWinner || '',
        tossDecision: match.tossDecision || 'bat',
        status: 'upcoming',
        fallOfWickets: [],
        teamABatting: [],
        teamBBatting: [],
        teamABowling: [],
        teamBBowling: [],
        extras: createDefaultExtras(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'matches'), matchData);
      
      const newMatch: Match = {
        ...matchData,
        id: docRef.id,
        status: 'upcoming',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      set(state => ({
        matches: [newMatch, ...state.matches],
        currentMatch: newMatch,
        isLoading: false
      }));

      return docRef.id;
    } catch (error) {
      console.error('Add match error:', error);
      set({ error: 'Failed to add match', isLoading: false });
      return '';
    }
  },

  updateMatch: async (id: string, match: Partial<Match>) => {
    set({ isLoading: true, error: null });
    try {
      const updateData = {
        ...match,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'matches', id), updateData);
      
      set(state => ({
        matches: state.matches.map(m => m.id === id ? { ...m, ...match } : m),
        currentMatch: state.currentMatch?.id === id ? { ...state.currentMatch, ...match } : state.currentMatch,
        isLoading: false
      }));
    } catch (error) {
      console.error('Update match error:', error);
      set({ error: 'Failed to update match', isLoading: false });
    }
  },

  deleteMatch: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, 'matches', id));
      
      set(state => ({
        matches: state.matches.filter(m => m.id !== id),
        currentMatch: state.currentMatch?.id === id ? null : state.currentMatch,
        isLoading: false
      }));
    } catch (error) {
      console.error('Delete match error:', error);
      set({ error: 'Failed to delete match', isLoading: false });
    }
  },

  startMatch: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await updateDoc(doc(db, 'matches', id), {
        status: 'ongoing',
        updatedAt: serverTimestamp()
      });
  
      set(state => ({
        matches: state.matches.map(m => m.id === id ? { ...m, status: 'ongoing' } : m),
        currentMatch: state.currentMatch?.id === id ? { ...state.currentMatch, status: 'ongoing' } : state.currentMatch,
        isLoading: false
      }));
    } catch (error) {
      console.error('Start match error:', error);
      set({ error: 'Failed to start match', isLoading: false });
    }
  },

  updateScore: async (id: string, team: 'teamA' | 'teamB', score: Partial<Score>) => {
    set({ isLoading: true, error: null });
    try {
      const scorePath = `${team}.score`;
      await updateDoc(doc(db, 'matches', id), {
        [scorePath]: score,
        updatedAt: serverTimestamp()
      });

      set(state => {
        const match = state.matches.find(m => m.id === id);
        if (!match) return state;

        const updatedMatch = {
          ...match,
          [team]: {
            ...match[team],
            score: { ...match[team].score, ...score }
          }
        };

        return {
          matches: state.matches.map(m => m.id === id ? updatedMatch : m),
          currentMatch: state.currentMatch?.id === id ? updatedMatch : state.currentMatch,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Update score error:', error);
      set({ error: 'Failed to update score', isLoading: false });
    }
  },

  addInnings: async (matchId: string, team: 'teamA' | 'teamB', innings: Partial<Innings>) => {
    set({ isLoading: true, error: null });
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');

      const currentInnings = [...(match[team].innings || [])];
      currentInnings.push(innings as Innings);

      await updateDoc(doc(db, 'matches', matchId), {
        [`${team}.innings`]: currentInnings,
        updatedAt: serverTimestamp()
      });

      set(state => {
        const updatedMatch = {
          ...match,
          [team]: { ...match[team], innings: currentInnings }
        };

        return {
          matches: state.matches.map(m => m.id === matchId ? updatedMatch : m),
          currentMatch: state.currentMatch?.id === matchId ? updatedMatch : state.currentMatch,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Add innings error:', error);
      set({ error: 'Failed to add innings', isLoading: false });
    }
  },

  // Fix the updatePlayerStats function type safety
  updatePlayerStats: async (
    matchId: string,
    playerStats: Partial<PlayerMatchStatsWithBatting | PlayerMatchStatsWithBowling>,
    arrayField: 'teamABatting' | 'teamBBatting' | 'teamABowling' | 'teamBBowling'
  ) => {
    set({ isLoading: true, error: null });
    try {
      const { playerId } = playerStats;
      if (!playerId) throw new Error('Player ID is required');
  
      const match = get().matches.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');
  
      // Fix: Type-safe array access
      const statsArray = (match[arrayField] || []) as (PlayerMatchStatsWithBatting | PlayerMatchStatsWithBowling)[];
  
      const existingIndex = statsArray.findIndex(stat => stat.playerId === playerId);
      
      const updatedArray = existingIndex !== -1
        ? statsArray.map((stat, index) => 
            index === existingIndex 
              ? { ...stat, ...playerStats, matchId }
              : stat
          )
        : [...statsArray, { ...playerStats, matchId }];
  
      const updateData = {
        [arrayField]: updatedArray,
        updatedAt: serverTimestamp()
      };
  
      await updateDoc(doc(db, 'matches', matchId), updateData);
  
      set(state => {
        const updatedMatch = { 
          ...match,
          [arrayField]: updatedArray
        };
        
        return {
          matches: state.matches.map(m => m.id === matchId ? updatedMatch : m),
          currentMatch: state.currentMatch?.id === matchId ? updatedMatch : state.currentMatch,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Update player stats error:', error);
      set({ error: 'Failed to update player stats', isLoading: false });
    }
  },

  addFallOfWicket: async (matchId: string, team: 'teamA' | 'teamB', wicket: FallOfWicket) => {
    set({ isLoading: true, error: null });
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) throw new Error('Match not found');

      const currentWickets = [...(match.fallOfWickets || [])];
      currentWickets.push(wicket);

      await updateDoc(doc(db, 'matches', matchId), {
        fallOfWickets: currentWickets,
        [`${team}.score.wickets`]: match[team].score.wickets + 1,
        updatedAt: serverTimestamp()
      });

      set(state => {
        const updatedMatch = {
          ...match,
          fallOfWickets: currentWickets,
          [team]: {
            ...match[team],
            score: {
              ...match[team].score,
              wickets: match[team].score.wickets + 1
            }
          }
        };

        return {
          matches: state.matches.map(m => m.id === matchId ? updatedMatch : m),
          currentMatch: state.currentMatch?.id === matchId ? updatedMatch : state.currentMatch,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Add fall of wicket error:', error);
      set({ error: 'Failed to add fall of wicket', isLoading: false });
    }
  },

  completeMatch: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const match = get().matches.find(m => m.id === id);
      if (!match) throw new Error('Match not found');
  
      const result = determineWinner(match);
      
      await updateDoc(doc(db, 'matches', id), {
        status: 'completed',
        result,
        updatedAt: serverTimestamp()
      });
  
      set(state => {
        const updatedMatch = {
          ...match,
          status: 'completed' as const,
          result
        };
        
        return {
          matches: state.matches.map(m => m.id === id ? updatedMatch : m),
          currentMatch: state.currentMatch?.id === id ? updatedMatch : state.currentMatch,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Complete match error:', error);
      set({ error: 'Failed to complete match', isLoading: false });
    }
  },

  updateTossDetails: async (matchId: string, tossDetails: TossDetails) => {
    set({ isLoading: true, error: null });
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        ...tossDetails,
        isStarted: true,
        updatedAt: serverTimestamp()
      });

      set(state => ({
        matches: state.matches.map(m => 
          m.id === matchId ? { ...m, ...tossDetails, isStarted: true } : m
        ),
        currentMatch: state.currentMatch?.id === matchId ? 
          { ...state.currentMatch, ...tossDetails, isStarted: true } : state.currentMatch,
        isLoading: false
      }));
    } catch (error) {
      console.error('Update toss details error:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearCurrentMatch: () => {
    cleanupMatchListener(get);
    set({ currentMatch: null, unsubscribeMatch: undefined });
  }
});

export const useMatchStore = create<MatchStore>(matchStore);