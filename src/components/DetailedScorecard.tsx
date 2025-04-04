import React, { useState, useEffect } from 'react';
import { Match, MatchTeam,Player } from '../types/index.types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

interface DetailedScorecardProps {
  initialMatchId: string;
}

const DetailedScorecard: React.FC<DetailedScorecardProps> = ({ initialMatchId }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [activeInnings, setActiveInnings] = useState<'teamA' | 'teamB'>('teamA');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const matchRef = doc(db, 'matches', initialMatchId);
    const unsubscribe = onSnapshot(matchRef, (doc) => {
      if (doc.exists()) {
        const matchData = { ...doc.data(), id: doc.id } as Match;
        setMatch(matchData);
      } else {
        console.error("Match not found");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching match data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initialMatchId]);

  if (loading) {
    return <div>Loading match data...</div>;
  }

  if (!match) {
    return <div>Error loading match data.</div>;
  }

  const formatScore = (team: MatchTeam) => {
    return `${team.score.runs}-${team.score.wickets} (${team.score.overs}.${team.score.balls} Ov)`;
  };

  const getBattingStats = (teamId: string) => {
    if (teamId === match.teamA.teamId) {
      return match.teamABatting || [];
    } else {
      return match.teamBBatting || [];
    }
  };

  const getBowlingStats = (teamId: string) => {
    if (teamId === match.teamA.teamId) {
      return match.teamABowling || [];
    } else {
      return match.teamBBowling || [];
    }
  };
  
  const getPlayerName = (match: Match, playerId: string): string => {
    // Create a map of all players for quick lookup
    const playerMap = new Map<string, Player>();
    
    // Add all players from both teams to the map
    match.teamA.players.forEach(player => playerMap.set(player.id, player));
    match.teamB.players.forEach(player => playerMap.set(player.id, player));
    
    // Look up player by ID
    const player = playerMap.get(playerId);
    return player ? player.name : `Player ${playerId}`;
  };
  
  const calculateStrikeRate = (runs: number = 0, balls: number = 0): string => {
    if (!balls) return "0.00";
    return ((runs / balls) * 100).toFixed(2);
  };

  const calculateEconomy = (runs: number = 0, balls: number = 0): string => {
    if (!balls) return "0.00";
    const overs = balls / 6;
    return (runs / overs).toFixed(2);
  };

  const formatOvers = (balls: number = 0): string => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
  };

  const activeTeam = activeInnings === 'teamA' ? match.teamA : match.teamB;
  const opposingTeam = activeInnings === 'teamA' ? match.teamB : match.teamA;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Match Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {match.teamA.name} vs {match.teamB.name}
        </h1>
        <p className="text-lg mb-2">
          {formatScore(match.teamA)} vs {formatScore(match.teamB)}
        </p>
        <p className="text-green-600 font-semibold">
          {match.result?.description}
        </p>
      </div>
      {/* <p>
        data is extracted: {JSON.stringify(match, null, 2)}
      </p> */}
      {/* Innings Selector */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveInnings('teamA')}
          className={`px-4 py-2 ${activeInnings === 'teamA' ? 'border-b-2 border-blue-500' : ''}`}
        >
          {match.teamA.name} Innings
        </button>
        <button
          onClick={() => setActiveInnings('teamB')}
          className={`px-4 py-2 ${activeInnings === 'teamB' ? 'border-b-2 border-blue-500' : ''}`}
        >
          {match.teamB.name} Innings
        </button>
      </div>

      {/* Active Innings Score */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">
          {activeTeam.name} Innings
        </h2>
        <p className="text-lg mb-4">
          <strong>Score:</strong> {activeTeam.score.runs}/{activeTeam.score.wickets} in {activeTeam.score.overs}.{activeTeam.score.balls} overs
        </p>
      </div>

      {/* Batting Table */}
      <div className="overflow-x-auto mb-6">
        <h3 className="text-xl font-bold mb-4">Batting</h3>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2">Batter</th>
              <th className="text-left p-2">R</th>
              <th className="p-2">B</th>
              <th className="p-2">4s</th>
              <th className="p-2">6s</th>
              <th className="p-2">SR</th>
            </tr>
          </thead>
          <tbody>
            {getBattingStats(activeTeam.teamId).map(stat => (
              <tr key={stat.playerId} className="border-b">
                <td className="p-2 font-medium">{getPlayerName(match,stat.playerId)}</td>
                <td className="p-2">{stat.runs || 0}</td>
                <td className="p-2 text-center">{stat.ballsFaced || 0}</td>
                <td className="p-2 text-center">{stat.fours || 0}</td>
                <td className="p-2 text-center">{stat.sixes || 0}</td>
                <td className="p-2 text-center">
                  {calculateStrikeRate(stat.runs, stat.ballsFaced)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Extras */}
      <div className="mb-6">
        <p className="text-sm">
          <strong>Extras:</strong> {match.extras?.total || 0} (
          b {match.extras?.byes || 0}, 
          lb {match.extras?.legByes || 0}, 
          w {match.extras?.wides || 0}, 
          nb {match.extras?.noBalls || 0}, 
          p {match.extras?.penalties || 0})
        </p>
      </div>

      {/* Bowling Table */}
      <div className="overflow-x-auto">
        <h3 className="text-xl font-bold mb-4">Bowling</h3>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2">Bowler</th>
              <th className="p-2">O</th>
              <th className="p-2">M</th>
              <th className="p-2">R</th>
              <th className="p-2">W</th>
              <th className="p-2">Econ</th>
            </tr>
          </thead>
          <tbody>
            {getBowlingStats(opposingTeam.teamId).map(stat => (
              <tr key={stat.playerId} className="border-b">
                <td className="p-2 font-medium">{getPlayerName(match,stat.playerId)}</td>
                <td className="p-2 text-center">{formatOvers(stat.bowlingBalls)}</td>
                <td className="p-2 text-center">{stat.maidens || 0}</td>
                <td className="p-2 text-center">{stat.runsConceded || 0}</td>
                <td className="p-2 text-center">{stat.wickets || 0}</td>
                <td className="p-2 text-center">
                  {calculateEconomy(stat.runsConceded, stat.bowlingBalls)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailedScorecard;
