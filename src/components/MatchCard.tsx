import React from 'react';
import { Match } from '../types/index.types';
import { useNavigate } from 'react-router-dom';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/matches/${match.id}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="bg-purple-700 text-white p-3">
        <div className="text-sm font-medium">{match.league.name}</div>
        <div className="text-xs opacity-80">{formatDate(match.date)}</div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold">{match.teamA.name}</div>
          {match.status !== 'upcoming' && (
            <div className="text-sm font-medium">
              {match.teamA.score.runs}/{match.teamA.score.wickets} ({match.teamA.score.overs}.{match.teamA.score.balls})
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="font-semibold">{match.teamB.name}</div>
          {match.status !== 'upcoming' && (
            <div className="text-sm font-medium">
              {match.teamB.score.runs}/{match.teamB.score.wickets} ({match.teamB.score.overs}.{match.teamB.score.balls})
            </div>
          )}
        </div>
        
        {match.status === 'completed' && match.winner && (
          <div className="mt-3 text-sm font-medium text-green-600">
            Winner: {match.winner === match.teamA.teamId ? match.teamA.name : match.teamB.name}
          </div>
        )}
        
        {match.status === 'upcoming' && (
          <div className="mt-3 text-sm text-gray-500">
            Match not started
          </div>
        )}
        
        {match.status === 'ongoing' && (
          <div className="mt-3 text-sm font-medium text-orange-500">
            Match in progress
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchCard;