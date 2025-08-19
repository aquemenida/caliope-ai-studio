import { WellnessService, Achievement, User } from './types';

export const WELLNESS_SERVICES: WellnessService[] = [
    {
        id: 1,
        name: 'Masaje Facial Rejuvenecedor',
        category: 'Estética facial',
        description: 'Tratamiento facial que mejora la circulación y rejuvenece la piel.',
        price: '$85',
        image: 'https://picsum.photos/seed/facial/400/300',
        keywords: ['facial', 'piel', 'rejuvenecimiento', 'belleza', 'apariencia', 'relajacion'],
        rating: 4.7,
        popularity: 85
    },
    {
        id: 2,
        name: 'Sesión de Meditación Guiada',
        category: 'Relajación',
        description: 'Sesión de 30 minutos para reducir el estrés y encontrar la calma interior.',
        price: '$45',
        image: 'https://picsum.photos/seed/meditation/400/300',
        keywords: ['meditación', 'relajación', 'estrés', 'ansiedad', 'mente', 'calma', 'mindfulness'],
        rating: 4.5,
        popularity: 78
    },
    {
        id: 3,
        name: 'Entrenamiento Personal Funcional',
        category: 'Fitness',
        description: 'Sesión de entrenamiento personalizado para mejorar tu condición física.',
        price: '$70',
        image: 'https://picsum.photos/seed/fitness/400/300',
        keywords: ['ejercicio', 'fitness', 'entrenamiento', 'personal', 'cuerpo', 'salud', 'energía', 'fuerza'],
        rating: 4.8,
        popularity: 92
    },
    {
        id: 4,
        name: 'Consulta Nutricional',
        category: 'Nutrición',
        description: 'Evaluación nutricional completa con plan de alimentación personalizado.',
        price: '$90',
        image: 'https://picsum.photos/seed/nutrition/400/300',
        keywords: ['nutrición', 'dieta', 'alimentación', 'salud', 'peso', 'hábitos', 'comida'],
        rating: 4.6,
        popularity: 80
    },
    {
        id: 5,
        name: 'Terapia de Acupresión',
        category: 'Salud mental',
        description: 'Técnica de presión en puntos específicos para aliviar tensiones emocionales.',
        price: '$65',
        image: 'https://picsum.photos/seed/acupressure/400/300',
        keywords: ['acupresión', 'salud mental', 'emociones', 'estrés', 'equilibrio', 'terapia alternativa'],
        rating: 4.3,
        popularity: 65
    },
    {
        id: 6,
        name: 'Masaje con Piedras Calientes',
        category: 'Masajes',
        description: 'Masaje terapéutico con piedras volcánicas calientes para relajar los músculos.',
        price: '$95',
        image: 'https://picsum.photos/seed/hotstones/400/300',
        keywords: ['masaje', 'piedras', 'calientes', 'relajación', 'músculos', 'dolor', 'terapia'],
        rating: 4.9,
        popularity: 88
    },
    {
        id: 7,
        name: 'Yoga Terapéutico',
        category: 'Fitness',
        description: 'Sesión de yoga adaptada para aliviar dolores crónicos y mejorar la flexibilidad.',
        price: '$60',
        image: 'https://picsum.photos/seed/yoga/400/300',
        keywords: ['yoga', 'terapéutico', 'dolor', 'flexibilidad', 'equilibrio', 'postura', 'fitness'],
        rating: 4.7,
        popularity: 75
    },
    {
        id: 8,
        name: 'Tratamiento de Hidroterapia',
        category: 'Relajación',
        description: 'Baño terapéutico con sales minerales y aceites esenciales para detoxificar el cuerpo.',
        price: '$75',
        image: 'https://picsum.photos/seed/hydrotherapy/400/300',
        keywords: ['hidroterapia', 'agua', 'sales', 'detox', 'relajación', 'minerales', 'spa'],
        rating: 4.4,
        popularity: 70
    },
    {
        id: 9,
        name: 'Coaching de Bienestar',
        category: 'Salud mental',
        description: 'Sesión individual con un coach para definir y alcanzar tus objetivos de bienestar.',
        price: '$120',
        image: 'https://picsum.photos/seed/coaching/400/300',
        keywords: ['coaching', 'bienestar', 'objetivos', 'salud mental', 'crecimiento', 'desarrollo personal'],
        rating: 4.8,
        popularity: 82
    },
    {
        id: 10,
        name: 'Masaje Descontracturante',
        category: 'Masajes',
        description: 'Masaje profundo para liberar tensiones musculares y mejorar la circulación.',
        price: '$80',
        image: 'https://picsum.photos/seed/deepmassage/400/300',
        keywords: ['masaje', 'descontracturante', 'músculos', 'tensión', 'circulación', 'dolor'],
        rating: 4.6,
        popularity: 85
    }
];

export const ACHIEVEMENTS: { [key: string]: Achievement } = {
    'first-use': { id: 'first-use', name: 'Primer Paso', description: 'Obtuviste tu primera recomendación', icon: '🎯' },
    'level-5': { id: 'level-5', name: 'Bienestar Intermedio', description: 'Alcanzaste el nivel 5', icon: '🏆' },
    'feedback-master': { id: 'feedback-master', name: 'Maestro de la Retroalimentación', description: 'Diste retroalimentación sobre 5 servicios', icon: '👍' }
};

export const LEVEL_NAMES = [
    'Principiante', 'Explorador', 'Practicante', 'Entusiasta', 'Experto',
    'Maestro', 'Gurú', 'Mentor', 'Sabio', 'Iluminado'
];

export const FOCUS_AREAS = [
    { id: 'reducir-estres', name: 'Reducir Estrés', description: 'Encuentra calma y serenidad en tu día a día.', icon: '🧘' },
    { id: 'mejorar-fitness', name: 'Mejorar Fitness', description: 'Aumenta tu energía, fuerza y condición física.', icon: '🏋️' },
    { id: 'mejorar-salud', name: 'Mejorar Salud General', description: 'Adopta hábitos más saludables para un bienestar integral.', icon: '🥗' },
    { id: 'aumentar-energia', name: 'Aumentar Energía', description: 'Combate la fatiga y siéntete más vital.', icon: '⚡️' },
    { id: 'salud-mental', name: 'Salud Mental', description: 'Fortalece tu bienestar emocional y mental.', icon: '🧠' },
];

const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(Math.floor(Math.random() * 8) + 9, Math.random() > 0.5 ? 30 : 0, 0, 0);
    return date.toISOString();
};


export const DEMO_USER: User = {
    id: 'demo-user-999',
    name: 'Usuario Demo',
    email: 'demo@caliope.app',
    avatar: 'D',
    preferences: ['relajación', 'fitness'],
    goals: 'reducir-estres',
    bio: 'Explorando formas de mejorar mi bienestar y mantenerme activo.',
    level: 3,
    experience: 240,
    history: [
        {
            date: new Date(Date.now() - 86400000 * 2).toISOString(),
            preferences: 'me siento algo cansado',
            recommendations: [
                { ...WELLNESS_SERVICES[2], reason: 'El entrenamiento funcional te ayudará a recargar baterías y sentirte con más vitalidad.' },
                { ...WELLNESS_SERVICES[7], reason: 'La hidroterapia es excelente para un detox corporal que renueva tus energías.' },
            ]
        }
    ],
    feedback: {
        3: 'positive'
    },
    achievements: ['first-use'],
    appointments: [
        {
            serviceId: 6,
            serviceName: 'Yoga Terapéutico',
            date: getFutureDate(5),
        },
        {
            serviceId: 9,
            serviceName: 'Masaje Descontracturante',
            date: getFutureDate(12),
        }
    ],
    journal: [],
    createdAt: new Date().toISOString(),
    membershipTier: 'premium'
};


export const MEMBERSHIP_FEATURES = {
    free: [
        "Recomendaciones personalizadas por IA",
        "Acceso a todos los servicios de bienestar",
        "Sistema de niveles y logros",
        "Historial de las últimas 5 consultas",
    ],
    premium: [
        "Todas las funciones del plan gratuito",
        "IA con rol de Coach proactivo y avanzado",
        "Historial de consultas ilimitado",
        "Reportes de progreso semanales (próximamente)",
        "Soporte prioritario",
        "Insignia de perfil exclusiva"
    ]
};