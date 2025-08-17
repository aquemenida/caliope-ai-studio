import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, Recommendation, Achievement, Notification, NotificationType, Appointment } from '../types';
import { ACHIEVEMENTS, DEMO_USER } from '../constants';

// --- Helper Functions ---
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

const decodeJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error("Error decoding JWT", e);
      return null;
    }
  };

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addFeedback: (serviceId: number, feedback: 'positive' | 'negative') => void;
  addHistory: (preferences: string, recommendations: Recommendation[]) => void;
  addAppointment: (serviceId: number, serviceName: string) => void;
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType) => void;
  loginWithGoogle: (credential: string) => Promise<void>;
  addExperiencePoints: (amount: number) => void;
  startDemoMode: () => void;
  upgradeToPremium: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('caliopeUsers');
      const storedCurrentUser = localStorage.getItem('caliopeCurrentUser');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
  }, []);

  const saveUsers = useCallback((updatedUsers: User[]) => {
    if (isDemoMode) return;
    setUsers(updatedUsers);
    localStorage.setItem('caliopeUsers', JSON.stringify(updatedUsers));
  }, [isDemoMode]);

  const saveCurrentUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    if (isDemoMode) return;

    if (user) {
        localStorage.setItem('caliopeCurrentUser', JSON.stringify(user));
        const updatedUsers = users.map(u => u.id === user.id ? user : u);
        // Ensure the user exists in the list before saving
        if (!updatedUsers.find(u => u.id === user.id)) {
            updatedUsers.push(user);
        }
        saveUsers(updatedUsers);
    } else {
        localStorage.removeItem('caliopeCurrentUser');
    }
  }, [users, saveUsers, isDemoMode]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const newNotification: Notification = { id: Date.now(), message, type };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const addExperience = useCallback((user: User, amount: number): User => {
    const newExperience = user.experience + amount;
    const newLevel = Math.floor(newExperience / 100) + 1;
    let newAchievements = [...user.achievements];

    if (newLevel > user.level) {
        if(newLevel >= 5 && !user.achievements.includes('level-5')) {
            newAchievements.push('level-5');
            addNotification(`¡Nuevo Logro: ${ACHIEVEMENTS['level-5'].name}!`, 'info');
        }
    }

    if (Object.keys(user.feedback).length >= 5 && !user.achievements.includes('feedback-master')) {
        newAchievements.push('feedback-master');
        addNotification(`¡Nuevo Logro: ${ACHIEVEMENTS['feedback-master'].name}!`, 'info');
    }

    if (user.history.length >= 1 && !user.achievements.includes('first-use')) {
        newAchievements.push('first-use');
        addNotification(`¡Nuevo Logro: ${ACHIEVEMENTS['first-use'].name}!`, 'info');
    }

    return { ...user, experience: newExperience, level: newLevel, achievements: newAchievements };
  }, [addNotification]);
  
  const addExperiencePoints = (amount: number) => {
    if (!currentUser) return;
    const userWithExp = addExperience(currentUser, amount);
    saveCurrentUser(userWithExp);
    addNotification(`+${amount} EXP añadido.`, 'info');
  };


  const register = async (name: string, email: string, password: string): Promise<void> => {
    if (users.find(user => user.email === email)) {
      throw new Error('El correo electrónico ya está registrado.');
    }
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      passwordHash: hashPassword(password),
      avatar: name.charAt(0).toUpperCase(),
      preferences: [],
      goals: '',
      bio: '',
      level: 1,
      experience: 0,
      history: [],
      feedback: {},
      achievements: [],
      appointments: [],
      createdAt: new Date().toISOString(),
      membershipTier: 'free',
    };
    saveUsers([...users, newUser]);
  };

  const login = async (email: string, password: string): Promise<void> => {
    const user = users.find(u => u.email === email);
    if (!user || !user.passwordHash || user.passwordHash !== hashPassword(password)) {
      throw new Error('Correo electrónico o contraseña incorrectos.');
    }
    saveCurrentUser(user);
  };
  
  const loginWithGoogle = async (credential: string): Promise<void> => {
    const payload = decodeJwt(credential);
    if (!payload) {
        throw new Error('Credencial de Google inválida.');
    }
    const { email, name, picture } = payload;
    const existingUser = users.find(u => u.email === email);

    if(existingUser) {
        const updatedUser = { ...existingUser, name, avatar: picture || name.charAt(0).toUpperCase() };
        saveCurrentUser(updatedUser);
    } else {
        const newUser: User = {
            id: Date.now(),
            name,
            email,
            avatar: picture || name.charAt(0).toUpperCase(),
            preferences: [],
            goals: '',
            bio: '',
            level: 1,
            experience: 0,
            history: [],
            feedback: {},
            achievements: [],
            appointments: [],
            createdAt: new Date().toISOString(),
            membershipTier: 'free',
        };
        const updatedUsers = [...users, newUser];
        saveUsers(updatedUsers);
        saveCurrentUser(newUser);
    }
  };

  const startDemoMode = () => {
    const demoUserCopy = JSON.parse(JSON.stringify(DEMO_USER));
    setCurrentUser(demoUserCopy);
    setIsDemoMode(true);
    addNotification('Has entrado en el modo de demostración.', 'info');
  };

  const logout = () => {
    saveCurrentUser(null);
    setIsDemoMode(false);
  };
  
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!currentUser) throw new Error("No hay usuario autenticado.");
    if(!isDemoMode && updates.email && updates.email !== currentUser.email && users.find(u => u.email === updates.email)){
        throw new Error("El correo electrónico ya está en uso.");
    }

    const updatedUser = { ...currentUser, ...updates, avatar: (updates.name || currentUser.name).charAt(0).toUpperCase() };
    saveCurrentUser(updatedUser);
  };

  const addFeedback = (serviceId: number, feedback: 'positive' | 'negative') => {
    if (!currentUser) return;
    const updatedUser = {
        ...currentUser,
        feedback: {
            ...currentUser.feedback,
            [serviceId]: feedback,
        }
    };
    const userWithExp = addExperience(updatedUser, 5);
    saveCurrentUser(userWithExp);
    addNotification('¡Gracias por tu retroalimentación!', 'success');
  };

  const addHistory = (preferences: string, recommendations: Recommendation[]) => {
    if (!currentUser) return;
    const historyItem = { date: new Date().toISOString(), preferences, recommendations };
    const updatedHistory = [historyItem, ...currentUser.history];
    
    const updatedUser = {
        ...currentUser,
        history: updatedHistory,
    };
    const userWithExp = addExperience(updatedUser, 10);
    saveCurrentUser(userWithExp);
  };

  const addAppointment = (serviceId: number, serviceName: string) => {
    if (!currentUser) return;

    // Schedule for 1 week from now at a random time between 9am and 5pm
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7);
    appointmentDate.setHours(Math.floor(Math.random() * 8) + 9, Math.random() > 0.5 ? 30 : 0, 0, 0);

    const newAppointment: Appointment = {
        serviceId,
        serviceName,
        date: appointmentDate.toISOString(),
    };

    const updatedUser: User = {
        ...currentUser,
        appointments: [...(currentUser.appointments || []), newAppointment].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
    
    saveCurrentUser(updatedUser);
    addNotification(`Cita para "${serviceName}" reservada con éxito.`, 'success');
  };
  
  const upgradeToPremium = () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, membershipTier: 'premium' as const };
    saveCurrentUser(updatedUser);
    addNotification('¡Felicidades! Has actualizado a Caliope Premium.', 'success');
  };


  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, isDemoMode, login, register, logout, updateProfile, addFeedback, addHistory, notifications, addNotification, loginWithGoogle, addAppointment, addExperiencePoints, startDemoMode, upgradeToPremium }}>
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