import OpenAI from "openai";
import config from '../config.js';

// Inicializamos el cliente de OpenAI apuntando a la infraestructura de Groq
const client = new OpenAI({
  apiKey: config.gemini.apiKey, // Aquí va tu API Key de Groq
  baseURL: "https://api.groq.com/openai/v1", // URL base requerida para Groq
});

/**
 * Genera contenido basado en una noticia
 * Modo: Análisis y redacción desde una fuente de noticias
 */
export async function generateNewsContent(newsData) {
  try {
    const prompt = config.prompts.newsAnalysis
      .replace('{news}', `
Título: ${newsData.title}
Descripción: ${newsData.description}
Enlace: ${newsData.link}
Fuente: ${newsData.source}
      `.trim());

    console.log('🤖 Generando contenido con Groq (Modo: Noticia)...');
    
    // Llamada usando la Responses API compatible con Groq
    const response = await client.responses.create({
      model: config.gemini.model, // Debe ser "openai/gpt-oss-120b" en tu config
      input: prompt,
    });

    // En la Responses API de Groq el texto viene en .output_text
    const text = response.output_text;
    
    // Limpiar respuesta si viene con markdown
    const cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanText);
    
    return {
      ...parsed,
      modo: 'news',
      newsLink: newsData.link,
      newsSource: newsData.source
    };
  } catch (error) {
    console.error('❌ Error generando contenido:', error.message);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

/**
 * Genera contenido en modo WOW (sin noticias)
 * Modo: Estadística + Reto del Día
 */
export async function generateWowContent(topic) {
  try {
    // Usar el prompt configurado
    const prompt = `${config.prompts.wowEffect.split('Crea contenido')[0]}Crea contenido sobre: "${topic}"

${config.prompts.wowEffect.split('Crea contenido impactante:')[1]}`;

    console.log('✨ Generando contenido WOW (Modo: Sin noticias)...');
    
    // Llamada usando la Responses API compatible con Groq
    const response = await client.responses.create({
      model: config.gemini.model, // Debe ser "openai/gpt-oss-120b" en tu config
      input: prompt,
    });

    // Extraemos la respuesta
    const text = response.output_text;
    
    // Limpiar respuesta
    const cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanText);
    
    return {
      ...parsed,
      modo: 'wow',
      subcategoria: 'Inspiración'
    };
  } catch (error) {
    console.error('❌ Error generando contenido WOW:', error.message);
    throw new Error(`Groq API error: ${error.message}`);
  }
}