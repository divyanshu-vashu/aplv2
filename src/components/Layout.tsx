import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Calendar, 
  Users, 
  User, 
  LogIn, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAppStore } from '../store/index.store';

const Layout: React.FC = () => {
  const { isLoggedIn, logout, setLoginState, setAdminState } = useAppStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Check for login cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const isLoginCookie = cookies.find(cookie => cookie.trim().startsWith('islogin='));
    const isAdminCookie = cookies.find(cookie => cookie.trim().startsWith('isAdmin='));
    
    if (isLoginCookie && isLoginCookie.split('=')[1] === 'yes') {
      setLoginState(true);
      
      if (isAdminCookie && isAdminCookie.split('=')[1] === 'true') {
        setAdminState(true);
      }
    }
  }, [setLoginState, setAdminState]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="md:hidden p-4 bg-purple-700 text-white flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Trophy className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">CricAppointy</span>
        </Link>
        <button onClick={toggleMobileMenu} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:block bg-purple-700 text-white w-full md:w-64 p-4 flex-shrink-0`}
      >
        <Link to="/" className="hidden md:flex items-center mb-8" onClick={() => setIsMobileMenuOpen(false)}>
          <Trophy className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">CricAppointy</span>
        </Link>
        
        <nav className="space-y-2">
          <Link 
            to="/" 
            className="flex items-center p-2 rounded hover:bg-purple-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            <span>Dashboard</span>
          </Link>
          <Link 
                to="/players" 
                className="flex items-center p-2 rounded hover:bg-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5 mr-3" />
                <span>Players</span>
              </Link>

          {/* Move Matches link inside the logged-in section */}
          {isLoggedIn ? (
            <>
            

              <Link 
                to="/matches" 
                className="flex items-center p-2 rounded hover:bg-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Calendar className="h-5 w-5 mr-3" />
                <span>Matches</span>
              </Link>
              
              <Link 
                to="/leagues" 
                className="flex items-center p-2 rounded hover:bg-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Trophy className="h-5 w-5 mr-3" />
                <span>Leagues</span>
              </Link>

              <Link 
                to="/teams" 
                className="flex items-center p-2 rounded hover:bg-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5 mr-3" />
                <span>Teams</span>
              </Link>
              
              {/* <Link 
                to="/players" 
                className="flex items-center p-2 rounded hover:bg-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5 mr-3" />
                <span>Players</span>
              </Link> */}
              
              <button 
                onClick={handleLogout}
                className="flex items-center p-2 rounded hover:bg-purple-600 transition-colors w-full text-left"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center p-2 rounded hover:bg-purple-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LogIn className="h-5 w-5 mr-3" />
              <span>Login</span>
            </Link>
          )}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;