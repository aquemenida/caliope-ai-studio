import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MEMBERSHIP_FEATURES } from '../constants';

const FeatureList: React.FC<{ features: string[] }> = ({ features }) => (
    <ul className="space-y-3">
        {features.map((feature, index) => (
            <li key={index} className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="text-gray-600">{feature}</span>
            </li>
        ))}
    </ul>
);

export const MembershipPanel: React.FC = () => {
    const { currentUser, upgradeToPremium } = useAuth();
    const isPremium = currentUser?.membershipTier === 'premium';

    const handleUpgrade = () => {
        if (!isPremium) {
            upgradeToPremium();
        }
    };

    return (
        <div className="bg-white rounded-b-lg rounded-r-lg shadow-md h-[80vh] flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-primary">Planes de Membresía</h2>
                <p className="text-sm text-gray-500">Elige el plan que mejor se adapte a tu viaje de bienestar.</p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Free Plan */}
                <div className={`p-6 rounded-lg shadow-lg border-2 ${!isPremium ? 'border-primary' : 'border-gray-200'} bg-white`}>
                    <h3 className="text-2xl font-bold text-primary">Plan Gratuito</h3>
                    <p className="text-lg font-semibold text-gray-500 mb-4">Para empezar</p>
                    <FeatureList features={MEMBERSHIP_FEATURES.free} />
                    {!isPremium && (
                        <div className="mt-6 text-center text-sm font-semibold bg-gray-100 text-primary p-2 rounded-md">
                            Tu Plan Actual
                        </div>
                    )}
                </div>

                {/* Premium Plan */}
                <div className={`p-6 rounded-lg shadow-lg border-2 ${isPremium ? 'border-primary' : 'border-gray-200'} bg-white`}>
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-primary">Plan Premium</h3>
                        <span className="text-xs font-bold text-yellow-500 bg-yellow-100 px-2 py-1 rounded-full">RECOMENDADO</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-500 mb-4">Desbloquea todo tu potencial</p>
                    <FeatureList features={MEMBERSHIP_FEATURES.premium} />
                    <div className="mt-6">
                        {isPremium ? (
                            <div className="text-center text-sm font-semibold bg-green-100 text-green-700 p-2 rounded-md">
                                ¡Gracias por ser Premium!
                            </div>
                        ) : (
                            <button
                                onClick={handleUpgrade}
                                className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                            >
                                Actualizar a Premium
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
