import React, { useEffect } from 'react';
import { useAppStore } from '../store/index.store';
import DashboardCard from '../components/DashboardCard';
import { RotateCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { matches, fetchMatches } = useAppStore();
  
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Sort matches: Live matches first, then upcoming, then completed
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.status === 'ongoing' && b.status !== 'ongoing') return -1;
    if (b.status === 'ongoing' && a.status !== 'ongoing') return 1;
    if (a.status === 'upcoming' && b.status === 'upcoming') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (a.status === 'completed' && b.status === 'completed') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return a.status === 'completed' ? 1 : -1;
  });

  const handleRefresh = () => {
    fetchMatches();
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Cricket Matches</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <RotateCw size={18} className="mr-2" />
          Refresh
        </button>
      </div>
      
      <div className="ag-format-container">
        {sortedMatches.length > 0 ? (
          <div className="ag-courses_box">
            {sortedMatches.map(match => (
              <DashboardCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No matches available</p>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 mx-auto"
            >
              <RotateCw size={18} className="mr-2" />
              Refresh Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;