import { GoogleGenAI, Type, Chat } from "@google/genai";
import { User, WellnessService, Recommendation } from '../types';
import { WELLNESS_SERVICES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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
        ? `Eres Caliope, una Coach de Bienestar experta, proactiva y perspicaz. Tu objetivo es ser una guía a largo plazo para el usuario. Eres alentadora pero también analítica. Utiliza su historial y metas para hacer preguntas de seguimiento inteligentes y ofrecer recomendaciones que no solo respondan a su estado actual, sino que también lo ayuden a avanzar hacia sus objetivos a largo plazo.`
        : `Eres Caliope, una experta curadora de bienestar amigable y empática. Tu tarea es conversar con el usuario para entender sus necesidades y recomendar los servicios de bienestar más adecuados de una lista que te proporcionaré. Tu tono debe ser siempre alentador, conversacional y comprensivo.`;

    const systemInstruction = `
        ${personality}

        Reglas estrictas:
        1. Analiza las preferencias, metas e información del usuario para personalizar tus respuestas.
        2. Cuando el usuario pida recomendaciones, debes responder con texto conversacional y, al final de tu mensaje, incluir un bloque de código JSON que contenga tus recomendaciones.
        3. El bloque de código JSON DEBE estar envuelto en \`\`\`json ... \`\`\`.
        4. El JSON debe adherirse estrictamente al esquema proporcionado. Solo puedes recomendar servicios de la lista.
        5. Si el usuario hace una pregunta de seguimiento, utiliza el contexto de la conversación para responder.
        6. No inventes servicios. Selecciona únicamente de la lista de servicios disponibles.

        Aquí están los datos del usuario:
        - Nombre: ${user.name}
        - Nivel de Membresía: ${user.membershipTier}
        - Metas de bienestar: ${user.goals || 'No especificado'}
        - Biografía/Intereses: ${user.bio || 'No especificado'}

        Esta es la lista completa de servicios de bienestar disponibles:
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