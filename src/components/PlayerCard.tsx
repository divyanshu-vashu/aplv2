// import React from 'react';
// import { Player } from '../types/index.types';
// import { MoreVertical, Edit, Trash } from 'lucide-react';
// import { useAppStore } from '../store/index.store';

// interface PlayerCardProps {
//   player: Player;
// }

// const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
//   const { updatePlayer, deletePlayer } = useAppStore();
//   const [showMenu, setShowMenu] = React.useState(false);
//   const [isEditing, setIsEditing] = React.useState(false);
//   const [name, setName] = React.useState(player.name);
  
//   const handleEdit = () => {
//     setIsEditing(true);
//     setShowMenu(false);
//   };
  
//   const handleDelete = () => {
//     deletePlayer(player.id);
//     setShowMenu(false);
//   };
  
//   const handleSave = () => {
//     updatePlayer(player.id, { name });
//     setIsEditing(false);
//   };
  
//   const handleCancel = () => {
//     setName(player.name);
//     setIsEditing(false);
//   };
  
//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//       <div className="bg-purple-700 text-white p-3 flex justify-between items-center">
//         <div className="font-medium">{player.name}</div>
//         <div className="relative">
//           <button 
//             onClick={() => setShowMenu(!showMenu)}
//             className="p-1 rounded-full hover:bg-purple-600"
//           >
//             <MoreVertical size={18} />
//           </button>
          
//           {showMenu && (
//             <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10">
//               <button 
//                 onClick={handleEdit}
//                 className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//               >
//                 <Edit size={16} className="mr-2" />
//                 Edit
//               </button>
//               <button 
//                 onClick={handleDelete}
//                 className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//               >
//                 <Trash size={16} className="mr-2" />
//                 Delete
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
//       {isEditing ? (
//         <div className="p-4">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Player Name
//             </label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md"
//             />
//           </div>
          
//           <div className="flex space-x-2">
//             <button
//               onClick={handleSave}
//               className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
//             >
//               Save
//             </button>
//             <button
//               onClick={handleCancel}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="p-4">
//           <div className="grid grid-cols-3 gap-2 mb-2">
//             <div>
//               <div className="text-xs text-gray-500">Runs</div>
//               <div className="font-medium">{player.runs}</div>
//             </div>
//             <div>
//               <div className="text-xs text-gray-500">Wickets</div>
//               <div className="font-medium">{player.wickets}</div>
//             </div>
//             <div>
//               <div className="text-xs text-gray-500">Catches</div>
//               <div className="font-medium">{player.catches}</div>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <div className="text-xs text-gray-500">Batting Balls</div>
//               <div className="font-medium">{player.battingBalls}</div>
//             </div>
//             <div>
//               <div className="text-xs text-gray-500">Bowling Balls</div>
//               <div className="font-medium">{player.bowlingBalls}</div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PlayerCard;
import React from 'react';
import { Player } from '../types/index.types';
import { MoreVertical, Edit, Trash } from 'lucide-react';
import { useAppStore } from '../store/index.store';

interface PlayerCardProps {
  player: Player;
}

// In the menu options of PlayerCard.tsx, update the Edit button to use navigation
import { useNavigate } from 'react-router-dom';

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const navigate = useNavigate();
  const { updatePlayer, deletePlayer } = useAppStore();
  const [showMenu, setShowMenu] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(player.name);
  
  const handleEdit = () => {
    navigate(`/players/${player.id}/edit`);
    setShowMenu(false);
  };
  
  const handleDelete = () => {
    deletePlayer(player.id);
    setShowMenu(false);
  };
  
  const handleSave = () => {
    updatePlayer(player.id, { name });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setName(player.name);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-purple-700 text-white p-3 flex justify-between items-center">
        <div className="font-medium">{player.name}</div>
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <div className="text-xs text-gray-500">Total Runs</div>
              <div className="font-medium">{player.careerStats?.totalRuns || 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Wickets</div>
              <div className="font-medium">{player.careerStats?.totalWickets || 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Matches</div>
              <div className="font-medium">{player.careerStats?.matches || 0}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-500">Batting Avg</div>
              <div className="font-medium">{player.careerStats?.average?.toFixed(2) || '0.00'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Bowling Avg</div>
              <div className="font-medium">{player.careerStats?.bowlingAverage?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;