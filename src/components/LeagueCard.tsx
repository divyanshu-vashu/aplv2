import React, { useState } from 'react';
import { League } from '../types/index.types';
import { MoreVertical, Edit, Trash } from 'lucide-react';
import { useAppStore } from '../store/index.store';

interface LeagueCardProps {
  league: League;
}

const LeagueCard: React.FC<LeagueCardProps> = ({ league }) => {
  const { deleteLeague, updateLeague } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(league.name);
  const [maxTeamCount, setMaxTeamCount] = useState(league.maxTeamCount);
  const [overs, setOvers] = useState(league.overs);
  const [startDate, setStartDate] = useState(league.startDate);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      await updateLeague(league.id, {
        name,
        maxTeamCount,
        overs,
        startDate
      });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update league');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLeague(league.id);
      setShowMenu(false);
      setError(null);
    } catch (err) {
      setError('Failed to delete league');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setName(league.name);
    setMaxTeamCount(league.maxTeamCount);
    setOvers(league.overs);
    setStartDate(league.startDate);
    setIsEditing(false);
  };

  // Remove the endDate input field from the editing form
  // And remove the endDate display from the view mode
  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };
  
  // const handleDelete = () => {
  //   deleteLeague(league.id);
  //   setShowMenu(false);
  // };
  
  
  
  
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {error && (
        <div className="bg-red-100 text-red-600 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      <div className="bg-purple-700 text-white p-3 flex justify-between items-center">
        <div className="font-medium">{league.name}</div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-purple-600"
          >
            <MoreVertical size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10">
              <button 
                onClick={handleEdit}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <Trash size={16} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="p-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              League Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Teams
            </label>
            <input
              type="number"
              value={maxTeamCount}
              onChange={(e) => setMaxTeamCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overs
            </label>
            <input
              type="number"
              value={overs}
              onChange={(e) => setOvers(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm text-gray-500">Max Teams</div>
              <div className="font-medium">{league.maxTeamCount}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Overs</div>
              <div className="font-medium">{league.overs}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                <div className="font-medium">{new Date(league.startDate).toLocaleDateString()}</div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueCard;