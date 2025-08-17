import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FOCUS_AREAS } from '../constants';

export const GoalsPanel: React.FC = () => {
    const { currentUser, updateProfile, addNotification } = useAuth();
    const currentGoal = currentUser?.goals;

    const handleSelectGoal = async (goalId: string) => {
        if (currentGoal === goalId) return;
        try {
            await updateProfile({ goals: goalId });
            addNotification('¡Tu meta principal ha sido actualizada!', 'success');
        } catch (error: any) {
            addNotification(error.message || 'No se pudo actualizar la meta.', 'error');
        }
    };

    return (
        <div className="bg-white rounded-b-lg rounded-r-lg shadow-md h-[80vh] flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-primary">Mis Metas de Bienestar</h2>
                <p className="text-sm text-gray-500">Selecciona tu área de enfoque principal. Caliope usará esto para personalizar aún más tus recomendaciones.</p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FOCUS_AREAS.map(area => {
                        const isSelected = currentGoal === area.id;
                        return (
                            <button
                                key={area.id}
                                onClick={() => handleSelectGoal(area.id)}
                                className={`relative p-6 rounded-lg shadow-lg text-left transition-all duration-300 transform hover:-translate-y-1 ${
                                    isSelected
                                        ? 'bg-primary text-white ring-4 ring-secondary'
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                                aria-pressed={isSelected}
                            >
                                <div className="text-4xl mb-3">{area.icon}</div>
                                <h3 className="text-lg font-bold mb-1">{area.name}</h3>
                                <p className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                                    {area.description}
                                </p>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-white text-primary rounded-full p-1 shadow">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
