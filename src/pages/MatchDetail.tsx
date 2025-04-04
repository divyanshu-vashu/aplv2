import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/index.store';
import MatchToss from '../components/MatchToss';  // Import MatchToss
import DetailedScorecard from '../components/DetailedScorecard';
import Scoreboard from '../components/Scoreboard';
import { ArrowLeft, Play } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { matches } = useAppStore();
  const { isAdmin } = useAuth();
  const [showToss, setShowToss] = useState(false);

  const handleStartMatch = () => {
    // Check both the hook and cookie
    const cookies = document.cookie.split(';');
    const isAdminCookie = cookies.find(cookie => cookie.trim().startsWith('isAdmin='));
    const hasAdminAccess = isAdmin || (isAdminCookie && isAdminCookie.split('=')[1] === 'true');

    if (hasAdminAccess) {
      setShowToss(true);
    } else {
      console.log('Admin access denied');
      // Optionally redirect to login
      navigate('/login');
    }
  };

  const match = matches.find(m => m.id === id);

  // Add handler functions
  const handleTossComplete = () => {
    setShowToss(false);
  };

  useEffect(() => {
    if (match && isAdmin && match.status === 'ongoing') {
      console.log("admin access ")
    }
  }, [match, isAdmin]);

  if (!match) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Match not found</p>
        <button
          onClick={() => navigate('/matches')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Back to Matches
        </button>
      </div>
    );
  }
  
  
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Modify the return statement's conditional rendering
  return (
    <div>
      <button
        onClick={() => navigate('/matches')}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back to Matches
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-purple-700 text-white p-4">
          <h1 className="text-xl font-bold">{match.teamA.name} vs {match.teamB.name}</h1>
          <p className="text-sm opacity-90">{match.league.name} • {formatDate(match.date)}</p>
        </div>
        
        {match.status === 'upcoming' ? (
          <div className="p-6">
            {showToss ? (
              <MatchToss 
                match={match}
                onTossComplete={handleTossComplete}
              />
            ) : (
              <button
                onClick={handleStartMatch}
                className="flex items-center py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Play size={18} className="mr-1" />
                Start Match
              </button>
            )}
          </div>
        ) : match.status === 'ongoing' ? (
          <>
            <Scoreboard 
              match={match}
              onClose={() => navigate('/matches')}
            />
            {/* <DetailedScorecard match={match} /> */}
            <DetailedScorecard initialMatchId={id!} />
          </>
        ) : (
          // <DetailedScorecard match={match} />
          <DetailedScorecard initialMatchId={id!} />
        )}
      </div>
    </div>
  );
};

export default MatchDetail;