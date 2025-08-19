
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { User, WellnessService, Recommendation } from '../types';
import { WELLNESS_SERVICES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
let chat: Chat | null = null;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      description: "Lista de 2 a 3 servicios de bienestar recomendados.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.INTEGER,
            description: "El ID del servicio recomendado de la lista proporcionada."
          },
          reason: {
            type: Type.STRING,
            description: "Una breve razón personalizada (1-2 frases) de por qué este servicio es recomendado para el usuario."
          }
        },
        required: ["id", "reason"]
      }
    }
  },
  required: ["recommendations"]
};


export const initWellnessChat = (user: User) => {
    const personality = user.membershipTier === 'premium'
        ? `Eres Caliope, una Coach de Bienestar experta, proactiva y perspicaz. Tu objetivo es analizar al usuario para ser su guía a largo plazo. Sé analítica. Utiliza su historial y metas para seleccionar recomendaciones que no solo respondan a su estado actual, sino que también lo ayuden a avanzar hacia sus objetivos a largo plazo.`
        : `Eres Caliope, una experta curadora de bienestar amigable y empática. Tu tarea es analizar las necesidades del usuario para recomendar los servicios de bienestar más adecuados de una lista que te proporcionaré. Basa tu selección en un análisis empático y comprensivo de su mensaje.`;

    const systemInstruction = `
        ${personality}

        Reglas de Salida Estrictas:
        1. Tu ÚNICA salida debe ser un objeto JSON válido que se ajuste al esquema proporcionado.
        2. NO incluyas NINGÚN texto, explicación, o markdown (como \`\`\`json) fuera del objeto JSON. La respuesta debe ser JSON puro.
        
        Reglas de Lógica:
        1. Analiza el mensaje del usuario en el contexto de sus datos (metas, biografía) para entender su necesidad principal.
        2. Selecciona de 2 a 3 servicios de la lista proporcionada que mejor se ajusten a esa necesidad.
        3. Para cada servicio seleccionado, escribe una razón breve y personalizada en el campo "reason", explicando por qué es una buena opción para el usuario en este momento.
        4. Si no encuentras recomendaciones adecuadas, devuelve un objeto JSON con un array de recomendaciones vacío: \`{"recommendations": []}\`.
        5. No inventes servicios. Selecciona únicamente de la lista de servicios disponibles.

        Aquí están los datos del usuario para tu análisis:
        - Nombre: ${user.name}
        - Nivel de Membresía: ${user.membershipTier}
        - Metas de bienestar: ${user.goals || 'No especificado'}
        - Biografía/Intereses: ${user.bio || 'No especificado'}

        Esta es la lista completa de servicios de bienestar disponibles para seleccionar:
        ${JSON.stringify(WELLNESS_SERVICES, null, 2)}
    `;

    chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
        },
        // We will manage history manually in the app state to handle rendering recommendations.
    });
};

export const sendChatMessage = async (message: string): Promise<{ text: string, recommendations: Recommendation[] }> => {
    if (!chat) {
        throw new Error("El chat no ha sido inicializado.");
    }

    try {
        const response = await chat.sendMessage({ message });
        
        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("La respuesta de la API está vacía.");
        }

        const parsedResponse = JSON.parse(jsonText);
        let recommendations: Recommendation[] = [];

        if (parsedResponse.recommendations && Array.isArray(parsedResponse.recommendations)) {
            recommendations = parsedResponse.recommendations.map((rec: { id: number; reason: string }) => {
                const service = WELLNESS_SERVICES.find(s => s.id === rec.id);
                if (!service) return null;
                return {
                    ...service,
                    reason: rec.reason
                };
            }).filter((r): r is Recommendation => r !== null);
        }

        // For simplicity, we're returning a structured object. The conversational text is harder to get from structured JSON responses,
        // so we'll generate a generic intro text in the component.
        const introText = recommendations.length > 0
            ? "¡Claro! Basado en lo que me cuentas, he encontrado algunas opciones que creo que te encantarán:"
            : "No he encontrado recomendaciones específicas para eso. ¿Podrías darme más detalles o intentarlo de otra manera?";

        return { text: introText, recommendations };

    } catch (error) {
        console.error("Error al enviar mensaje a Gemini:", error);
        throw new Error("No pude procesar tu solicitud. Por favor, inténtalo de nuevo.");
    }
};


export const getDailyWellnessTip = async (): Promise<string> => {
    try {
        const prompt = "Dame un consejo de bienestar corto y accionable para el día de hoy. Sé conciso y positivo. No más de 25 palabras.";
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });
        const tip = response.text.trim();
        if (!tip) {
            throw new Error("La respuesta de la API para el consejo está vacía.");
        }
        return tip;
    } catch (error) {
        console.error("Error al obtener el consejo del día de Gemini:", error);
        throw new Error("No se pudo generar el consejo del día.");
    }
}

export const analyzeJournalEntry = async (imageAsBase64: string, mimeType: string, userText: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: imageAsBase64,
            },
        };
        const textPart = {
            text: `Eres Caliope, una coach de bienestar empática. Analiza la imagen y los pensamientos del usuario. Proporciona una reflexión breve (2-3 frases), positiva y perspicaz. Céntrate en reconocer sus sentimientos y quizás sugerir una acción consciente simple. Tu tono debe ser amable y alentador. Pensamientos del usuario: "${userText}"`,
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const analysis = response.text.trim();
        if (!analysis) {
            throw new Error("No se pudo generar un análisis.");
        }
        return analysis;
    } catch (error) {
        console.error("Error al analizar la entrada del diario:", error);
        throw new Error("No pude analizar tu momento. Por favor, inténtalo de nuevo.");
    }
};

export const getProactiveSuggestion = async (user: User): Promise<string> => {
    try {
        const prompt = `
            Eres Caliope, una coach de bienestar proactiva y perspicaz.
            Basado en los datos del usuario, genera una sugerencia corta, amable y accionable para su día.
            Tu sugerencia debe ser una sola frase motivadora.
            Considera su meta principal, pero también puedes dar un consejo general si lo crees conveniente.
            No sugieras un servicio específico de la lista, sino una acción o reflexión.

            Datos del usuario:
            - Nombre: ${user.name}
            - Meta de bienestar: ${user.goals || 'No especificado'}
            - Biografía/Intereses: ${user.bio || 'No especificado'}
            - Últimas interacciones: ${user.history.length > 0 ? user.history[0].preferences : 'Ninguna reciente'}

            Ejemplos de sugerencias:
            - "Recuerda que tu meta es mejorar tu fitness. ¿Qué tal una caminata de 15 minutos hoy para activar tu cuerpo?"
            - "Dado que buscas reducir el estrés, considera tomar 5 minutos para una respiración profunda cuando te sientas abrumado/a."
            - "Un pequeño paso hoy es un gran salto para tu bienestar mañana. ¡Sigue así!"

            Ahora, crea una nueva sugerencia personalizada para ${user.name}:
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        const suggestion = response.text.trim();
        if (!suggestion) {
            throw new Error("No se pudo generar la sugerencia.");
        }
        return suggestion;

    } catch (error) {
        console.error("Error al obtener sugerencia proactiva de Gemini:", error);
        // Devolvemos un mensaje genérico en caso de error para no romper la UI.
        return `¡Que tengas un día excelente, ${user.name}! Recuerda tomar un momento para ti.`;
    }
};
