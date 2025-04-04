import React from 'react';
import { Match } from '../types/index.types';
import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
  match: Match;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ match }) => {
  const navigate = useNavigate();

  const getCardColor = () => {
    switch (match.status) {
      case 'completed':
        return 'bg-yellow-500';
      case 'ongoing':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleClick = () => {
    // Always navigate to public view
    navigate(`/matches/public/${match.id}`);
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
      className="ag-courses_item cursor-pointer"
      onClick={handleClick}
    >
      <div className="ag-courses-item_link">
        <div className={`ag-courses-item_bg ${getCardColor()}`}></div>

        <div className="ag-courses-item_title">
          {match.teamA.name} vs {match.teamB.name}
        </div>

        <div className="ag-courses-item_date-box">
          {match.status === 'ongoing' && (
            <div className="text-green-500 font-bold mb-2">Live</div>
          )}
          {match.status === 'completed' && (
            <div className="text-yellow-500 font-bold mb-2">Completed</div>
          )}
          {match.status === 'upcoming' && (
            <div className="text-blue-500 font-bold mb-2">Upcoming</div>
          )}
          <span className="ag-courses-item_date">
            {formatDate(match.date)}
          </span>
        </div>

        {match.status !== 'upcoming' && (
          <div className="mt-4 text-white">
            <div>{match.teamA.name}: {match.teamA.score.runs}/{match.teamA.score.wickets}</div>
            <div>{match.teamB.name}: {match.teamB.score.runs}/{match.teamB.score.wickets}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;