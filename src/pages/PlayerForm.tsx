import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/index.store';
import { ArrowLeft } from 'lucide-react';

const PlayerForm: React.FC = () => {
  const navigate = useNavigate();
  const { addPlayer } = useAppStore();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addPlayer({ 
        name,
        careerStats: {
          matches: 0,
          totalRuns: 0,
          totalBallsFaced: 0,
          totalFours: 0,
          totalSixes: 0,
          highestScore: 0,
          average: 0,
          strikeRate: 0,
          totalWickets: 0,
          totalOvers: 0,
          totalMaidens: 0,
          totalRunsConceded: 0,
          bestBowling: "0/0",
          bowlingAverage: 0,
          bowlingEconomy: 0,
          totalCatches: 0,
          totalRunouts: 0,
          totalStumpings: 0
        }
      });
      navigate('/players');
    } catch (error) {
      console.error('Error creating player:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <button
        onClick={() => navigate('/players')}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back to Players
      </button>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Create New Player</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Player Name
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
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Player'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/players')}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerForm;