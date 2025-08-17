import React from 'react';
import { HistoryItem } from '../types';
import { RecommendationCard } from './RecommendationCard';
import { useAuth } from '../context/AuthContext';

export const HistoryPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const history = currentUser?.history || [];

  const isFreeTier = currentUser?.membershipTier === 'free';
  const historyLimit = 5;
  const displayedHistory = isFreeTier ? history.slice(0, historyLimit) : history;

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-b-lg rounded-r-lg shadow-md p-8 text-center h-[80vh] flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold text-primary">Tu historial está vacío</h3>
        <p className="text-gray-500 mt-2">
          Comienza una conversación con Caliope para recibir recomendaciones y tu historial aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-b-lg rounded-r-lg shadow-md h-[80vh] flex flex-col">
       <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-primary">Mi Historial de Bienestar</h2>
            <p className="text-sm text-gray-500">Un recuento de tus conversaciones y recomendaciones.</p>
        </div>
      <div className="flex-1 p-4 space-y-6 overflow-y-auto bg-gray-50">
        {isFreeTier && history.length > historyLimit && (
            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg">
                <h4 className="font-bold">Límite de Historial Alcanzado</h4>
                <p className="text-sm">Estás viendo tus últimas {historyLimit} consultas. Actualiza a Premium para ver tu historial completo.</p>
            </div>
        )}
        {displayedHistory.map((item) => (
          <div key={item.date} className="bg-white p-4 rounded-lg shadow">
            <div className="mb-4 pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">
                    {new Date(item.date).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
                <p className="text-sm text-gray-700 italic">
                    Tú preguntaste: <span className="font-semibold text-primary">"{item.preferences}"</span>
                </p>
            </div>
            
            <h4 className="text-md font-bold text-gray-800 mb-3">Caliope te recomendó:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.recommendations.map((service) => (
                <RecommendationCard
                  key={service.id}
                  service={service}
                  isAlreadyBooked={!!currentUser?.appointments?.some(a => a.serviceId === service.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};