import dotenv from 'dotenv';

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: '../.env' });

const config = {
  // ============ GROQ / OPENAI API ============
  gemini: {
    // Mantenemos la propiedad "gemini" para no romper la compatibilidad de tus otros scripts
    apiKey: process.env.GROQ_API_KEY, 
    model:'openai/gpt-oss-20b'
  },
  
  // ============ GITHUB ============
  github: {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    email: process.env.GIT_USER_EMAIL || 'bot@bioecologico.com',
    username: process.env.GIT_USER_NAME || '🤖 Bioecológico Bot'
  },
  
  // ============ EMAIL ============
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_APP_PASSWORD,
    to: process.env.REVIEWER_EMAIL
  },
  
  // ============ BLOG ASTRO ============
  blog: {
    contentPath: '../src/content/blog',
    logoPath: './templates/logo.png',
    postAuthor: 'Bioecológico AgTech',
    siteUrl: process.env.SITE_URL || 'https://www.bioecologico.online'
  },
  
  // ============ BÚSQUEDA ============
  keywords: ['agricultura', 'agro', 'fertilizantes', 'Perú', 'sostenible', 'orgánico'],
  
  // ============ PROMPTS DE IA ============
  prompts: {
    newsAnalysis: `Eres un experto en agricultura, fertilizantes orgánicos y tendencias del agro en Perú, específicamente en la región de Sullana/Piura.

Analiza esta noticia: "{news}"

Debes:
1. Redactar un artículo de blog de 800-1000 palabras que sea:
   - SEO-optimizado
   - Atractivo para agricultores de Sullana/Piura
   - Con datos concretos del sector
   - Conversacional pero profesional
   - Orientado a agricultura sostenible y fertilizantes orgánicos
   
2. Elegir la subcategoría más relevante:
   - "Mercado Agrícola"
   - "Tecnología y Sostenibilidad"
   - "Clima y Medio Ambiente"
   - "Normativa y Regulación"
   - "Capacitación"
   
3. Proponer 5-7 etiquetas SEO relevantes (incluir "Agro 2026", "Sullana" o "Piura" si es relevante).

Responde SOLO en formato JSON, sin Markdown ni explicaciones adicionales:
{
  "titulo": "Título SEO-optimizado (50-60 caracteres)",
  "metaDescripcion": "Meta descripción (150-160 caracteres)",
  "subcategoria": "La subcategoría elegida",
  "contenido": "El contenido del artículo en markdown (sin el H1, sin frontmatter)",
  "tags": ["tag1", "tag2", ...],
  "imagenPrompt": "Descripción visual para generar imagen de portada"
}`,

    wowEffect: `Eres un experto en datos e insights del sector agrícola 2026 en Perú, especializado en sostenibilidad y fertilizantes orgánicos.

Crea contenido impactante:
1. Una estadística sorprendente sobre el agro, fertilizantes orgánicos o sostenibilidad en Perú 2026
2. Un "Reto del Día" motivacional para agricultores de Sullana/Piura
3. Conexión práctica con la realidad local

Responde SOLO en JSON:
{
  "titulo": "Título atractivo (50-60 caracteres)",
  "metaDescripcion": "Meta descripción (150-160 caracteres)",
  "contenido": "Artículo de 600-800 palabras que presente la estadística, contexto y el reto",
  "tags": ["Agro 2026", "Datos", "Inspiración", "Sullana", ...],
  "imagenPrompt": "Descripción visual para generar una imagen inspiradora"
}`
  }
};

// Validar variables requeridas (Actualizado a GROQ_API_KEY)
const requiredVars = ['GROQ_API_KEY', 'GITHUB_TOKEN', 'EMAIL_USER', 'EMAIL_APP_PASSWORD'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.warn(`⚠️  Variables faltantes en .env: ${missing.join(', ')}`);
}

export default config;