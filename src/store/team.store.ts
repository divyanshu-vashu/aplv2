import { create } from 'zustand';
import { Team, Player } from '../types/index.types';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp
} from 'firebase/firestore';

interface TeamStore {
  teams: Team[];
  players: Player[];
  fetchTeams: () => Promise<void>;
  fetchPlayers: () => Promise<void>;
  addTeam: (team: Omit<Team, 'id'>) => Promise<string>;
  updateTeam: (id: string, team: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  players: [],

  fetchTeams: async () => {
    try {
      const teamsQuery = query(collection(db, 'teams'));
      const snapshot = await getDocs(teamsQuery);
      const teams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[];
      
      set({ teams });
    } catch (error) {
      console.error('Fetch teams error:', error);
      throw error;
    }
  },

  fetchPlayers: async () => {
    try {
      const playersQuery = query(collection(db, 'players'));
      const snapshot = await getDocs(playersQuery);
      const players = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];
      
      set({ players });
    } catch (error) {
      console.error('Fetch players error:', error);
      throw error;
    }
  },

  addTeam: async (team) => {
    try {
      const teamData = {
        name: team.name,
        playerIds: team.playerIds || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      const docRef = await addDoc(collection(db, 'teams'), teamData);
  
      const newTeam = { 
        id: docRef.id,
        ...teamData,
        playerIds: team.playerIds || [] 
      } as Team;
  
      set((state) => ({
        teams: [...state.teams, newTeam]
      }));
  
      const updatePromises = (team.playerIds || []).map(playerId => 
        updateDoc(doc(db, 'players', playerId), {
          teamId: docRef.id,
          updatedAt: serverTimestamp()
        })
      );
  
      await Promise.all(updatePromises);
      return docRef.id;
    } catch (error) {
      console.error('Add team error:', error);
      return '';
    }
  },

  updateTeam: async (id, team) => {
    try {
      await updateDoc(doc(db, 'teams', id), {
        ...team,
        updatedAt: serverTimestamp()
      });
      set((state) => ({
        teams: state.teams.map(t => t.id === id ? { ...t, ...team } : t)
      }));
    } catch (error) {
      console.error('Update team error:', error);
    }
  },

  deleteTeam: async (id) => {
    try {
      await deleteDoc(doc(db, 'teams', id));
      set((state) => ({
        teams: state.teams.filter(t => t.id !== id)
      }));
    } catch (error) {
      console.error('Delete team error:', error);
    }
  }
}));