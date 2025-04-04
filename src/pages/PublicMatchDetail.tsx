import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/index.store';
import { ArrowLeft } from 'lucide-react';

const PublicMatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { matches } = useAppStore();
  
  const match = matches.find(m => m.id === id);
  
  if (!match) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Match not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back to Dashboard
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-purple-700 text-white p-4">
          <h1 className="text-xl font-bold">{match.teamA.name} vs {match.teamB.name}</h1>
          <p className="text-sm opacity-90">{match.league.name}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">{match.teamA.name}</h2>
              <div className="text-3xl font-bold mb-2">
                {match.teamA.score.runs}/{match.teamA.score.wickets}
              </div>
              <div className="text-gray-600">
                {match.teamA.score.overs}.{match.teamA.score.balls} overs
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">{match.teamB.name}</h2>
              <div className="text-3xl font-bold mb-2">
                {match.teamB.score.runs}/{match.teamB.score.wickets}
              </div>
              <div className="text-gray-600">
                {match.teamB.score.overs}.{match.teamB.score.balls} overs
              </div>
            </div>
          </div>
          
          {match.result && (
            <div className="text-center text-green-600 font-bold text-lg">
              Winner: {match.result.winner === match.teamA.teamId ? match.teamA.name : match.teamB.name}
            </div>
          )}

          {match.status === 'ongoing' && (
            <div className="text-center text-orange-500 font-bold text-lg">
              Match in progress
            </div>
          )}

          {match.status === 'upcoming' && (
            <div className="text-center text-gray-500 text-lg">
              Match not started
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicMatchDetail;