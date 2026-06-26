import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Mejora el prompt para Pollinations.ai
 */
function enhanceImagePrompt(basePrompt) {
  return `${basePrompt}. Estilo: fotografía profesional, colores vibrantes, tema agrícola, luz natural, resolución 4K. Contexto: Perú, Piura, Sullana, agricultura sostenible y fertilizantes orgánicos.`;
}

/**
 * Descarga imagen de Pollinations.ai (servicio gratuito)
 */
export async function downloadImage(prompt, filename) {
  try {
    const enhancedPrompt = enhanceImagePrompt(prompt);
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    
    // Pollinations.ai - servicio gratuito de generación de imágenes
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    
    console.log(`🎨 Descargando imagen de Pollinations.ai...`);
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    // Guardar en carpeta de imágenes
    const imagePath = path.join(__dirname, `../../src/content/blog/images/${filename}`);
    
    // Crear directorio si no existe
    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    
    // Escribir archivo
    await fs.writeFile(imagePath, response.data);
    console.log(`✅ Imagen guardada: ${filename}`);
    
    return imagePath;
  } catch (error) {
    console.error(`❌ Error descargando imagen:`, error.message);
    // Fallback: crear imagen placeholder de color
    return await createPlaceholderImage(filename);
  }
}

/**
 * Crea imagen placeholder si falla la descarga
 */
async function createPlaceholderImage(filename) {
  try {
    const imagePath = path.join(__dirname, `../../src/content/blog/images/${filename}`);
    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    
    // Crear imagen verde (tema agrícola) 500x500
    await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 3,
        background: { r: 45, g: 80, b: 22 } // Verde oscuro agrícola
      }
    })
      .png()
      .toFile(imagePath);
    
    console.log(`⚠️  Imagen placeholder creada: ${filename}`);
    return imagePath;
  } catch (error) {
    console.error(`❌ Error creando placeholder:`, error.message);
    throw error;
  }
}

/**
 * Superpone el logo en esquina inferior derecha
 */
export async function overlayLogo(imagePath, logoPath) {
  try {
    console.log('🏷️ Superponiendo logo...');
    
    // Verificar que el logo existe
    try {
      await fs.access(logoPath);
    } catch {
      console.warn(`⚠️  Logo no encontrado en ${logoPath}, omitiendo overlay`);
      return imagePath;
    }
    
    // Redimensionar imagen a 500x500
    const imageBuffer = await sharp(imagePath)
      .resize(500, 500, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    // Redimensionar logo a 60x60
    const logoBuffer = await sharp(logoPath)
      .resize(60, 60)
      .toBuffer();

    // Superponer logo en esquina inferior derecha
    await sharp(imageBuffer)
      .composite([
        {
          input: logoBuffer,
          gravity: 'southeast',
          offset: { left: 10, top: 10 }
        }
      ])
      .toFile(imagePath);

    console.log(`✅ Logo superpuesto exitosamente`);
    return imagePath;
  } catch (error) {
    console.error(`❌ Error superponiendo logo:`, error.message);
    // Continuar sin logo si falla
    return imagePath;
  }
}

/**
 * Procesa imagen destacada (portada 500x500 con logo)
 */
export async function processFeatureImage(prompt) {
  try {
    const timestamp = Date.now();
    const filename = `featured-${timestamp}.png`;
    
    console.log(`\n📸 Procesando imagen destacada...`);
    
    // Descargar imagen
    const downloadedPath = await downloadImage(prompt, filename);
    
    // Superponer logo
    const logoPath = path.join(__dirname, '../templates/logo.jpg');
    await overlayLogo(downloadedPath, logoPath);
    
    return {
      filename: `images/${filename}`,
      path: downloadedPath
    };
  } catch (error) {
    console.error('❌ Error procesando imagen destacada:', error.message);
    throw error;
  }
}

/**
 * Procesa imagen para cuerpo del post (700x500, sin logo)
 */
export async function processBodyImage(prompt) {
  try {
    const timestamp = Date.now();
    const filename = `body-${timestamp}.png`;
    
    console.log(`\n📸 Procesando imagen de cuerpo...`);
    
    // Descargar imagen original
    const imagePath = await downloadImage(prompt, filename);
    
    // CORRECCIÓN AQUÍ: Procesamos la imagen cargándola primero en memoria (Buffer)
    const processedBuffer = await sharp(imagePath)
      .resize(700, 500, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    // Ahora que el archivo de entrada se liberó, guardamos el buffer encima de la misma ruta
    await sharp(processedBuffer).toFile(imagePath);

    console.log(`✅ Imagen de cuerpo procesada`);

    return {
      filename: `images/${filename}`,
      path: imagePath
    };
  } catch (error) {
    console.error('❌ Error procesando imagen de cuerpo:', error.message);
    throw error;
  }
}