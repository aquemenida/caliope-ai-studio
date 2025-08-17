
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';
import { Icon } from './Icon';


declare global {
  interface Window {
    google?: any;
  }
}

export const Auth: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { loginWithGoogle, addNotification, startDemoMode } = useAuth();
  const googleButtonDiv = useRef<HTMLDivElement>(null);

  const handleGoogleSignIn = async (credential: string) => {
    try {
      await loginWithGoogle(credential);
      addNotification('Sesión iniciada con Google correctamente', 'success');
    } catch (err: any) {
      addNotification(err.message || 'Error al iniciar sesión con Google.', 'error');
    }
  };

  useEffect(() => {
    const initGoogleSignIn = () => {
        if (window.google?.accounts?.id && googleButtonDiv.current) {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            if (!clientId) {
                console.error("Google Client ID is missing.");
                addNotification("La configuración para el inicio de sesión con Google está incompleta.", "error");
                return true; // Stop polling
            }

            try {
                googleButtonDiv.current.innerHTML = ''; // Prevent duplicate buttons
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
                    text: 'signin_with',
                    width: '300px',
                    logo_alignment: 'left',
                });
            } catch (error) {
                console.error("Error initializing Google Sign-In", error);
                addNotification("No se pudo inicializar el inicio de sesión con Google.", "error");
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

        return () => clearInterval(intervalId);
    }
  }, []);


  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };
  
  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
      <Icon name="leaf" className="w-20 h-20 text-primary mb-4" />
      <h2 className="text-4xl font-bold text-primary mb-2">Bienvenido a Caliope</h2>
      <p className="text-gray-600 mb-6 text-lg">Tu guía personalizada de bienestar</p>
      <p className="max-w-md mx-auto text-gray-500 mb-8">
        Inicia sesión o crea una cuenta para comenzar tu viaje hacia un mejor bienestar,
        recibiendo recomendaciones curadas por IA.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={openLogin} className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors">
          Iniciar Sesión
        </button>
        <button onClick={openRegister} className="px-6 py-3 bg-secondary text-primary font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors">
          Crear Cuenta
        </button>
      </div>

       <div className="mt-4">
        <button onClick={startDemoMode} className="px-6 py-3 bg-white text-primary border border-primary font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors">
          Ver Demostración
        </button>
      </div>

      <div className="my-6 w-full max-w-xs flex items-center justify-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 flex-shrink text-sm text-gray-500">O</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div ref={googleButtonDiv} className="flex justify-center"></div>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSwitchToRegister={openRegister}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onSwitchToLogin={openLogin}
      />
    </div>
  );
};
