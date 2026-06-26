import Parser from 'rss-parser';
import config from '../config.js';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'fullContent']
    ]
  }
});

/**
 * Busca noticias de feeds RSS sobre agricultura
 * Retorna la noticia más relevante o null si no hay
 */
export async function fetchNews() {
  const feeds = [
    // Google News RSS - Perú
    'https://news.google.com/rss/search?q=agricultura%20Perú&hl=es-419&gl=PE&ceid=PE:es',
    'https://news.google.com/rss/search?q=fertilizantes%20orgánicos&hl=es-419&gl=PE&ceid=PE:es',
    'https://news.google.com/rss/search?q=agro%20Piura&hl=es-419&gl=PE&ceid=PE:es',
  ];

  let allItems = [];

  for (const feedUrl of feeds) {
    try {
      console.log(`📡 Descargando feed: ${feedUrl.substring(0, 60)}...`);
      const feed = await parser.parseURL(feedUrl);
      allItems = allItems.concat(feed.items || []);
    } catch (error) {
      console.warn(`⚠️  Error en feed: ${error.message}`);
    }
  }

  if (allItems.length === 0) {
    console.log('❌ No se encontraron noticias en las últimas 24h');
    return null;
  }

  // Filtrar duplicados y noticias recientes (últimas 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const uniqueItems = Array.from(
    new Map(allItems.map(item => [item.link, item])).values()
  )
    .filter(item => {
      const itemDate = new Date(item.pubDate);
      return itemDate > oneDayAgo;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  if (uniqueItems.length === 0) {
    console.log('❌ No se encontraron noticias recientes');
    return null;
  }

  // Retornar noticia más relevante
  const topNews = uniqueItems[0];
  console.log(`✅ Noticia encontrada: ${topNews.title.substring(0, 60)}...`);
  
  return {
    title: topNews.title,
    description: topNews.content || topNews.fullContent || topNews.summary || topNews.contentSnippet || '',
    link: topNews.link,
    pubDate: topNews.pubDate,
    source: topNews.source?.title || 'Google News'
  };
}

/**
 * Tema alternativo para modo WOW
 */
export function getFallbackTopic() {
  const topics = [
    'Impacto de la tecnología blockchain en la trazabilidad de fertilizantes orgánicos en Perú',
    'Nuevas normativas ambientales 2026 para productores agrícolas de Piura y Sullana',
    'Adaptación al cambio climático: cultivos resilientes para la región Piura',
    'Microorganismos benéficos: la revolución silenciosa del agro sostenible peruano',
    'Certificación orgánica: oportunidades de mercado para Sullana 2026',
    'Agua y agricultura: nuevas tecnologías de riego sostenible'
  ];
  return topics[Math.floor(Math.random() * topics.length)];
}