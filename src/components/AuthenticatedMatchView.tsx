import React from 'react';
import { Match } from '../types/index.types';
import { useNavigate } from 'react-router-dom';

interface AuthenticatedMatchViewProps {
  match: Match;
}

const AuthenticatedMatchView: React.FC<AuthenticatedMatchViewProps> = ({ match }) => {
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

  if (!match?.teamA?.name || !match?.teamB?.name || !match?.league?.name) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <p className="text-center text-gray-600">Match data incomplete</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={handleClick}
    >
      <div className="mb-4">
        <div className="bg-purple-700 text-white p-3 rounded-t-lg">
          <div className="text-sm font-medium">{match.league.name}</div>
          <div className="text-xs opacity-80">{formatDate(match.date)}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
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

        <div className="mt-3 text-sm">
          {match.status === 'completed' && match.result && (
            <div className="font-medium text-green-600">
              {match.result.description}
            </div>
          )}
          {match.status === 'upcoming' && (
            <div className="text-gray-500">
              Match not started
            </div>
          )}
          {match.status === 'ongoing' && (
            <div className="font-medium text-orange-500">
              Match in progress
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedMatchView;