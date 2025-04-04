import React, { useState } from 'react';
import { Match } from '../types/index.types';
import { useAppStore } from '../store/index.store';

interface MatchTossProps {
  match: Match;
  onTossComplete: () => void;
}

const MatchToss: React.FC<MatchTossProps> = ({ match, onTossComplete }) => {
  const { updateMatch } = useAppStore();
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');
  const [isLoading, setIsLoading] = useState(false);

  const handleTossSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const battingTeam = tossDecision === 'bat' ? tossWinner : (tossWinner === match.teamA.teamId ? match.teamB.teamId : match.teamA.teamId);
      const bowlingTeam = tossDecision === 'bowl' ? tossWinner : (tossWinner === match.teamA.teamId ? match.teamB.teamId : match.teamA.teamId);

      await updateMatch(match.id, {
        tossWinner,
        tossDecision,
        firstBattingTeam: battingTeam,
        firstBowlingTeam: bowlingTeam,
        status: 'ongoing'  // Changed from isStarted: true to status: 'ongoing'
      });

      onTossComplete();
    } catch (error) {
      console.error('Error updating toss details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Match Toss</h2>
      <form onSubmit={handleTossSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Toss Winner
            </label>
            <select
              value={tossWinner}
              onChange={(e) => setTossWinner(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Team</option>
              <option value={match.teamA.teamId}>{match.teamA.name}</option>
              <option value={match.teamB.teamId}>{match.teamB.name}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Toss Decision
            </label>
            <select
              value={tossDecision}
              onChange={(e) => setTossDecision(e.target.value as 'bat' | 'bowl')}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="bat">Bat</option>
              <option value="bowl">Bowl</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => window.open('https://tossaroo-simpli-headtail.vercel.app/', '_blank')}
              className="px-4 py-2 text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50"
            >
              Toss Coin Simulator
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Submit Toss'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MatchToss;