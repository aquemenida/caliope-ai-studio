import React from 'react';
import { Icon } from '../Icon';
import { AdminTab } from './AdminDashboard';

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    onLogout: () => void;
}

const NavLink: React.FC<{
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
            isActive
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
        }`}
    >
        <Icon name={icon} className="w-6 h-6 mr-3" />
        <span className="font-semibold">{label}</span>
    </button>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    return (
        <aside className="w-64 bg-white shadow-lg flex flex-col p-4">
            <div className="flex items-center gap-2 mb-8 p-2">
                <Icon name="caliope-mark" className="w-10 h-10" />
                <div>
                    <h2 className="text-xl font-bold text-primary">Caliope</h2>
                    <p className="text-xs text-gray-500 font-semibold">PANEL ADMIN</p>
                </div>
            </div>
            <nav className="flex-1 space-y-2">
                <NavLink icon="dashboard" label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <NavLink icon="users" label="Usuarios" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <NavLink icon="services" label="Servicios" isActive={activeTab === 'services'} onClick={() => setActiveTab('services')} />
            </nav>
            <div className="mt-auto">
                 <a href="/" className="flex items-center w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="font-semibold">Ir a la App</span>
                 </a>
                 <button onClick={onLogout} className="flex items-center w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className="font-semibold">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};