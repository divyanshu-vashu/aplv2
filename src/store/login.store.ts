import { create } from 'zustand';
import { User } from '../types/index.types';
import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

interface LoginStore {
  isLoggedIn: boolean;
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  unsubscribeAuth?: () => void;
  
  // Auth actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthState: () => void;
  clearError: () => void;
  setLoginState: (state: boolean) => void;
  setAdminState: (state: boolean) => void;  // Add this line
}

const DEFAULT_ADMIN: User = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'macbook',
  role: 'admin'
};

export const useLoginStore = create<LoginStore>((set, get) => ({
  isLoggedIn: false,
  currentUser: null,
  isLoading: false,
  error: null,
  unsubscribeAuth: undefined,

  setLoginState: (state) => set({ isLoggedIn: state }),
  setAdminState: (state) => set(store => ({
    currentUser: store.currentUser ? { ...store.currentUser, role: state ? 'admin' : 'public' } : null
  })),

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
        // Store admin state in localStorage
        localStorage.setItem('currentUser', JSON.stringify(DEFAULT_ADMIN));
        localStorage.setItem('isLoggedIn', 'true');
        
        set({ 
          isLoggedIn: true, 
          currentUser: DEFAULT_ADMIN,
          isLoading: false 
        });
        return true;
      }

      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const user: User = {
        username: userCredential.user.email || '',
        role: 'public',
        password: ''
      };

      set({ 
        isLoggedIn: true, 
        currentUser: user,
        isLoading: false 
      });
      return true;

    } catch (error) {
      console.error('Login error:', error);
      set({ 
        error: 'Invalid username or password', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      // Clear localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      
      const { unsubscribeAuth } = get();
      if (typeof unsubscribeAuth === 'function') {
        unsubscribeAuth();
      }

      await signOut(auth);
      set({ 
        isLoggedIn: false, 
        currentUser: null,
        unsubscribeAuth: undefined,
        isLoading: false 
      });

    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        error: 'Failed to logout', 
        isLoading: false 
      });
    }
  },

  checkAuthState: () => {
    // Check localStorage first
    const storedUser = localStorage.getItem('currentUser');
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');

    if (storedUser && storedIsLoggedIn === 'true') {
      set({
        isLoggedIn: true,
        currentUser: JSON.parse(storedUser),
        isLoading: false
      });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData: User = {
          username: user.email || '',
          role: 'public',
          password: ''
        };
        set({ 
          isLoggedIn: true, 
          currentUser: userData,
          isLoading: false 
        });
      } else {
        set({ 
          isLoggedIn: false, 
          currentUser: null,
          isLoading: false 
        });
      }
    });

    set({ unsubscribeAuth: unsubscribe });
  },

  clearError: () => set({ error: null })
}));