import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { ChatInterface } from './ChatInterface';
import { HistoryPanel } from './HistoryPanel';
import { GoalsPanel } from './GoalsPanel';
import { MembershipPanel } from './MembershipPanel';

type Tab = 'chat' | 'history' | 'goals' | 'membership';

export const MainDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  
  if (!currentUser) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface />;
      case 'history':
        return <HistoryPanel />;
      case 'goals':
          return <GoalsPanel />;
      case 'membership':
          return <MembershipPanel />;
      default:
        return <ChatInterface />;
    }
  };

  const tabButtonClasses = (tabName: Tab) =>
    `px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded-t-lg ${
      activeTab === tabName
        ? 'border-b-2 border-primary text-primary bg-white'
        : 'text-gray-500 hover:text-primary'
    }`;


  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-6">
      <main className="w-full lg:w-2/3">
        <div className="flex border-b border-gray-200 overflow-x-auto">
            <button onClick={() => setActiveTab('chat')} className={tabButtonClasses('chat')}>
                Chat con Caliope
            </button>
            <button onClick={() => setActiveTab('history')} className={tabButtonClasses('history')}>
                Mi Historial
            </button>
            <button onClick={() => setActiveTab('goals')} className={tabButtonClasses('goals')}>
                Mis Metas
            </button>
             <button onClick={() => setActiveTab('membership')} className={tabButtonClasses('membership')}>
                Mi Membresía
            </button>
        </div>
        <div className="mt-[-1px]">
         {renderTabContent()}
        </div>
      </main>
      <Sidebar />
    </div>
  );
};