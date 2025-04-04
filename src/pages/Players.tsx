import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '../store/player.store';
import PlayerCard from '../components/PlayerCard';
import { Plus, SortDesc } from 'lucide-react';
import { Link } from 'react-router-dom';

type SortType = 'runs' | 'wickets' | null;

const Players: React.FC = () => {
  const { players, fetchPlayers } = usePlayerStore();
  const [sortBy, setSortBy] = useState<SortType>(null);
  
  useEffect(() => {
    fetchPlayers();
  }, []);

  const getSortedPlayers = () => {
    if (!sortBy) return players;

    return [...players].sort((a, b) => {
      if (sortBy === 'runs') {
        return (b.careerStats?.totalRuns || 0) - (a.careerStats?.totalRuns || 0);
      } else {
        return (b.careerStats?.totalWickets || 0) - (a.careerStats?.totalWickets || 0);
      }
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Players</h1>
        <Link
          to="/players/new"
          className="flex items-center py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <Plus size={18} className="mr-1" />
          Add Player
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSortBy(sortBy === 'runs' ? null : 'runs')}
          className={`flex items-center px-3 py-2 rounded-md ${
            sortBy === 'runs' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <SortDesc size={16} className="mr-1" />
          Sort by Runs
        </button>
        <button
          onClick={() => setSortBy(sortBy === 'wickets' ? null : 'wickets')}
          className={`flex items-center px-3 py-2 rounded-md ${
            sortBy === 'wickets' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <SortDesc size={16} className="mr-1" />
          Sort by Wickets
        </button>
      </div>
      
      {players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getSortedPlayers().map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No players available. Create your first player!</p>
        </div>
      )}
    </div>
  );
};

export default Players;