
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDailyWellnessTip, getProactiveSuggestion } from '../services/geminiService';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';

const AppointmentCard: React.FC<{ day: string, month: string, title: string, time: string }> = ({ day, month, title, time }) => (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex-shrink-0 w-14 h-14 bg-secondary text-white rounded-lg flex flex-col items-center justify-center font-bold">
            <span className="text-xl leading-none">{day}</span>
            <span className="text-xs">{month}</span>
        </div>
        <div>
            <h4 className="font-bold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-500">{time}</p>
        </div>
    </div>
);

export const SummaryPanel: React.FC<{ setActiveTab: (tab: any) => void }> = ({ setActiveTab }) => {
    const { currentUser } = useAuth();
    const [tip, setTip] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummaryData = async () => {
            if (!currentUser) return;
            setIsLoading(true);
            try {
                const [dailyTip, proactiveSuggestion] = await Promise.all([
                    getDailyWellnessTip(),
                    getProactiveSuggestion(currentUser)
                ]);
                setTip(dailyTip);
                setSuggestion(proactiveSuggestion);
            } catch (error) {
                console.error("Failed to fetch summary data:", error);
                setTip("Recuerda sonreír, ¡es un gran paso para tu bienestar!");
                setSuggestion("Explora las diferentes secciones para encontrar lo que necesitas hoy.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummaryData();
    }, [currentUser]);

    if (!currentUser) return null;

    if (isLoading) {
        return (
            <div className="bg-white rounded-b-lg rounded-r-lg shadow-md p-8 h-[80vh] flex flex-col justify-center items-center">
                <LoadingSpinner text="Preparando tu resumen..." />
            </div>
        )
    }

    return (
        <div className="bg-white rounded-b-lg rounded-r-lg shadow-md h-[80vh] flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-2xl font-bold text-primary">¡Hola, {currentUser.name}!</h2>
                <p className="text-sm text-gray-500">Aquí tienes tu resumen de bienestar para hoy.</p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-6">
                
                {/* Proactive Suggestion */}
                <div className="p-5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg">
                    <div className="flex items-start gap-4">
                        <Icon name="brain" className="w-8 h-8 flex-shrink-0 text-secondary" />
                        <div>
                            <h3 className="font-bold text-lg mb-1">Sugerencia de Caliope</h3>
                            <p className="text-gray-200 text-sm">{suggestion}</p>
                        </div>
                    </div>
                </div>

                {/* Onboarding: Set Goal */}
                {!currentUser.goals && (
                    <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold">¡Define tu camino!</h4>
                                <p className="text-sm">Establece una meta principal para recibir recomendaciones más precisas.</p>
                            </div>
                            <button 
                                onClick={() => setActiveTab('goals')}
                                className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors"
                            >
                                Elegir Meta
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Daily Tip */}
                    <div className="bg-white p-5 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-primary mb-3">Consejo del Día</h3>
                        <p className="text-gray-600 text-sm">{tip}</p>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white p-5 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-primary mb-4">Próximas Citas</h3>
                        <div className="space-y-3">
                            {currentUser.appointments && currentUser.appointments.length > 0 ? (
                                currentUser.appointments.slice(0, 2).map(app => {
                                    const date = new Date(app.date);
                                    const day = date.getDate().toString();
                                    const month = date.toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
                                    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                    return <AppointmentCard key={app.date} day={day} month={month} title={app.serviceName} time={time} />;
                                })
                            ) : (
                                <p className="text-sm text-gray-500">No tienes citas próximas.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
