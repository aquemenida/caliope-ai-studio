
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    onEditProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onEditProfile }) => {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <header className="flex justify-between items-center py-4 border-b border-gray-200">
      <div className="text-3xl font-bold text-primary">Caliope</div>
      {currentUser && (
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-3">
            <div className="flex flex-col items-end">
                <span className="font-medium text-gray-700 hidden sm:inline">{currentUser.name}</span>
                {currentUser.membershipTier === 'premium' && (
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-100 px-2 py-0.5 rounded-full hidden sm:inline">PREMIUM</span>
                )}
            </div>
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary font-bold text-xl">
              {currentUser.avatar}
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in-down">
              <button
                onClick={() => {
                  onEditProfile();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mi Perfil
              </button>
              <button
                onClick={() => {
                    logout();
                    setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};