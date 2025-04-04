import { create } from 'zustand';
import { Player } from '../types/index.types';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

interface PlayerStore {
  players: Player[];
  fetchPlayers: (teamId?: string) => Promise<void>;
  addPlayer: (player: Partial<Player>) => Promise<string>;
  updatePlayer: (id: string, player: Partial<Player>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  updatePlayerCareerStats: (playerId: string) => Promise<void>;
}

const initializeCareerStats = () => ({
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
});

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  players: [],

  fetchPlayers: async (teamId) => {
    try {
      let playersQuery;
      if (teamId) {
        playersQuery = query(collection(db, 'players'), where('teamId', '==', teamId));
      } else {
        playersQuery = collection(db, 'players');
      }
      const snapshot = await getDocs(playersQuery);
      const players = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Player, 'id'>)
      })) as Player[];
      set({ players });
    } catch (error) {
      console.error('Fetch players error:', error);
      throw error;
    }
  },

  addPlayer: async (player) => {
    try {
      const playerData = {
        ...player,
        careerStats: initializeCareerStats(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'players'), playerData);

      const newPlayer = {
        id: docRef.id,
        ...playerData,
      } as Player;

      set((state) => ({
        players: [...state.players, newPlayer]
      }));

      return docRef.id;
    } catch (error) {
      console.error('Add player error:', error);
      throw error;
    }
  },

  updatePlayer: async (id, player) => {
    try {
      const updateData = {
        ...player,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'players', id), updateData);
      
      set((state) => ({
        players: state.players.map(p => p.id === id ? { ...p, ...player } : p)
      }));

      // Handle team changes if necessary
      const existingPlayer = get().players.find(p => p.id === id);
      if (existingPlayer && player.teamId && existingPlayer.teamId !== player.teamId) {
        // Remove player from old team
        if (existingPlayer.teamId) {
          await updateDoc(doc(db, 'teams', existingPlayer.teamId), {
            playerIds: arrayRemove(id),
            updatedAt: serverTimestamp()
          });
        }
        // Add player to new team
        await updateDoc(doc(db, 'teams', player.teamId), {
          playerIds: arrayUnion(id),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Update player error:', error);
      throw error;
    }
  },

  deletePlayer: async (id) => {
    try {
      const player = get().players.find(p => p.id === id);
      
      await deleteDoc(doc(db, 'players', id));
      
      // Remove player from team if assigned
      if (player?.teamId) {
        await updateDoc(doc(db, 'teams', player.teamId), {
          playerIds: arrayRemove(id),
          updatedAt: serverTimestamp()
        });
      }

      set((state) => ({
        players: state.players.filter(p => p.id !== id)
      }));
    } catch (error) {
      console.error('Delete player error:', error);
      throw error;
    }
  },

  updatePlayerCareerStats: async (playerId) => {
    try {
      const player = get().players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');

      const careerStats = initializeCareerStats();
      
      // Update career stats in Firestore
      await updateDoc(doc(db, 'players', playerId), {
        careerStats,
        updatedAt: serverTimestamp()
      });

      // Update local state
      set((state) => ({
        players: state.players.map(p => 
          p.id === playerId ? { ...p, careerStats } : p
        )
      }));
    } catch (error) {
      console.error('Update player career stats error:', error);
      throw error;
    }
  }
}));