import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';
import { Icon } from './Icon';
import { isConfigured } from '../firebase/config';

const Feature: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
      <Icon name={icon} className="h-6 w-6" />
    </div>
    <div className="ml-4">
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-gray-600">{children}</p>
    </div>
  </div>
);

export const Auth: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, addNotification, startDemoMode } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      addNotification('Sesión iniciada con Google correctamente', 'success');
    } catch (err: any) {
      const errorCode = err.code;
      if (errorCode !== 'auth/popup-closed-by-user') {
        addNotification(err.message || 'Error al iniciar sesión con Google.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };
  
  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-secondary/10 p-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Info */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center mb-6">
              <Icon name="caliope-logo" className="w-full max-w-md h-auto" />
            </div>
            <p className="text-xl text-gray-700 mb-8 -mt-8">
              Descubre el equilibrio perfecto. Tu bienestar, curado por IA.
            </p>
            <div className="space-y-6">
              <Feature icon="brain" title="Recomendaciones Inteligentes">
                Recibe sugerencias de servicios de bienestar personalizadas para tus necesidades y estado de ánimo.
              </Feature>
              <Feature icon="chart-bar" title="Seguimiento de Progreso">
                Visualiza tu evolución, gana experiencia y desbloquea logros en tu camino hacia el bienestar.
              </Feature>
              <Feature icon="target" title="Metas Personalizadas">
                Establece tus objetivos y deja que Caliope te guíe con un plan de acción claro y motivador.
              </Feature>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center text-primary mb-2">Comienza tu viaje</h2>
            <p className="text-center text-gray-500 mb-6">Crea una cuenta o inicia sesión para continuar.</p>
            
            <div className="space-y-4">
              <button 
                onClick={openRegister} 
                className="w-full text-center px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-transform transform hover:scale-105"
              >
                Crear Cuenta Gratis
              </button>
              <button 
                onClick={handleGoogleSignIn} 
                disabled={loading || !isConfigured}
                title={!isConfigured ? 'La integración con Google no está configurada.' : 'Continuar con Google'}
                className="w-full flex justify-center items-center gap-3 px-6 py-3 border border-gray-300 rounded-lg shadow-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="M6.306 14.691c-1.229 2.508-1.928 5.295-1.928 8.309s.7 5.801 1.928 8.309l7.971-6.191c-.434-1.393-.684-2.888-.684-4.418s.25-3.025.684-4.418l-7.971-6.191z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-7.971C29.211 31.91 26.715 33 24 33c-5.222 0-9.613-3.208-11.284-7.618l-7.971 6.191C8.136 39.023 15.461 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                Continuar con Google
              </button>
            </div>
            
            <div className="text-center text-sm mt-6">
              <p className="text-gray-500">
                ¿Ya tienes una cuenta?{' '}
                <button onClick={openLogin} className="font-semibold text-primary hover:underline">
                  Inicia sesión
                </button>
              </p>
            </div>

            <div className="my-6 w-full flex items-center justify-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-4 flex-shrink text-xs text-gray-500">O</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button onClick={startDemoMode} className="w-full text-center text-sm font-semibold text-primary hover:underline">
              Explorar en Modo Demo
            </button>
          </div>
        </div>
      </div>

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