import { create } from 'zustand';
import { League } from '../types/index.types';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  
} from 'firebase/firestore';

interface LeagueStore {
  leagues: League[];
  currentLeague: League | null;
  isLoading: boolean;
  error: string | null;
  unsubscribeLeagues?: () => void;

  // League actions
  fetchLeagues: () => Promise<void>;
  fetchLeagueById: (id: string) => Promise<void>;
  addLeague: (league: Omit<League, 'id'>) => Promise<string>;
  updateLeague: (id: string, league: Partial<League>) => Promise<void>;
  deleteLeague: (id: string) => Promise<void>;
  clearCurrentLeague: () => void;
}

// Add this utility function at the top of the file after the imports
const cleanupLeagueListener = (get: () => LeagueStore) => {
  const unsubscribe = get().unsubscribeLeagues;
  if (typeof unsubscribe === 'function') {
    unsubscribe();
  }
};

// Then update the fetchLeagues function to use this utility
export const useLeagueStore = create<LeagueStore>((set, get) => ({
  leagues: [],
  currentLeague: null,
  isLoading: false,
  error: null,
  unsubscribeLeagues: undefined,

  fetchLeagues: async () => {
    set({ isLoading: true, error: null });
    try {
      // Clean up existing listener using the utility function
      cleanupLeagueListener(get);

      const leaguesQuery = query(
        collection(db, 'leagues'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(leaguesQuery);
      const leagues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as League[];
      
      set({ leagues, isLoading: false });

      // Set up real-time listener for updates
      const unsubscribe = onSnapshot(leaguesQuery, (snapshot) => {
        const updatedLeagues = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as League[];
        set({ leagues: updatedLeagues });
      }, (error) => {
        console.error('League listener error:', error);
        set({ error: 'Failed to listen to league updates' });
      });

      set({ unsubscribeLeagues: unsubscribe });
    } catch (error) {
      console.error('Fetch leagues error:', error);
      set({ error: 'Failed to fetch leagues', isLoading: false });
    }
  },

  fetchLeagueById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Clean up existing listener if any
      cleanupLeagueListener(get);

      const leagueDoc = doc(db, 'leagues', id);
      const unsubscribe = onSnapshot(leagueDoc, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const leagueData = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          } as League;
          set({ currentLeague: leagueData, isLoading: false });
        } else {
          set({ error: 'League not found', isLoading: false });
        }
      }, (error) => {
        console.error('League listener error:', error);
        set({ error: 'Failed to listen to league updates', isLoading: false });
      });

      // Store the unsubscribe function in the state instead of returning it
      set({ unsubscribeLeagues: unsubscribe });
    } catch (error) {
      console.error('Fetch league by id error:', error);
      set({ error: 'Failed to fetch league', isLoading: false });
    }
  },

  addLeague: async (league) => {
    set({ isLoading: true, error: null });
    try {
      const leagueData = {
        ...league,
        status: league.status || 'upcoming',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'leagues'), leagueData);
      const newLeague = { ...leagueData, id: docRef.id } as League;
      
      set(state => ({
        leagues: [newLeague, ...state.leagues],
        isLoading: false
      }));

      return docRef.id;
    } catch (error) {
      console.error('Add league error:', error);
      set({ error: 'Failed to add league', isLoading: false });
      return '';
    }
  },

  updateLeague: async (id, league) => {
    set({ isLoading: true, error: null });
    try {
      const updateData = {
        ...league,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'leagues', id), updateData);
      
      set(state => ({
        leagues: state.leagues.map(l => l.id === id ? { ...l, ...league } : l),
        currentLeague: state.currentLeague?.id === id ? { ...state.currentLeague, ...league } : state.currentLeague,
        isLoading: false
      }));
    } catch (error) {
      console.error('Update league error:', error);
      set({ error: 'Failed to update league', isLoading: false });
    }
  },

  deleteLeague: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, 'leagues', id));
      
      set(state => ({
        leagues: state.leagues.filter(l => l.id !== id),
        currentLeague: state.currentLeague?.id === id ? null : state.currentLeague,
        isLoading: false
      }));
    } catch (error) {
      console.error('Delete league error:', error);
      set({ error: 'Failed to delete league', isLoading: false });
    }
  },

  clearCurrentLeague: () => {
    set({ currentLeague: null });
  }
}));