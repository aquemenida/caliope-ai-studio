import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, Recommendation, Notification, NotificationType, Appointment, VisualJournalEntry } from '../types';
import { ACHIEVEMENTS, DEMO_USER } from '../constants';
import { auth, db, googleProvider } from '../firebase/config';
import { 
    onAuthStateChanged, 
    setPersistence, 
    inMemoryPersistence, 
    User as FirebaseUser, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    signOut 
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    arrayUnion, 
    collection, 
    getDocs 
} from 'firebase/firestore';


interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  loading: boolean;
  users: User[]; // For admin panel
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addFeedback: (serviceId: number, feedback: 'positive' | 'negative') => void;
  addHistory: (preferences: string, recommendations: Recommendation[]) => void;
  addAppointment: (serviceId: number, serviceName: string) => void;
  addJournalEntry: (entryData: { imageUrl: string; userText: string; aiAnalysis: string; }) => void;
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType) => void;
  loginWithGoogle: () => Promise<void>;
  addExperiencePoints: (amount: number) => void;
  startDemoMode: () => void;
  upgradeToPremium: () => void;
  fetchAllUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createNewUserDocument = async (firebaseUser: FirebaseUser, additionalData: { name: string, avatar: string }): Promise<User> => {
    if (!db) throw new Error("La base de datos no está configurada.");
    const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: additionalData.name,
        avatar: additionalData.avatar,
        preferences: [],
        goals: '',
        bio: '',
        level: 1,
        experience: 0,
        history: [],
        feedback: {},
        achievements: [],
        appointments: [],
        journal: [],
        createdAt: new Date().toISOString(),
        membershipTier: 'free',
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    return newUser;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [users, setUsers] = useState<User[]>([]); // For admin

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const newNotification: Notification = { id: Date.now(), message, type };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (!auth || !db) {
        setLoading(false);
        return;
    }

    let unsubscribe: () => void;

    // Set in-memory persistence to avoid issues in environments with restricted storage.
    setPersistence(auth, inMemoryPersistence)
      .then(() => {
        // Now that persistence is set, attach the auth state change listener.
        unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && !isDemoMode) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setCurrentUser(userSnap.data() as User);
                } else {
                    const newUser = await createNewUserDocument(user, { name: user.displayName || user.email || 'Nuevo Usuario', avatar: user.photoURL || (user.displayName || 'U').charAt(0).toUpperCase() });
                    setCurrentUser(newUser);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error);
        addNotification("No se pudo inicializar la sesión. La autenticación podría no funcionar correctamente.", 'error');
        setLoading(false);
      });

    // Return the cleanup function
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [isDemoMode, addNotification]);


  const addExperience = useCallback(async (user: User, amount: number): Promise<void> => {
    if (isDemoMode) {
        const newExperience = user.experience + amount;
        const newLevel = Math.floor(newExperience / 100) + 1;
        setCurrentUser(prev => prev ? {...prev, experience: newExperience, level: newLevel} : null);
        return;
    };
    
    if (!db) return; // Salir si la base de datos no está configurada

    const userRef = doc(db, 'users', user.id);
    const newExperience = user.experience + amount;
    const newLevel = Math.floor(newExperience / 100) + 1;
    let newAchievements = [...user.achievements];

    if (newLevel > user.level && newLevel >= 5 && !user.achievements.includes('level-5')) {
        newAchievements.push('level-5');
        addNotification(`¡Nuevo Logro: ${ACHIEVEMENTS['level-5'].name}!`, 'info');
    }
    if (Object.keys(user.feedback).length >= 4 && !user.achievements.includes('feedback-master')) {
        newAchievements.push('feedback-master');
        addNotification(`¡Nuevo Logro: ${ACHIEVEMENTS['feedback-master'].name}!`, 'info');
    }
    if (user.history.length >= 0 && !user.achievements.includes('first-use')) {
        newAchievements.push('first-use');
        addNotification(`¡Nuevo Logro: ${ACHIEVEMENTS['first-use'].name}!`, 'info');
    }
    
    await updateDoc(userRef, {
        experience: newExperience,
        level: newLevel,
        achievements: newAchievements
    });
    setCurrentUser(prev => prev ? { ...prev, experience: newExperience, level: newLevel, achievements: newAchievements } : null);

  }, [addNotification, isDemoMode]);
  
  const addExperiencePoints = (amount: number) => {
    if (!currentUser) return;
    addExperience(currentUser, amount);
    addNotification(`+${amount} EXP añadido.`, 'info');
  };


  const register = async (name: string, email: string, password: string): Promise<void> => {
    if (!auth || !db) {
        addNotification('El servicio de autenticación no está disponible.', 'error');
        throw new Error('Firebase no configurado');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    if (!user) throw new Error("No se pudo crear el usuario.");
    await createNewUserDocument(user, { name, avatar: name.charAt(0).toUpperCase() });
  };

  const login = async (email: string, password: string): Promise<void> => {
    if (!auth) {
        addNotification('El servicio de autenticación no está disponible.', 'error');
        throw new Error('Firebase no configurado');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const loginWithGoogle = async (): Promise<void> => {
    if (!auth || !googleProvider || !db) {
        addNotification('El inicio de sesión con Google no está disponible.', 'error');
        throw new Error('Firebase no configurado');
    }
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (!user) throw new Error("Inicio de sesión con Google fallido.");
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await createNewUserDocument(user, { name: user.displayName || user.email!, avatar: user.photoURL || user.displayName?.charAt(0) || 'G' });
    }
  };

  const startDemoMode = () => {
    if (auth) signOut(auth);
    const demoUserCopy = JSON.parse(JSON.stringify(DEMO_USER));
    setCurrentUser(demoUserCopy);
    setIsDemoMode(true);
    setLoading(false);
    addNotification('Has entrado en el modo de demostración.', 'info');
  };

  const logout = async () => {
    if(isDemoMode){
        setIsDemoMode(false);
        setCurrentUser(null);
    } else if (auth) {
        await signOut(auth);
    }
  };
  
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!currentUser) throw new Error("No hay usuario autenticado.");
    if (isDemoMode) {
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        return;
    }
    
    if (!db) {
        addNotification('No se pudo actualizar el perfil. La base de datos no está disponible.', 'error');
        return;
    }
    const userRef = doc(db, 'users', currentUser.id);
    await updateDoc(userRef, updates);
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const addFeedback = async (serviceId: number, feedback: 'positive' | 'negative') => {
    if (!currentUser) return;
    await addExperience(currentUser, 5);

    if (isDemoMode) {
        setCurrentUser(prev => prev ? {...prev, feedback: {...prev.feedback, [serviceId]: feedback}} : null);
        addNotification('¡Gracias por tu retroalimentación!', 'success');
        return;
    }
    
    if (!db) {
        addNotification('No se pudo guardar la retroalimentación.', 'error');
        return;
    }
    const userRef = doc(db, 'users', currentUser.id);
    await updateDoc(userRef, {
        [`feedback.${serviceId}`]: feedback,
    });
    addNotification('¡Gracias por tu retroalimentación!', 'success');
  };

  const addHistory = async (preferences: string, recommendations: Recommendation[]) => {
    if (!currentUser || !db) return;
    await addExperience(currentUser, 10);
    const historyItem = { date: new Date().toISOString(), preferences, recommendations };
    
    if (isDemoMode) {
        setCurrentUser(prev => prev ? {...prev, history: [historyItem, ...prev.history]} : null);
        return;
    }
    
    const userRef = doc(db, 'users', currentUser.id);
    await updateDoc(userRef, {
        history: arrayUnion(historyItem)
    });
  };

  const addAppointment = async (serviceId: number, serviceName: string) => {
    if (!currentUser || !db) return;

    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7);
    appointmentDate.setHours(Math.floor(Math.random() * 8) + 9, Math.random() > 0.5 ? 30 : 0, 0, 0);

    const newAppointment: Appointment = {
        serviceId,
        serviceName,
        date: appointmentDate.toISOString(),
    };
    
    if (isDemoMode) {
        setCurrentUser(prev => prev ? {...prev, appointments: [...prev.appointments, newAppointment]} : null);
        addNotification(`Cita para "${serviceName}" reservada con éxito.`, 'success');
        return;
    }

    if (!db) {
        addNotification('No se pudo agendar la cita.', 'error');
        return;
    }
    const userRef = doc(db, 'users', currentUser.id);
    await updateDoc(userRef, {
        appointments: arrayUnion(newAppointment)
    });
    addNotification(`Cita para "${serviceName}" reservada con éxito.`, 'success');
  };
  
  const upgradeToPremium = async () => {
    if (!currentUser) return;
     if (isDemoMode) {
        setCurrentUser(prev => prev ? { ...prev, membershipTier: 'premium' } : null);
        addNotification('¡Felicidades! Has actualizado a Caliope Premium.', 'success');
        return;
    }
    if (!db) {
        addNotification('No se pudo actualizar la membresía.', 'error');
        return;
    }
    const userRef = doc(db, 'users', currentUser.id);
    await updateDoc(userRef, { membershipTier: 'premium' });
    addNotification('¡Felicidades! Has actualizado a Caliope Premium.', 'success');
  };
  
  const addJournalEntry = async (entryData: { imageUrl: string; userText: string; aiAnalysis: string; }) => {
    if (!currentUser || !db) return;
    await addExperience(currentUser, 15);
    const newEntry: VisualJournalEntry = {
        id: `journal_${Date.now()}`,
        date: new Date().toISOString(),
        ...entryData
    };
    
    if (isDemoMode) {
        setCurrentUser(prev => prev ? {...prev, journal: [newEntry, ...prev.journal]} : null);
        addNotification('Tu diario ha sido actualizado.', 'success');
        return;
    }

    if (!db) {
        addNotification('No se pudo guardar la entrada del diario.', 'error');
        return;
    }
    const userRef = doc(db, 'users', currentUser.id);
    await updateDoc(userRef, {
        journal: arrayUnion(newEntry)
    });
    addNotification('Tu diario ha sido actualizado.', 'success');
  };

  const fetchAllUsers = async () => {
    if (currentUser?.email !== 'admin@caliope.app' || !db) return;
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
    const usersList = querySnapshot.docs.map(doc => doc.data() as User);
    setUsers(usersList);
  };


  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, isDemoMode, loading, users, login, register, logout, updateProfile, addFeedback, addHistory, addJournalEntry, notifications, addNotification, loginWithGoogle, addAppointment, addExperiencePoints, startDemoMode, upgradeToPremium, fetchAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
