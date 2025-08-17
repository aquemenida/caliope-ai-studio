
export interface WellnessService {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
  keywords: string[];
  rating: number;
  popularity: number;
}

export interface Recommendation extends WellnessService {
  reason: string;
}

export interface HistoryItem {
  date: string;
  preferences: string;
  recommendations: Recommendation[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Appointment {
  serviceId: number;
  serviceName: string;
  date: string; // ISO string
}

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash?: string;
  avatar: string;
  preferences: string[];
  goals: string;
  bio: string;
  level: number;
  experience: number;
  history: HistoryItem[];
  feedback: { [key: number]: 'positive' | 'negative' };
  achievements: string[];
  appointments: Appointment[];
  createdAt: string;
  membershipTier: 'free' | 'premium';
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text?: string;
  recommendations?: Recommendation[];
  quickReplies?: string[];
}