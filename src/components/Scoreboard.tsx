import React, { useState, useEffect } from 'react';
import { Match ,PlayerMatchStatsWithBatting, PlayerMatchStatsWithBowling} from '../types/index.types';
import { useAppStore } from '../store/index.store';

interface ScoreboardProps {
  match: Match;
  onClose: () => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ match, onClose }) => {
  const { updateScore, completeMatch, updatePlayerStats, leagues, fetchMatchById } = useAppStore();

  // Determine which team bats first based on toss details.
  const firstInningsTeam: 'teamA' | 'teamB' = 
    match.firstBattingTeam === match.teamA.teamId ? 'teamA' : 'teamB';

  // Set the current batting team to the first batting team initially.
  const [currentTeam, setCurrentTeam] = useState<'teamA' | 'teamB'>(firstInningsTeam);
  const [selectedBatsman, setSelectedBatsman] = useState<string | null>(null);
  const [selectedBowler, setSelectedBowler] = useState<string | null>(null);
  const [maxWickets, setMaxWickets] = useState(10);
  const [extraRunsEnabled, setExtraRunsEnabled] = useState(true);

  // -----------------
  const [showWicketPopup, setShowWicketPopup] = useState(false);
const [dismissalType, setDismissalType] = useState<string>('');
const [dismissalFielder, setDismissalFielder] = useState<string>('');

  // Fetch latest match data.
  useEffect(() => {
    fetchMatchById(match.id);
  }, [match.id, fetchMatchById]);

  if (match.status !== 'ongoing') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">This match is not in progress</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Back to Match
        </button>
      </div>
    );
  }

  const currentBattingTeam = match[currentTeam];
  const currentBowlingTeam = match[currentTeam === 'teamA' ? 'teamB' : 'teamA'];
  const currentScore = currentBattingTeam.score;

  // Determine if we are in the first innings.
  const isFirstInnings = currentTeam === firstInningsTeam;

  // Validate that the team has players.
  const validateTeamPlayers = (): boolean => {
    if (!currentBattingTeam?.players?.length) {
      console.error('No players found in batting team');
      return false;
    }
    if (!currentBowlingTeam?.players?.length) {
      console.error('No players found in bowling team');
      return false;
    }
    return true;
  };

  // Get league details and overs (default to 20 if not defined).
  const leagueId = match.league.id;
  const leagueDetail = leagues.find(l => l.id === leagueId);
  const maxOvers = leagueDetail?.overs || 20;

  // Helper: get target only for second innings.
  const getTarget = () => {
    if (!isFirstInnings) {
      const firstInningsScore = match[firstInningsTeam].score.runs;
      return firstInningsScore + 1;
    }
    return null;
  };

  const getRemainingRuns = () => {
    const target = getTarget();
    return target ? target - currentScore.runs : null;
  };

  const getRequiredRunRate = () => {
    const remainingOvers = maxOvers - currentScore.overs - (currentScore.balls / 6);
    const remainingRuns = getRemainingRuns();
    return remainingRuns && remainingOvers > 0 ? (remainingRuns / remainingOvers).toFixed(2) : 0;
  };

  // Handle scoring runs.
  const handleRunScored = async (runs: number) => {
    if (!selectedBatsman || !selectedBowler || !validateTeamPlayers()) return;
    
    const newBalls = (currentScore.balls + 1) % 6;
    const newOvers = currentScore.overs + (currentScore.balls + 1 === 6 ? 1 : 0);
    
    const newScore = {
      runs: currentScore.runs + runs,
      balls: newBalls,
      overs: newOvers,
      wickets: currentScore.wickets
    };

    try {
      // Update score in Firestore
      await updateScore(match.id, currentTeam, newScore);
  
      // Update batsman stats

      const currentBatsmanStats = (currentTeam === 'teamA' ? match.teamABatting : match.teamBBatting)
      ?.find(stats => stats.playerId === selectedBatsman) || {
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0
      };

      const batsmanStats: Partial<PlayerMatchStatsWithBatting> = {
        playerId: selectedBatsman,
        matchId: match.id,
        runs: (currentBatsmanStats.runs || 0) + runs,
        ballsFaced: (currentBatsmanStats.ballsFaced || 0) + 1,
        fours: runs === 4 ? (currentBatsmanStats.fours || 0) + 1 : (currentBatsmanStats.fours || 0),
        sixes: runs === 6 ? (currentBatsmanStats.sixes || 0) + 1 : (currentBatsmanStats.sixes || 0),
        strikeRate: ((runs || 0) + runs) / ((currentBatsmanStats.ballsFaced || 0) + 1) * 100
      };
      
      const currentBowlerStats = (currentTeam === 'teamA' ? match.teamBBowling : match.teamABowling)
      ?.find(stats => stats.playerId === selectedBowler) || {
        bowlingBalls: 0,
        runsConceded: 0,
          dots: 0
      };

      const bowlerStats: Partial<PlayerMatchStatsWithBowling> = {
        playerId: selectedBowler,
        matchId: match.id,
        runsConceded: (currentBowlerStats.runsConceded || 0) + runs,
        bowlingBalls: (currentBowlerStats.bowlingBalls || 0) + 1,
        economy: ((currentBowlerStats.runsConceded || 0) + runs) / (((currentBowlerStats.bowlingBalls || 0) + 1) / 6),
        dots: runs === 0 ? (currentBowlerStats.dots || 0) + 1 : (currentBowlerStats.dots || 0)
      };
      
      
  
      // Update both batting and bowling stats
      await Promise.all([
        updatePlayerStats(match.id, batsmanStats, currentTeam === 'teamA' ? 'teamABatting' : 'teamBBatting'),
        updatePlayerStats(match.id, bowlerStats, currentTeam === 'teamA' ? 'teamBBowling' : 'teamABowling')
      ]);

      // Check win conditions and handle innings completion
      const target = getTarget();
      if (target && newScore.runs >= target) {
        const result = {
          winner: currentBattingTeam.name,
          margin: `${10 - newScore.wickets} wickets`,
          description: `${currentBattingTeam.name} won by ${10 - newScore.wickets} wickets`
        };
        completeMatch(match.id,result);
        onClose();
        return;
      }

      // Check if innings end naturally (overs or wickets limit reached).
      if (newOvers >= maxOvers || newScore.wickets >= maxWickets) {
        if (isFirstInnings) {
          // Switch innings if first innings is complete.
          setCurrentTeam(currentTeam === 'teamA' ? 'teamB' : 'teamA');
          return;
        } else {
          // In second innings, if overs or wickets are exhausted without reaching target, declare opponent as winner.
          const opponentTeam = currentTeam === 'teamA' ? match.teamB : match.teamA;
          const result = {
            winner: opponentTeam.name,
            margin: `${target! - newScore.runs} runs`,
            description: `${opponentTeam.name} won by ${target! - newScore.runs} runs`
          };
          completeMatch(match.id, result);
          onClose();
          return;
        }
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };
  



// Modify handleWicket to show popup instead of immediate update
const handleWicket = () => {
  if (!selectedBatsman || !validateTeamPlayers()) return;
  setShowWicketPopup(true);
};

// Add WicketPopup component inside Scoreboard component
const WicketPopup = () => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBalls = (currentScore.balls + 1) % 6;
    const newOvers = currentScore.overs + (currentScore.balls + 1 === 6 ? 1 : 0);
    
    const newScore = {
      ...currentScore,
      wickets: currentScore.wickets + 1,
      balls: newBalls,
      overs: newOvers
    };

    try {
      // Update score in Firestore
      await updateScore(match.id, currentTeam, newScore);

      // Update batsman stats based on dismissal type
      const batsmanStats: Partial<PlayerMatchStatsWithBatting> = {
        playerId: selectedBatsman,
        matchId: match.id,
        ballsFaced: 1,
        dismissalType,
        dismissalBowler: ['bowled', 'lbw', 'caught'].includes(dismissalType) ? selectedBowler : undefined,
        dismissalFielder: ['caught', 'runOut', 'stumped'].includes(dismissalType) ? dismissalFielder : undefined
      };

      // Only update bowler stats for bowler-involved dismissals
      if (['bowled', 'lbw', 'caught'].includes(dismissalType)) {
        const bowlerStats: Partial<PlayerMatchStatsWithBowling> = {
          playerId: selectedBowler,
          matchId: match.id,
          wickets: 1,
          bowlingBalls: 1
        };
        await updatePlayerStats(
          match.id,
          bowlerStats,
          currentTeam === 'teamA' ? 'teamBBowling' : 'teamABowling'
        );
      }

      await updatePlayerStats(
        match.id,
        batsmanStats,
        currentTeam === 'teamA' ? 'teamABatting' : 'teamBBatting'
      );

      setSelectedBatsman(null);
      setShowWicketPopup(false);
      
      // Check innings completion logic...
      if (newOvers >= maxOvers || newScore.wickets >= maxWickets) {
        if (isFirstInnings) {
          setCurrentTeam(currentTeam === 'teamA' ? 'teamB' : 'teamA');
        } else {
          const target = getTarget();
          const opponentTeam = currentTeam === 'teamA' ? match.teamB : match.teamA;
          const result = {
            winner: newScore.runs >= (target || 0) ? currentBattingTeam.name : opponentTeam.name,
            margin: newScore.runs >= (target || 0)
              ? `${10 - newScore.wickets} wickets` 
              : `${(target || 0) - newScore.runs} runs`,
            description: newScore.runs >= (target || 0)
              ? `${currentBattingTeam.name} won by ${10 - newScore.wickets} wickets`
              : `${opponentTeam.name} won by ${(target || 0) - newScore.runs} runs`
          };
          await completeMatch(match.id, result);
          onClose();
        }
      }
    } catch (error) {
      console.error('Error handling wicket:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Wicket Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Wicket Type</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={dismissalType}
              onChange={(e) => setDismissalType(e.target.value)}
              required
            >
              <option value="">Select type</option>
              <option value="bowled">Bowled</option>
              <option value="lbw">LBW</option>
              <option value="caught">Caught</option>
              <option value="runOut">Run Out</option>
              <option value="stumped">Stumped</option>
              <option value="hitWicket">Hit Wicket</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          {['bowled', 'lbw', 'caught'].includes(dismissalType) && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Bowler</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedBowler || ''}
                onChange={(e) => setSelectedBowler(e.target.value)}
                required
              >
                {currentBowlingTeam.players?.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {['caught', 'runOut', 'stumped'].includes(dismissalType) && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Fielder</label>
              <select
                className="w-full p-2 border rounded-md"
                value={dismissalFielder}
                onChange={(e) => setDismissalFielder(e.target.value)}
                required
              >
                {currentBowlingTeam.players?.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowWicketPopup(false)}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// const handleWicket = async () => {
//   if (!selectedBatsman || !selectedBowler || !validateTeamPlayers()) return;

//   const newBalls = (currentScore.balls + 1) % 6;
//   const newOvers = currentScore.overs + (currentScore.balls + 1 === 6 ? 1 : 0);
  
//   const newScore = {
//     ...currentScore,
//     wickets: currentScore.wickets + 1,
//     balls: newBalls,
//     overs: newOvers
//   };

//   try {
//     // Update score in Firestore
//     await updateScore(match.id, currentTeam, newScore);

//     // Update batsman stats
//     const batsmanStats: Partial<PlayerMatchStatsWithBatting> = {
//       playerId: selectedBatsman,
//       matchId: match.id,
//       ballsFaced: 1,
//       dismissalBowler: selectedBowler
//     };
//     await updatePlayerStats(
//       match.id,
//       batsmanStats,
//       currentTeam === 'teamA' ? 'teamABatting' : 'teamBBatting'
//     );

//     // Update bowler stats
//     const bowlerStats: Partial<PlayerMatchStatsWithBowling> = {
//       playerId: selectedBowler,
//       matchId: match.id,
//       wickets: 1,
//       bowlingBalls: 1
//     };
//     await updatePlayerStats(
//       match.id,
//       bowlerStats,
//       currentTeam === 'teamA' ? 'teamBBowling' : 'teamABowling'
//     );

//     // Reset selected batsman
//     setSelectedBatsman(null);

//     // Check innings completion
//     if (newOvers >= maxOvers || newScore.wickets >= maxWickets) {
//       if (isFirstInnings) {
//         // Switch innings
//         setCurrentTeam(currentTeam === 'teamA' ? 'teamB' : 'teamA');
//       } else {
//         const target = getTarget();
//         const opponentTeam = currentTeam === 'teamA' ? match.teamB : match.teamA;
//         const result = {
//           winner: newScore.runs >= (target || 0) ? currentBattingTeam.name : opponentTeam.name,
//           margin: newScore.runs >= (target || 0)
//             ? `${10 - newScore.wickets} wickets` 
//             : `${(target || 0) - newScore.runs} runs`,
//           description: newScore.runs >= (target || 0)
//             ? `${currentBattingTeam.name} won by ${10 - newScore.wickets} wickets`
//             : `${opponentTeam.name} won by ${(target || 0) - newScore.runs} runs`
//         };
//         await completeMatch(match.id, result);
//         onClose();
//       }
//     } else {
//       // Update score if innings not complete
//       await updateScore(match.id, currentTeam, newScore);
//     }
//   } catch (error) {
//     console.error('Error handling wicket:', error);
//   }
// };



const handleExtraBall = async (type: 'wide' | 'noBall', extraRuns: number = 1) => {
  if (!selectedBowler) return;
  
  // Calculate new score
  const newScore = {
    runs: currentScore.runs + (extraRunsEnabled ? extraRuns : 1),
    balls: currentScore.balls, // extra ball doesn't count
    overs: currentScore.overs,
    wickets: currentScore.wickets
  };
  
  try {
    // Update score in Firestore
    await updateScore(match.id, currentTeam, newScore);

    // Update bowler's stats
    const bowlerStats: Partial<PlayerMatchStatsWithBowling> = {
      playerId: selectedBowler,
      matchId: match.id,
      [type === 'wide' ? 'wides' : 'noBalls']: 1,
      runsConceded: extraRuns
    };
    await updatePlayerStats(
      match.id,
      bowlerStats,
      currentTeam === 'teamA' ? 'teamBBowling' : 'teamABowling'
    );

    // Check win conditions
    const target = getTarget();
    if (target && newScore.runs >= target) {
      const result = {
        winner: currentBattingTeam.name,
        margin: `${10 - newScore.wickets} wickets`,
        description: `${currentBattingTeam.name} won by ${10 - newScore.wickets} wickets`
      };
      await completeMatch(match.id, result);
      onClose();
      return;
    }

    // Check if innings is complete based on wickets
    if (newScore.wickets >= maxWickets) {
      if (isFirstInnings) {
        setCurrentTeam(currentTeam === 'teamA' ? 'teamB' : 'teamA');
      } else {
        const opponentTeam = currentTeam === 'teamA' ? match.teamB : match.teamA;
        const result = {
          winner: opponentTeam.name,
          margin: `${target! - newScore.runs} runs`,
          description: `${opponentTeam.name} won by ${target! - newScore.runs} runs`
        };
        await completeMatch(match.id, result);
        onClose();
      }
    }
  } catch (error) {
    console.error('Error handling extra ball:', error);
  }
};
   
  // Display toss information.
  const getTossInfo = () => {
    if (!match.tossWinner || !match.tossDecision) return null;
    const winnerTeam = match.tossWinner === match.teamA.teamId ? match.teamA.name : match.teamB.name;
    return `${winnerTeam} won the toss and chose to ${match.tossDecision} first`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold">
          {match.teamA.name} vs {match.teamB.name}
        </h2>
        <p className="text-gray-600">{match.league.name}</p>
        <p className="text-sm text-gray-600 mt-1">{getTossInfo()}</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-600">Current Innings</div>
          <div className="font-bold text-lg">{currentBattingTeam.name}</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold">
            {currentScore.runs}/{currentScore.wickets}
          </div>
          <div className="text-gray-600">
            {currentScore.overs}.{currentScore.balls} overs
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600">Target</div>
          {getTarget() ? (
            <>
              <div className="font-bold">{getTarget()} runs</div>
              <div className="text-sm text-gray-600">
                Need {getRemainingRuns()} runs
                {currentScore.balls > 0 && ` (RRR: ${getRequiredRunRate()})`}
              </div>
            </>
          ) : (
            <div className="text-gray-600">-</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Batsman
          </label>
          <select
            value={selectedBatsman || ''}
            onChange={(e) => setSelectedBatsman(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={!currentBattingTeam.players?.length}
          >
            <option value="">Select Batsman</option>
            {currentBattingTeam.players?.map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            )) || <option value="">Loading players...</option>}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Bowler
          </label>
          <select
            value={selectedBowler || ''}
            onChange={(e) => setSelectedBowler(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={!currentBowlingTeam.players?.length}
          >
            <option value="">Select Bowler</option>
            {currentBowlingTeam.players?.map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            )) || <option value="">Loading players...</option>}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Runs</div>
        <div className="grid grid-cols-9 gap-2">
          <button
            onClick={() => handleExtraBall('wide')}
            disabled={!selectedBowler}
            className="py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Wd
          </button>
          <button
            onClick={() => handleExtraBall('noBall', 1)}
            disabled={!selectedBowler}
            className="py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Nb
          </button>
          {[0, 1, 2, 3, 4, 6].map(run => (
            <button
              key={run}
              onClick={() => handleRunScored(run)}
              disabled={!selectedBatsman || !selectedBowler}
              className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {run}
            </button>
          ))}
          <button
            onClick={handleWicket}
            disabled={!selectedBatsman || !selectedBowler}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            W
          </button>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm text-gray-600">Max Wickets</label>
            <input
              type="number"
              value={maxWickets}
              onChange={(e) => {
                const value = Math.min(Math.max(1, Number(e.target.value)), 10);
                setMaxWickets(value);
              }}
              min="1"
              max="10"
              className="p-1 border rounded w-20"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Extra Runs</label>
            <input
              type="checkbox"
              checked={extraRunsEnabled}
              onChange={(e) => setExtraRunsEnabled(e.target.checked)}
              className="ml-2"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
        {isFirstInnings && (
          <button
            onClick={() => setCurrentTeam(currentTeam === 'teamA' ? 'teamB' : 'teamA')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            End Innings
          </button>
        )}
      </div>
      {showWicketPopup && <WicketPopup />}
    </div>
  );
};

export default Scoreboard;