
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdminUserList: React.FC = () => {
    const { users } = useAuth();

    return (
        <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Gestión de Usuarios</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Correo Electrónico</th>
                                <th scope="col" className="px-6 py-3">Nivel</th>
                                <th scope="col" className="px-6 py-3">Membresía</th>
                                <th scope="col" className="px-6 py-3">Fecha de Registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                            {user.avatar}
                                        </div>
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.level}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.membershipTier === 'premium' 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.membershipTier.charAt(0).toUpperCase() + user.membershipTier.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
