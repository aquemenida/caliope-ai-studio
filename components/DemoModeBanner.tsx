import React from 'react';
import { useAuth } from '../context/AuthContext';

export const DemoModeBanner: React.FC = () => {
    const { logout } = useAuth();

    return (
        <div className="sticky top-0 bg-yellow-400 text-black text-center p-2 z-[101] shadow-md">
            <span className="font-semibold">Estás en Modo de Demostración.</span>
            <span className="hidden sm:inline"> Los cambios no se guardarán.</span>
            <button
                onClick={logout}
                className="ml-4 font-bold underline hover:text-gray-800"
            >
                Salir
            </button>
        </div>
    );
};
