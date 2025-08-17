
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

declare global {
    interface Window {
      google?: any;
    }
  }

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, addNotification, loginWithGoogle } = useAuth();
  const googleButtonDiv = useRef<HTMLDivElement>(null);

  const handleGoogleSignIn = async (credential: string) => {
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      addNotification('Sesión iniciada con Google correctamente', 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const initGoogleSignIn = () => {
      if (window.google?.accounts?.id && googleButtonDiv.current) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.error("Google Client ID is missing.");
            setError("La configuración para el inicio de sesión con Google está incompleta.");
            return true; // Stop polling
        }

        googleButtonDiv.current.innerHTML = ''; // Evita duplicados
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => {
              if (response.credential) {
                handleGoogleSignIn(response.credential);
              }
            },
          });
          window.google.accounts.id.renderButton(googleButtonDiv.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            logo_alignment: 'left',
            width: '100%',
          });
        } catch (error) {
          console.error("Error initializing Google Sign-In", error);
          setError("No se pudo inicializar Google Sign-In.");
        }
        return true; // Initialized or failed, stop polling
      }
      return false; // Not ready yet
    };

    if (!initGoogleSignIn()) {
      const intervalId = setInterval(() => {
        if (initGoogleSignIn()) {
          clearInterval(intervalId);
        }
      }, 200);

      // Cleanup interval when modal closes or component unmounts
      return () => clearInterval(intervalId);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      addNotification('Sesión iniciada correctamente', 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
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
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
        >
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 flex-shrink text-xs text-gray-500">O</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        <div ref={googleButtonDiv} className="flex justify-center"></div>

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
