
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeJournalEntry } from '../services/geminiService';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const NewEntryModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { addJournalEntry, addNotification } = useAuth();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [userText, setUserText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                addNotification('La imagen es demasiado grande. Elige una de menos de 4MB.', 'error');
                return;
            }
            setImageFile(file);
            const dataUrl = await fileToDataUrl(file);
            setPreviewUrl(dataUrl);
        }
    };

    const resetForm = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setUserText('');
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || !userText.trim()) {
            addNotification('Por favor, añade una imagen y describe tu momento.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const imageUrl = await fileToDataUrl(imageFile);
            const base64Data = imageUrl.split(',')[1];
            const mimeType = imageFile.type;
            
            const aiAnalysis = await analyzeJournalEntry(base64Data, mimeType, userText);
            
            addJournalEntry({ imageUrl, userText, aiAnalysis });
            
            onClose();
            resetForm();
        } catch (error: any) {
            addNotification(error.message, 'error');
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => { onClose(); resetForm(); }} title="Añadir a mi Diario Visual">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-primary mb-2">Captura tu momento</label>
                    <div 
                        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:border-primary hover:text-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <div className="text-center">
                                <Icon name="camera" className="w-10 h-10 mx-auto mb-2" />
                                <p>Haz clic para subir una imagen</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-primary" htmlFor="userText">¿Qué sientes o piensas?</label>
                    <textarea 
                        id="userText" 
                        value={userText} 
                        onChange={e => setUserText(e.target.value)}
                        placeholder="Describe este momento..." 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
                        rows={3}
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                >
                    {isLoading ? <LoadingSpinner size={6} /> : 'Analizar y Guardar Momento'}
                </button>
            </form>
        </Modal>
    );
};

export const VisualJournalPanel: React.FC = () => {
    const { currentUser } = useAuth();
    const journalEntries = currentUser?.journal || [];
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="bg-white rounded-b-lg rounded-r-lg shadow-md h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-primary">Mi Diario Visual</h2>
                    <p className="text-sm text-gray-500">Un recuento visual de tu viaje de bienestar.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                >
                    <Icon name="plus" className="w-5 h-5"/>
                    <span>Nueva Entrada</span>
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {journalEntries.length === 0 ? (
                    <div className="text-center py-16">
                         <Icon name="journal" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-primary">Tu diario está esperando</h3>
                        <p className="text-gray-500 mt-2">Crea tu primera entrada para comenzar a visualizar tu progreso.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {journalEntries.map(entry => (
                            <div key={entry.id} className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in-up">
                                <img src={entry.imageUrl} alt="Entrada del diario" className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <p className="text-xs text-gray-500 mb-2">
                                        {new Date(entry.date).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">"{entry.userText}"</p>
                                    <div className="p-3 bg-secondary/20 rounded-lg">
                                        <p className="text-xs font-bold text-secondary-dark mb-1">Reflexión de Caliope</p>
                                        <p className="text-sm text-primary-dark italic">"{entry.aiAnalysis}"</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <NewEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};