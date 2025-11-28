import { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RawMaterialKYC from './pages/RawMaterialKYC';
import CompositionPlanning from './pages/CompositionPlanning';
import SurgeBunker from './pages/SurgeBunker';
import PPTReading from './pages/PPTReading';
import FinishedGood from './pages/FinishedGood';
import FuelConsumption from './pages/FuelConsumption';
import Reports from './pages/Reports';
import { storage } from './utils/localStorage';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    storage.setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    storage.clearUser();
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'raw-material':
        return <RawMaterialKYC />;
      case 'composition-planning':
        return <CompositionPlanning />;
      case 'surge-bunker':
        return <SurgeBunker />;
      case 'ppt-reading':
        return <PPTReading />;
      case 'finished-good':
        return <FinishedGood />;
      case 'fuel':
        return <FuelConsumption />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
      userName={user.id}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
