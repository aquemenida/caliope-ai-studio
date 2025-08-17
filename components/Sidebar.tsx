import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LEVEL_NAMES, ACHIEVEMENTS } from '../constants';
import { getDailyWellnessTip } from '../services/geminiService';

const ProgressBar: React.FC<{ progress: number, level: number }> = ({ progress, level }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-bold text-primary">Nivel {level} - {LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)]}</span>
        <span className="text-xs font-semibold text-gray-500">{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-secondary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

const AppointmentCard: React.FC<{ day: string, month: string, title: string, time: string }> = ({ day, month, title, time }) => (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0 w-14 h-14 bg-primary text-white rounded-lg flex flex-col items-center justify-center font-bold">
            <span className="text-xl leading-none">{day}</span>
            <span className="text-xs">{month}</span>
        </div>
        <div>
            <h4 className="font-bold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-500">{time}</p>
        </div>
    </div>
);


export const Sidebar: React.FC = () => {
    const { currentUser } = useAuth();
    const [tip, setTip] = useState('');
    const [tipLoading, setTipLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            const today = new Date().toISOString().split('T')[0];
            const cachedTipData = localStorage.getItem('dailyTip');
            if (cachedTipData) {
                try {
                    const { date, text } = JSON.parse(cachedTipData);
                    if (date === today && text) {
                        setTip(text);
                        setTipLoading(false);
                        return;
                    }
                } catch (e) {
                    localStorage.removeItem('dailyTip');
                }
            }

            try {
                const newTip = await getDailyWellnessTip();
                setTip(newTip);
                localStorage.setItem('dailyTip', JSON.stringify({ date: today, text: newTip }));
            } catch (error) {
                console.error("Failed to fetch daily tip:", error);
                setTip("Recuerda mantenerte hidratado durante todo el día."); // Fallback tip
            } finally {
                setTipLoading(false);
            }
        };

        fetchTip();
    }, []);

    if(!currentUser) return null;

    const progress = (currentUser.experience % 100);

    return (
        <aside className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-primary mb-4">Tu Progreso de Bienestar</h3>
                <ProgressBar progress={progress} level={currentUser.level} />
                 <p className="text-xs text-gray-500 mt-2">Sigue interactuando para subir de nivel.</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-primary mb-4">Próximas Citas</h3>
                <div className="space-y-3">
                    {currentUser.appointments && currentUser.appointments.length > 0 ? (
                        currentUser.appointments.map(app => {
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

            <div className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-primary mb-4">Logros</h3>
                {currentUser.achievements.length > 0 ? (
                    <div className="space-y-3">
                        {currentUser.achievements.map(achId => {
                            const achievement = ACHIEVEMENTS[achId];
                            if(!achievement) return null;
                            return (
                                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                    <span className="text-2xl">{achievement.icon}</span>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800">{achievement.name}</h4>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Completa acciones para desbloquear logros.</p>
                )}
            </div>

             <div className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-primary mb-4">Consejo del Día</h3>
                {tipLoading ? (
                    <p className="text-sm text-gray-500 animate-pulse">Cargando consejo...</p>
                ) : (
                    <p className="text-sm text-gray-600">{tip}</p>
                )}
            </div>
        </aside>
    );
};
