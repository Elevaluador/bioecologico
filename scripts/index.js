#!/usr/bin/env node

import config from './config.js';
import { fetchNews, getFallbackTopic } from './src/fetchNews.js';
import { generateNewsContent, generateWowContent } from './src/generateContent.js';
import { processFeatureImage, processBodyImage } from './src/processImages.js';
import { createMarkdown, generateSlug } from './src/createMarkdown.js';
import { commitAndPush } from './src/gitFlow.js';
import { sendPRNotification } from './src/sendNotification.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Función principal que orquesta todo el flujo de automatización
 */
async function main() {
  const startTime = Date.now();
  
  console.clear();
  console.log('\n🌾 ╔════════════════════════════════════════╗');
  console.log('   ║  BIOECOLÓGICO AUTO-BLOG GENERATOR    ║');
  console.log('   ╚════════════════════════════════════════╝\n');
  console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-PE')}\n`);

  try {
    // ========== PASO 1: EXTRACCIÓN DE NOTICIAS ==========
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PASO 1️⃣  Extrayendo noticias...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    let news = await fetchNews();
    let isWowMode = false;

    // ========== PASO 2: DECIDIR MODO ==========
    if (!news) {
      console.log('\n❌ No se encontraron noticias en las últimas 24 horas');
      console.log('🌟 Activando MODO WOW (Generación de contenido inspirador)...\n');
      
      isWowMode = true;
      const fallbackTopic = getFallbackTopic();
      news = { 
        title: fallbackTopic,
        description: 'Contenido generado en modo WOW'
      };
    }

    // ========== PASO 3: GENERAR CONTENIDO ==========
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PASO 2️⃣  Generando contenido con Gemini...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const contentData = isWowMode
      ? await generateWowContent(news.title)
      : await generateNewsContent(news);

    console.log(`\n✅ Título generado: "${contentData.titulo}"`);
    console.log(`✅ Subcategoría: ${contentData.subcategoria}`);
    console.log(`✅ Etiquetas: ${contentData.tags.join(', ')}`);

    // ========== PASO 4: PROCESAR IMÁGENES ==========
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PASO 3️⃣  Procesando imágenes...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const featureImage = await processFeatureImage(contentData.imagenPrompt);
    const bodyImage = await processBodyImage(
      contentData.imagenPrompt + ' (variación diferente)'
    );

    const images = {
      featured: featureImage,
      body: bodyImage
    };

    console.log('\n✅ Imágenes procesadas exitosamente');

    // ========== PASO 5: CREAR MARKDOWN ==========
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PASO 4️⃣  Creando archivo MDX...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const mdxContent = createMarkdown(contentData, images);
    const slug = generateSlug(contentData.titulo);
    const tempMdxPath = path.join(__dirname, `./${slug}-temp.mdx`);
    
    await fs.writeFile(tempMdxPath, mdxContent);
    console.log(`✅ Archivo MDX creado: ${slug}.mdx`);
    console.log(`✅ Ruta temporal: ${tempMdxPath}`);

    // ========== PASO 6: GIT FLOW ==========
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PASO 5️⃣  Procesando Git Flow...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const gitResult = await commitAndPush(slug, tempMdxPath, images);

    // ========== PASO 7: NOTIFICACIÓN ==========
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PASO 6️⃣  Enviando notificaciones...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await sendPRNotification(gitResult, {
      ...contentData,
      newsLink: news.link,
      newsSource: news.source
    });

    // Limpiar archivo temporal
    try {
      await fs.unlink(tempMdxPath);
      console.log(`\n🧹 Archivo temporal limpiado`);
    } catch (error) {
      console.warn(`⚠️  No se pudo limpiar temporal: ${error.message}`);
    }

    // ========== RESUMEN FINAL ==========
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ¡PROCESO COMPLETADO EXITOSAMENTE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 RESUMEN:');
    console.log(`  • Modo: ${isWowMode ? '✨ WOW (Sin noticias)' : '📰 Basado en noticia'}`);
    console.log(`  • Título: ${contentData.titulo}`);
    console.log(`  • Categoría: Tendencias → ${contentData.subcategoria}`);
    console.log(`  • Slug: ${slug}`);
    console.log(`  • Rama: ${gitResult.branch}`);
    console.log(`  • Tiempo total: ${duration}s`);
    console.log(`\n🔗 Pull Request: ${gitResult.prUrl}`);
    console.log(`📧 Email enviado para revisión\n`);

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR EN EL PROCESO');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.error('📋 Detalles del error:');
    console.error(error);
    
    // Información de debugging
    console.error('\n🔍 Debugging:');
    console.error(`  • Versión Node: ${process.version}`);
    console.error(`  • CWD: ${process.cwd()}`);
    console.error(`  • Platform: ${process.platform}`);
    
    console.error('\n⚠️  Asegúrate de que:');
    console.error('  1. Las variables de .env están configuradas correctamente');
    console.error('  2. Tienes conexión a internet');
    console.error('  3. Tu GITHUB_TOKEN tiene permisos suficientes');
    console.error('  4. Tu GEMINI_API_KEY es válida\n');
    
    process.exit(1);
  }
}

// Ejecutar
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});