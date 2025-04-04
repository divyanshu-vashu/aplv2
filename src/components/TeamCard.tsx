import React from 'react';
import { Team } from '../types/index.types';
import { MoreVertical, Edit, Trash, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/index.store';

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const navigate = useNavigate();
  const { deleteTeam } = useAppStore();
  const [showMenu, setShowMenu] = React.useState(false);
  
  const handleEdit = () => {
    navigate(`/teams/edit/${team.id}`);
    setShowMenu(false);
  };
  
  const handleDelete = () => {
    deleteTeam(team.id);
    setShowMenu(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-purple-700 text-white p-3 flex justify-between items-center">
        <div className="font-medium">{team.name}</div>
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
      
      <div className="p-4">
        <div className="flex items-center text-gray-600">
          <User size={16} className="mr-2" />
          <span>{team.playerIds?.length || 0} Players</span>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;