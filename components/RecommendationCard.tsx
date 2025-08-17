import React, { useState, useEffect } from 'react';
import { WellnessService, Recommendation } from '../types';
import { Icon } from './Icon';
import { useAuth } from '../context/AuthContext';

interface RecommendationCardProps {
  service: Recommendation;
  isAlreadyBooked: boolean;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Icon key={`full-${i}`} name="star" className="w-5 h-5 text-yellow-400" />
      ))}
      {/* Not implementing half-star for simplicity, but could be added */}
      {[...Array(emptyStars)].map((_, i) => (
        <Icon key={`empty-${i}`} name="star" className="w-5 h-5 text-gray-300" />
      ))}
    </div>
  );
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ service, isAlreadyBooked }) => {
  const { addFeedback, currentUser, addAppointment } = useAuth();
  const userFeedback = currentUser?.feedback[service.id];
  const [isBooked, setIsBooked] = useState(isAlreadyBooked);

  useEffect(() => {
    setIsBooked(isAlreadyBooked);
  }, [isAlreadyBooked]);

  const handleBooking = () => {
    if (!isBooked) {
        addAppointment(service.id, service.name);
        setIsBooked(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      <img src={service.image} alt={service.name} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-secondary-dark bg-secondary/30 px-2 py-1 rounded-full mb-2">{service.category}</span>
            <div className="text-2xl font-bold text-primary">{service.price}</div>
        </div>
        <h3 className="text-xl font-bold text-primary mt-1 mb-2">{service.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={service.rating} />
          <span className="text-sm text-gray-600">{service.rating.toFixed(1)}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 border-l-4 border-secondary pl-3">{service.reason}</p>
        <p className="text-gray-500 text-sm mb-4 flex-grow">{service.description}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
          <button 
            onClick={handleBooking}
            disabled={isBooked}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors disabled:bg-green-600 disabled:text-white disabled:cursor-not-allowed">
            {isBooked ? 'Reservado ✓' : 'Reservar Ahora'}
          </button>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => addFeedback(service.id, 'positive')}
                className={`p-2 rounded-full transition-colors ${userFeedback === 'positive' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-green-100 hover:text-green-600'}`}
                aria-label="Me gusta">
                <Icon name="thumb-up" className="w-5 h-5"/>
            </button>
             <button 
                onClick={() => addFeedback(service.id, 'negative')}
                className={`p-2 rounded-full transition-colors ${userFeedback === 'negative' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-red-100 hover:text-red-600'}`}
                aria-label="No me gusta">
                <Icon name="thumb-down" className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};