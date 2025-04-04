import { useAppStore } from '../store/index.store';

export const useAuth = () => {
  const { currentUser, isLoggedIn } = useAppStore();

  const checkAdminCookie = () => {
    const cookies = document.cookie.split(';');
    const isAdminCookie = cookies.find(cookie => cookie.trim().startsWith('isAdmin='));
    return isAdminCookie && isAdminCookie.split('=')[1] === 'true';
  };

  return {
    isAdmin: (isLoggedIn && currentUser?.role === 'admin') || checkAdminCookie(),
  };
};