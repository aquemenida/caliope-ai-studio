import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const TestModePanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser, logout, addExperiencePoints, addNotification } = useAuth();

    const handleClearData = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar TODOS los datos de usuario? Esta acción es irreversible.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleAddExp = () => {
        if (currentUser) {
            addExperiencePoints(100);
        } else {
            addNotification('Debes iniciar sesión para añadir EXP.', 'error');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg z-[100] font-mono text-sm font-bold animate-fade-in-up"
                aria-label="Abrir panel de pruebas"
            >
                Modo Pruebas
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl z-[100] w-80 border-2 border-yellow-500 animate-fade-in-up">
            <div className="flex justify-between items-center p-3 bg-yellow-500 text-black font-mono font-bold">
                <h3 className="text-sm">Panel de Pruebas</h3>
                <button onClick={() => setIsOpen(false)} className="text-black hover:text-gray-700 text-lg">&times;</button>
            </div>
            <div className="p-4 space-y-3">
                <button onClick={handleAddExp} className="w-full text-sm text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors">Añadir 100 EXP</button>
                <button onClick={() => logout()} className="w-full text-sm text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors">Forzar Cierre de Sesión</button>
                <button onClick={handleClearData} className="w-full text-sm text-left px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded font-semibold transition-colors">Limpiar Datos Locales</button>
                
                {currentUser && (
                    <div className="mt-4 pt-3 border-t">
                        <h4 className="font-semibold text-xs mb-2 text-gray-600">Datos del Usuario Actual:</h4>
                        <pre className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto font-mono">{JSON.stringify(currentUser, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};
