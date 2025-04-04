import React, { useEffect, useState } from 'react';
import { useTeamStore } from '../store/team.store';
import TeamCard from '../components/TeamCard';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Teams: React.FC = () => {
  const { teams, fetchTeams } = useTeamStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setIsLoading(true);
        await fetchTeams();
      } catch (err) {
        setError('Failed to load teams');
        console.error('Error loading teams:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [fetchTeams]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading teams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 mb-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-700 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
        <Link
          to="/teams/new"
          className="flex items-center py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Plus size={18} className="mr-1" />
          Add Team
        </Link>
      </div>
      
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <TeamCard 
              key={team.id} 
              team={team} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No teams available.</p>
          <Link
            to="/teams/new"
            className="inline-flex items-center text-purple-600 hover:text-purple-700"
          >
            <Plus size={16} className="mr-1" />
            Create your first team
          </Link>
        </div>
      )}
    </div>
  );
};

export default Teams;