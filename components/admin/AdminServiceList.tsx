
import React from 'react';
import { WELLNESS_SERVICES } from '../../constants';

export const AdminServiceList: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Gestión de Servicios</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Nombre del Servicio</th>
                                <th scope="col" className="px-6 py-3">Categoría</th>
                                <th scope="col" className="px-6 py-3">Precio</th>
                                <th scope="col" className="px-6 py-3">Rating</th>
                                <th scope="col" className="px-6 py-3">Popularidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {WELLNESS_SERVICES.map(service => (
                                <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{service.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                                    <td className="px-6 py-4">{service.category}</td>
                                    <td className="px-6 py-4">{service.price}</td>
                                    <td className="px-6 py-4">{service.rating.toFixed(1)}</td>
                                    <td className="px-6 py-4">{service.popularity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
