import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { isConfigured } from '../firebase/config';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const GoogleButton: React.FC<{ onClick: () => void, disabled: boolean }> = ({ onClick, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={!isConfigured ? 'La integración con Google no está configurada.' : 'Continuar con Google'}
        className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="M6.306 14.691c-1.229 2.508-1.928 5.295-1.928 8.309s.7 5.801 1.928 8.309l7.971-6.191c-.434-1.393-.684-2.888-.684-4.418s.25-3.025.684-4.418l-7.971-6.191z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-7.971C29.211 31.91 26.715 33 24 33c-5.222 0-9.613-3.208-11.284-7.618l-7.971 6.191C8.136 39.023 15.461 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        Continuar con Google
    </button>
);


export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, addNotification, loginWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      addNotification('Sesión iniciada con Google correctamente', 'success');
      onClose();
    } catch (err: any) {
      const errorCode = err.code;
      if (errorCode !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Error al iniciar sesión con Google.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
        setError('La integración con Firebase no está configurada.');
        return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      addNotification('Sesión iniciada correctamente', 'success');
      onClose();
    } catch (err: any) {
      setError('Correo electrónico o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Iniciar Sesión">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="loginEmail">Correo Electrónico</label>
          <input
            type="email"
            id="loginEmail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="loginPassword">Contraseña</label>
          <input
            type="password"
            id="loginPassword"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
        
        <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 flex-shrink text-xs text-gray-500">O</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        <GoogleButton onClick={handleGoogleSignIn} disabled={loading || !isConfigured} />

        <div className="text-sm text-center">
          ¿No tienes cuenta?{' '}
          <button type="button" onClick={onSwitchToRegister} className="font-medium text-primary hover:text-primary-dark">
            Regístrate
          </button>
        </div>
      </form>
    </Modal>
  );
};