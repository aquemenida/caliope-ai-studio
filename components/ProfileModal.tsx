import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { FOCUS_AREAS } from '../constants';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, addNotification } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPreferences(currentUser.preferences.join(', '));
      setBio(currentUser.bio);
    }
  }, [currentUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name,
        email,
        preferences: preferences.split(',').map(p => p.trim()).filter(Boolean),
        bio
      });
      addNotification('Perfil actualizado correctamente', 'success');
      onClose();
    } catch (err: any) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-primary" htmlFor="profileName">Nombre</label>
          <input type="text" id="profileName" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-primary" htmlFor="profileEmail">Correo</label>
          <input type="email" id="profileEmail" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-primary" htmlFor="profilePrefs">Preferencias (separadas por comas)</label>
          <input type="text" id="profilePrefs" value={preferences} onChange={e => setPreferences(e.target.value)} placeholder="relajación, fitness..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-bold text-primary">Objetivo de bienestar</label>
          <div className="mt-1 p-3 bg-gray-100 rounded-md border">
            <p className="text-gray-700">Tu objetivo actual es: <span className="font-semibold">{FOCUS_AREAS.find(f => f.id === currentUser.goals)?.name || 'No definido'}</span></p>
            <p className="text-xs text-gray-500 mt-1">Para cambiar tu objetivo, por favor ve a la pestaña "Mis Metas" en el panel principal.</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-primary" htmlFor="profileBio">Biografía</label>
          <textarea id="profileBio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Cuéntanos sobre ti..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" rows={3}></textarea>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors disabled:bg-gray-400">
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </Modal>
  );
};