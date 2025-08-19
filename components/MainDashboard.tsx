
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { ChatInterface } from './ChatInterface';
import { HistoryPanel } from './HistoryPanel';
import { GoalsPanel } from './GoalsPanel';
import { MembershipPanel } from './MembershipPanel';
import { VisualJournalPanel } from './VisualJournalPanel';
import { SummaryPanel } from './SummaryPanel';
import { Icon } from './Icon';

type Tab = 'summary' | 'chat' | 'history' | 'goals' | 'membership' | 'journal';

export const MainDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  
  if (!currentUser) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryPanel setActiveTab={setActiveTab} />;
      case 'chat':
        return <ChatInterface />;
      case 'history':
        return <HistoryPanel />;
      case 'goals':
          return <GoalsPanel />;
      case 'membership':
          return <MembershipPanel />;
      case 'journal':
          return <VisualJournalPanel />;
      default:
        return <SummaryPanel setActiveTab={setActiveTab} />;
    }
  };

  const TabButton: React.FC<{
    tabName: Tab;
    iconName: string;
    label: string;
  }> = ({ tabName, iconName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded-t-lg ${
        activeTab === tabName
          ? 'border-b-2 border-primary text-primary bg-white'
          : 'text-gray-500 hover:text-primary'
      }`}
    >
      <Icon name={iconName} className="w-5 h-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-6">
      <main className="w-full lg:w-2/3">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <TabButton tabName="summary" iconName="summary" label="Mi Resumen" />
          <TabButton tabName="chat" iconName="chat" label="Chat con Caliope" />
          <TabButton tabName="journal" iconName="journal" label="Mi Diario Visual" />
          <TabButton tabName="history" iconName="history" label="Mi Historial" />
          <TabButton tabName="goals" iconName="target" label="Mis Metas" />
          <TabButton tabName="membership" iconName="crown" label="Membresía" />
        </div>
        <div className="mt-[-1px]">
         {renderTabContent()}
        </div>
      </main>
      <Sidebar />
    </div>
  );
};
