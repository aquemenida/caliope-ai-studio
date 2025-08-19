
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminStats } from './AdminStats';
import { AdminUserList } from './AdminUserList';
import { AdminServiceList } from './AdminServiceList';

export type AdminTab = 'dashboard' | 'users' | 'services';

export const AdminDashboard: React.FC = () => {
    const { currentUser, isAuthenticated, logout, fetchAllUsers } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    useEffect(() => {
        if(currentUser?.email === 'admin@caliope.app'){
            fetchAllUsers();
        }
    }, [currentUser, fetchAllUsers]);

    const isAdmin = currentUser?.email === 'admin@caliope.app';

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h2 className="text-3xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
                <p className="text-gray-600 mb-6">Debes iniciar sesión como administrador para ver esta página.</p>
                <a href="/" className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors">
                    Volver a la página principal
                </a>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminStats />;
            case 'users':
                return <AdminUserList />;
            case 'services':
                return <AdminServiceList />;
            default:
                return <AdminStats />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};