import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { isConfigured } from '../firebase/config';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, addNotification } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
        setError('La integración con Firebase no está configurada.');
        return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      addNotification('Cuenta creada correctamente. Ahora puedes iniciar sesión.', 'success');
      onSwitchToLogin();
    } catch (err: any) {
      setError(err.message || 'Error al registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Cuenta">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="registerName">Nombre Completo</label>
          <input
            type="text"
            id="registerName"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="registerEmail">Correo Electrónico</label>
          <input
            type="email"
            id="registerEmail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="registerPassword">Contraseña</label>
          <input
            type="password"
            id="registerPassword"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="registerConfirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="registerConfirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !isConfigured}
          title={!isConfigured ? 'La integración con Firebase no está configurada.' : ''}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando...' : 'Crear Cuenta'}
        </button>
        <div className="text-sm text-center">
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={onSwitchToLogin} className="font-medium text-primary hover:text-primary-dark">
            Inicia sesión
          </button>
        </div>
      </form>
    </Modal>
  );
};