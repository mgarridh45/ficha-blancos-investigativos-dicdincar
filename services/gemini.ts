import { GoogleGenAI } from "@google/genai";
import { Subject } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSubjectProfile = async (subject: Subject): Promise<string> => {
  try {
    const entriesText = subject.entries
      .map(e => `[${e.createdAt.substring(0, 10)}] ${e.type} por ${e.department} (${e.regionSection}): ${e.content}`)
      .join('\n');

    const prompt = `
      Actúa como un analista de inteligencia policial experto.
      
      Analiza los siguientes antecedentes de un blanco investigativo (Sujeto de Interés):
      
      Nombre: ${subject.fullName}
      Alias: ${subject.alias}
      Historial de Entradas:
      ${entriesText}

      Tarea:
      Genera un resumen ejecutivo de inteligencia policial (máximo 100 palabras) que incluya:
      1. Patrón delictual predominante.
      2. Nivel de peligrosidad estimado.
      3. Recomendaciones para el personal policial en caso de control.
      
      Formato: Texto plano, directo y técnico policial.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error generating profile:", error);
    return "Error al conectar con el servicio de inteligencia artificial.";
  }
};
