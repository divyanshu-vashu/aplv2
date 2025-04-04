import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/index.store';
import { Match } from '../types/index.types'; // Add this import
import { Plus } from 'lucide-react';
import AuthenticatedMatchView from '../components/AuthenticatedMatchView';
import { Player } from '../types/index.types';
// import { useAuth } from '../hooks/useAuth'; // Add this import
import { useNavigate } from 'react-router-dom'; // Add this import
import { doc, getDoc } from 'firebase/firestore'; // Added Firestore imports
import { db } from '../firebase/config';
const Matches: React.FC = () => {
  const navigate = useNavigate(); // Add this
  // const { isAdmin } = useAuth();
  const { matches, teams, leagues, addMatch, fetchMatches } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        await fetchMatches();
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [fetchMatches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const teamA = teams.find(team => team.id === teamAId);
    const teamB = teams.find(team => team.id === teamBId);
    const league = leagues.find(league => league.id === leagueId);
    
    if (!teamA || !teamB || !league) {
      console.error('Missing required data');
      return;
    }

    try {
      // Fetch and validate Team A players
      console.log('Fetching Team A players:', teamA.playerIds);
      const teamAPlayers = await Promise.all(
        teamA.playerIds.map(async (playerId) => {
          const playerDoc = await getDoc(doc(db, 'players', playerId));
          if (!playerDoc.exists()) {
            console.error(`Player ${playerId} not found for Team A`);
            return null;
          }
          const playerData = playerDoc.data();
          return {
            id: playerDoc.id,
            name: playerData.name,
            teamId: playerData.teamId,
            role: playerData.role,
            isCaptain: playerData.isCaptain,
            isWicketKeeper: playerData.isWicketKeeper,
            careerStats: playerData.careerStats,
            createdAt: playerData.createdAt,
            updatedAt: playerData.updatedAt
          } as Player;
        })
      ).then(players => players.filter((p): p is Player => p !== null));

      // Fetch and validate Team B players
      console.log('Fetching Team B players:', teamB.playerIds);
      const teamBPlayers = await Promise.all(
        teamB.playerIds.map(async (playerId) => {
          const playerDoc = await getDoc(doc(db, 'players', playerId));
          if (!playerDoc.exists()) {
            console.error(`Player ${playerId} not found for Team B`);
            return null;
          }
          const playerData = playerDoc.data();
          return {
            id: playerDoc.id,
            name: playerData.name,
            teamId: playerData.teamId,
            role: playerData.role,
            isCaptain: playerData.isCaptain,
            isWicketKeeper: playerData.isWicketKeeper,
            careerStats: playerData.careerStats,
            createdAt: playerData.createdAt,
            updatedAt: playerData.updatedAt
          } as Player;
        })
      ).then(players => players.filter((p): p is Player => p !== null));

      console.log('Team A Players:', teamAPlayers);
      console.log('Team B Players:', teamBPlayers);

      if (!teamAPlayers.length || !teamBPlayers.length) {
        throw new Error('No players found for one or both teams');
      }

      // Create match with validated players
      await addMatch({
        date,
        teamA: {
          teamId: teamA.id,
          name: teamA.name,
          players: teamAPlayers,
          innings: [],
          score: { runs: 0, wickets: 0, overs: 0, balls: 0 }
        },
        teamB: {
          teamId: teamB.id,
          name: teamB.name,
          players: teamBPlayers,
          innings: [],
          score: { runs: 0, wickets: 0, overs: 0, balls: 0 }
        },
        leagueId: league.id,
        league: {
          id: league.id,
          name: league.name
        },
        venue: '',
        tossWinner: '',
        tossDecision: 'bat',
        status: 'upcoming', // Replace isStarted and isCompleted with status
        // playerStats: {},
        fallOfWickets: [],
        extras: {
          byes: 0,
          legByes: 0,
          wides: 0,
          noBalls: 0,
          penalties: 0,
          total: 0
        }
      });
      
      // Reset form
      setDate('');
      setTeamAId('');
      setTeamBId('');
      setLeagueId('');
      setShowForm(false);
    } catch (error) {
      console.error('Error creating match:', error);
      // Handle error (maybe show an error message to the user)
    }
  };
  
  

  const handleMatchClick = (match: Match) => {
    navigate(`/matches/${match.id}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Matches</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <Plus size={18} className="mr-1" />
          Add Match
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Match</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Match Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="teamA" className="block text-sm font-medium text-gray-700 mb-1">
                    Team A
                  </label>
                  <select
                    id="teamA"
                    value={teamAId}
                    onChange={(e) => setTeamAId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Team A</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="teamB" className="block text-sm font-medium text-gray-700 mb-1">
                    Team B
                  </label>
                  <select
                    id="teamB"
                    value={teamBId}
                    onChange={(e) => setTeamBId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Team B</option>
                    {teams
                      .filter(team => team.id !== teamAId)
                      .map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="league" className="block text-sm font-medium text-gray-700 mb-1">
                    League
                  </label>
                  <select
                    id="league"
                    value={leagueId}
                    onChange={(e) => setLeagueId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select League</option>
                    {leagues.map(league => (
                      <option key={league.id} value={league.id}>
                        {league.name} ({league.overs} overs)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Create Match
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(match => (
              <div key={match.id} onClick={() => handleMatchClick(match)}>
                <AuthenticatedMatchView match={match} />
              </div>
            ))}
          </div>

          {matches.length === 0 && !showForm && (
            <div className="text-center py-8 text-gray-500">
              No matches found. Click "Add Match" to create one.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Matches;