
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Auth } from './components/Auth';
import { MainDashboard } from './components/MainDashboard';
import { NotificationArea } from './components/Notification';
import { ProfileModal } from './components/ProfileModal';
import { TestModePanel } from './components/TestModePanel';
import { DemoModeBanner } from './components/DemoModeBanner';

function App() {
  const { isAuthenticated, isDemoMode } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NotificationArea />
      {isDemoMode && <DemoModeBanner />}
      <div className="container mx-auto px-4">
        <Header onEditProfile={() => setIsProfileModalOpen(true)} />
        <main>
          {isAuthenticated ? <MainDashboard /> : <Auth />}
        </main>
        <footer className="text-center py-8 mt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">&copy; 2024 Caliope - Tu guía de bienestar personalizado</p>
        </footer>
      </div>
      {isAuthenticated && (
        <ProfileModal 
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
        />
      )}
      {isAuthenticated && !isDemoMode && <TestModePanel />}
    </div>
  );
}

export default App;
