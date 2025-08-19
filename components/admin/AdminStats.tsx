
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { WELLNESS_SERVICES } from '../../constants';
import { User } from '../../types';

interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
        <p className="text-3xl font-bold text-primary mt-2">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
);

const getMostPopularService = (users: User[]): string => {
    const serviceCounts: { [key: number]: number } = {};
    users.forEach(user => {
        user.appointments?.forEach(app => {
            serviceCounts[app.serviceId] = (serviceCounts[app.serviceId] || 0) + 1;
        });
    });

    if (Object.keys(serviceCounts).length === 0) return 'N/A';

    const mostPopularId = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0][0];
    const service = WELLNESS_SERVICES.find(s => s.id === parseInt(mostPopularId, 10));
    
    return service?.name || 'Desconocido';
};

export const AdminStats: React.FC = () => {
    const { users } = useAuth();

    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.membershipTier === 'premium').length;
    const totalAppointments = users.reduce((acc, user) => acc + (user.appointments?.length || 0), 0);
    const mostPopularService = getMostPopularService(users);
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Dashboard de Administrador</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Usuarios Totales"
                    value={totalUsers}
                    description="Número total de cuentas registradas"
                />
                <StatCard 
                    title="Miembros Premium"
                    value={premiumUsers}
                    description={`${((premiumUsers / totalUsers) * 100).toFixed(1)}% de los usuarios`}
                />
                <StatCard 
                    title="Citas Reservadas"
                    value={totalAppointments}
                    description="Total de servicios agendados"
                />
                <StatCard 
                    title="Servicio Más Popular"
                    value={mostPopularService}
                    description="Basado en el número de reservas"
                />
            </div>
        </div>
    );
};
