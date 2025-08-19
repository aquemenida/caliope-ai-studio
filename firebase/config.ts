import * as firebase from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// ¡IMPORTANTE! Esta es una configuración de ejemplo. Para usar la aplicación con tu propia
// base de datos, reemplaza estos valores con las credenciales de tu proyecto de Firebase.
const EXAMPLE_CONFIG = {
  apiKey: "AIzaSyBVg-12345EXAMPLE_CONFIG_ONLY",
  authDomain: "caliope-app-project.firebaseapp.com",
  projectId: "caliope-app-project",
  storageBucket: "caliope-app-project.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:fedcba0987654321fedcba"
};

// Se proporciona una configuración de ejemplo sintácticamente válida para permitir la inicialización.
// Para una funcionalidad completa, reemplaza esto con tus credenciales reales de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyA_SAMPLE_API_KEY_FOR_DEMO_12345",
  authDomain: "caliope-demo.firebaseapp.com",
  projectId: "caliope-demo",
  storageBucket: "caliope-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcd"
};

// La funcionalidad de Firebase se habilita solo si la apiKey ha sido modificada.
export const isConfigured = firebaseConfig.apiKey !== EXAMPLE_CONFIG.apiKey;

let app: firebase.FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;


if (isConfigured) {
    try {
        app = firebase.getApps().length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
    } catch (error) {
        console.error("Error al inicializar Firebase. Comprueba la configuración de tu proyecto:", error);
    }
} else {
    console.warn("Firebase no está configurado. La funcionalidad de autenticación y base de datos estará deshabilitada. Ingresa tus credenciales en firebase/config.ts");
}

// Exportar servicios de Firebase y el estado de configuración
export { auth, db, googleProvider };