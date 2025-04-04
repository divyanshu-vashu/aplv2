import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeamStore } from '../store/team.store';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeamForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teams, players, addTeam, updateTeam, fetchTeams, fetchPlayers } = useTeamStore();
  
  const [name, setName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setIsLoading(true);
        await Promise.all([fetchTeams(), fetchPlayers()]);
        
        if (id) {
          const team = teams.find(t => t.id === id);
          if (team) {
            setName(team.name);
            setSelectedPlayers(team.playerIds || []);
          } else {
            setError('Team not found');
          }
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [id, fetchTeams, fetchPlayers]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const teamData = {
        name,
        playerIds: selectedPlayers
      };
  
      if (id) {
        await updateTeam(id, teamData);
      } else {
        await addTeam(teamData);
      }
      navigate('/teams');
    } catch (error) {
      setError('Failed to save team');
      console.error('Error saving team:', error);
    }
  };
  
  const togglePlayer = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/teams')}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back to Teams
      </button>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          {id ? 'Edit Team' : 'Create New Team'}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Players
              </label>
              <Link
                to="/players/new"
                className="flex items-center text-sm text-purple-600 hover:text-purple-800"
              >
                <Plus size={16} className="mr-1" />
                Add New Player
              </Link>
            </div>
            
            {players.length > 0 ? (
              <div className="border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto">
                {players.map(player => (
                  <div key={player.id} className="flex items-center mb-2 last:mb-0">
                    <input
                      type="checkbox"
                      id={`player-${player.id}`}
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => togglePlayer(player.id)}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label
                      htmlFor={`player-${player.id}`}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {player.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <p className="text-gray-500 text-sm">No players available.</p>
                <Link
                  to="/players/new"
                  className="inline-block mt-2 text-sm text-purple-600 hover:text-purple-800"
                >
                  Create your first player
                </Link>
              </div>
            )}
          </div>
          
          {selectedPlayers.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Selected Players ({selectedPlayers.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPlayers.map(playerId => {
                  const player = players.find(p => p.id === playerId);
                  return player ? (
                    <div
                      key={player.id}
                      className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      {player.name}
                      <button
                        type="button"
                        onClick={() => togglePlayer(player.id)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {id ? 'Update Team' : 'Create Team'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/teams')}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamForm;