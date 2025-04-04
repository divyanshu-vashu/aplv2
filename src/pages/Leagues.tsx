import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/index.store';
import LeagueCard from '../components/LeagueCard';
import { Plus } from 'lucide-react';

const Leagues: React.FC = () => {
  const { leagues, addLeague, fetchLeagues } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [maxTeamCount, setMaxTeamCount] = useState(10);
  const [overs, setOvers] = useState(20);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchLeagues();
      } catch (err) {
        setError('Failed to fetch leagues');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchLeagues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addLeague({
      name,
      maxTeamCount,
      overs,
      startDate,
      status: 'upcoming' // Default status for new leagues
    });
    
    // Reset form
    setName('');
    setMaxTeamCount(10);
    setOvers(20);
    setStartDate('');
    setShowForm(false);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leagues</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <Plus size={18} className="mr-1" />
          Add League
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New League</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                League Name
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
            
            <div className="mb-4">
              <label htmlFor="maxTeams" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Teams
              </label>
              <input
                id="maxTeams"
                type="number"
                min="2"
                value={maxTeamCount}
                onChange={(e) => setMaxTeamCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            
            
            <div className="mb-6">
              <label htmlFor="overs" className="block text-sm font-medium text-gray-700 mb-1">
                Overs
              </label>
              <input
                id="overs"
                type="number"
                min="1"
                value={overs}
                onChange={(e) => setOvers(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Create League
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
      
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading leagues...</p>
        </div>
      ) : leagues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leagues.map(league => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No leagues available. Create your first league!</p>
        </div>
      )}
    </div>
  );
};

export default Leagues;