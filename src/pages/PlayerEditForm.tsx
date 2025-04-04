import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/index.store';
import { Player } from '../types/index.types';
import { ArrowLeft } from 'lucide-react';

const PlayerEditForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updatePlayer, players } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Player>>({
    name: '',
    role: 'Batsman',
    isCaptain: false,
    isWicketKeeper: false,
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

  useEffect(() => {
    if (id) {
      const player = players.find(p => p.id === id);
      if (player) {
        setFormData(player);
      }
    }
  }, [id, players]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (id) {
        await updatePlayer(id, formData);
        navigate('/players');
      }
    } catch (error) {
      console.error('Error updating player:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCareerStatsChange = (field: keyof Player['careerStats'], value: number | string) => {
    setFormData((prev: Partial<Player>) => ({
      ...prev,
      careerStats: {
        ...(prev.careerStats || {}),
        [field]: value
      } as Player['careerStats']
    }));
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
        <h1 className="text-xl font-bold text-gray-800 mb-6">Edit Player</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Player['role'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket-Keeper">Wicket-Keeper</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isCaptain}
                  onChange={(e) => setFormData(prev => ({ ...prev, isCaptain: e.target.checked }))}
                  className="mr-2"
                />
                Captain
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isWicketKeeper}
                  onChange={(e) => setFormData(prev => ({ ...prev, isWicketKeeper: e.target.checked }))}
                  className="mr-2"
                />
                Wicket Keeper
              </label>
            </div>
          </div>

          {/* Career Stats */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Batting Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Matches', field: 'matches' },
                { label: 'Total Runs', field: 'totalRuns' },
                { label: 'Balls Faced', field: 'totalBallsFaced' },
                { label: 'Fours', field: 'totalFours' },
                { label: 'Sixes', field: 'totalSixes' },
                { label: 'Highest Score', field: 'highestScore' },
                { label: 'Average', field: 'average' },
                { label: 'Strike Rate', field: 'strikeRate' }
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    value={formData.careerStats?.[field as keyof Player['careerStats']] || 0}
                    onChange={(e) => handleCareerStatsChange(field as keyof Player['careerStats'], Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>

            <h2 className="text-lg font-semibold text-gray-700">Bowling Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Wickets', field: 'totalWickets' },
                { label: 'Total Overs', field: 'totalOvers' },
                { label: 'Maidens', field: 'totalMaidens' },
                { label: 'Runs Conceded', field: 'totalRunsConceded' },
                { label: 'Best Bowling', field: 'bestBowling' },
                { label: 'Bowling Average', field: 'bowlingAverage' },
                { label: 'Economy Rate', field: 'bowlingEconomy' }
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type={field === 'bestBowling' ? 'text' : 'number'}
                    value={formData.careerStats?.[field as keyof Player['careerStats']] || 0}
                    onChange={(e) => handleCareerStatsChange(
                      field as keyof Player['careerStats'],
                      field === 'bestBowling' ? e.target.value : Number(e.target.value)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>

            <h2 className="text-lg font-semibold text-gray-700">Fielding Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Catches', field: 'totalCatches' },
                { label: 'Run Outs', field: 'totalRunouts' },
                { label: 'Stumpings', field: 'totalStumpings' }
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    value={formData.careerStats?.[field as keyof Player['careerStats']] || 0}
                    onChange={(e) => handleCareerStatsChange(field as keyof Player['careerStats'], Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
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

export default PlayerEditForm;