import { usePlayerStore } from './player.store';
import { useTeamStore } from './team.store';
import { useMatchStore } from './match.store';
import { useLeagueStore } from './league.store';
import { useLoginStore } from './login.store';

// Combine all stores into one
export const useAppStore = () => {
  const loginStore = useLoginStore();
  const playerStore = usePlayerStore();
  const teamStore = useTeamStore();
  const matchStore = useMatchStore();
  const leagueStore = useLeagueStore();

  return {
    // Login Store
    isLoggedIn: loginStore.isLoggedIn,
    currentUser: loginStore.currentUser,
    login: loginStore.login,
    logout: loginStore.logout,
    checkAuthState: loginStore.checkAuthState,
    setLoginState: loginStore.setLoginState,
    setAdminState: loginStore.setAdminState, // Add this line
    isLoading: loginStore.isLoading,
    error: loginStore.error,
    clearError: loginStore.clearError,

    // Player Store
    players: playerStore.players,
    fetchPlayers: playerStore.fetchPlayers,
    addPlayer: playerStore.addPlayer,
    updatePlayer: playerStore.updatePlayer,
    deletePlayer: playerStore.deletePlayer,
    updatePlayerCareerStats: playerStore.updatePlayerCareerStats,

    // Team Store
    teams: teamStore.teams,
    fetchTeams: teamStore.fetchTeams,
    addTeam: teamStore.addTeam,
    updateTeam: teamStore.updateTeam,
    deleteTeam: teamStore.deleteTeam,

    // Match Store
    matches: matchStore.matches,
    currentMatch: matchStore.currentMatch,
    fetchMatches: matchStore.fetchMatches,
    fetchMatchById: matchStore.fetchMatchById,
    addMatch: matchStore.addMatch,
    updateMatch: matchStore.updateMatch,
    deleteMatch: matchStore.deleteMatch,
    startMatch: matchStore.startMatch,
    updateScore: matchStore.updateScore,
    addInnings: matchStore.addInnings,
    updatePlayerStats: matchStore.updatePlayerStats,
    addFallOfWicket: matchStore.addFallOfWicket,
    completeMatch: matchStore.completeMatch,
    clearCurrentMatch: matchStore.clearCurrentMatch,

    // League Store
    leagues: leagueStore.leagues,
    currentLeague: leagueStore.currentLeague,
    fetchLeagues: leagueStore.fetchLeagues,
    fetchLeagueById: leagueStore.fetchLeagueById,
    addLeague: leagueStore.addLeague,
    updateLeague: leagueStore.updateLeague,
    deleteLeague: leagueStore.deleteLeague,
    clearCurrentLeague: leagueStore.clearCurrentLeague
  };
};