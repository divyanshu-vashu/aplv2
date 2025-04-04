import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate,useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Leagues from './pages/Leagues';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Teams from './pages/Teams';
import TeamForm from './pages/TeamForm';
import Players from './pages/Players';
import PlayerEditForm from './pages/PlayerEditForm';
import PlayerForm from './pages/PlayerForm';
import PublicMatchDetail from './pages/PublicMatchDetail';
import PublicMatchView from './components/PublicMatchView';
import { useAppStore } from './store/index.store';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAppStore();
  
  // Check for login cookie
  const cookies = document.cookie.split(';');
  const isLoginCookie = cookies.find(cookie => cookie.trim().startsWith('islogin='));
  const hasLoginCookie = isLoginCookie && isLoginCookie.split('=')[1] === 'yes';
  
  if (!isLoggedIn && !hasLoginCookie) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};
const PublicMatchViewWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <PublicMatchView initialMatchId={id || ''} />;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/matches/public/:id" element={<PublicMatchViewWrapper />} />
          <Route path="/match/:id" element={<PublicMatchDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="players" element={<Players />} />
          {/* Protected Routes */}
          <Route path="leagues" element={<ProtectedRoute><Leagues /></ProtectedRoute>} />
          <Route path="matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="matches/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
          <Route path="teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
          <Route path="teams/new" element={<ProtectedRoute><TeamForm /></ProtectedRoute>} />
          <Route path="teams/edit/:id" element={<ProtectedRoute><TeamForm /></ProtectedRoute>} />
          {/* <Route path="players" element={<ProtectedRoute><Players /></ProtectedRoute>} /> */}
          <Route path="players/new" element={<ProtectedRoute><PlayerForm /></ProtectedRoute>} />
          // Add this route in your router configuration
          <Route path="/players/:id/edit" element={<ProtectedRoute><PlayerEditForm /></ProtectedRoute>} />
         
        </Route>
      </Routes>
    </Router>
  );
}

export default App;