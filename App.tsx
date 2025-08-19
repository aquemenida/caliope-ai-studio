
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Auth } from './components/Auth';
import { MainDashboard } from './components/MainDashboard';
import { NotificationArea } from './components/Notification';
import { ProfileModal } from './components/ProfileModal';
import { TestModePanel } from './components/TestModePanel';
import { DemoModeBanner } from './components/DemoModeBanner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const { isAuthenticated, isDemoMode, loading } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isAdminRoute = window.location.pathname === '/admin';
  
  if (loading && !isDemoMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={16} text="Cargando Caliope..." />
      </div>
    );
  }

  const renderContent = () => {
    if (isAdminRoute) {
      return <AdminDashboard />;
    }
    
    return (
        <>
            <Header onEditProfile={() => setIsProfileModalOpen(true)} />
            <main>
                {isAuthenticated ? <MainDashboard /> : <Auth />}
            </main>
            <footer className="text-center py-8 mt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">&copy; 2024 Caliope - Tu guía de bienestar personalizado</p>
            </footer>
            {isAuthenticated && (
                <ProfileModal 
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                />
            )}
            {isAuthenticated && !isDemoMode && <TestModePanel />}
        </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NotificationArea />
      {isAuthenticated && isDemoMode && !isAdminRoute && <DemoModeBanner />}
      <div className={`container mx-auto px-4 ${isAdminRoute ? 'max-w-none !px-0' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;