import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import config from '../config.js';

/**
 * Genera el frontmatter YAML para Astro
 */
function generateFrontmatter(data) {
  const date = format(new Date(), 'yyyy-MM-dd');
  const tags = Array.isArray(data.tags) ? data.tags : [];
  
  // Escapar comillas en título y descripción
  const titulo = data.titulo.replace(/"/g, '\\"');
  const metaDescripcion = data.metaDescripcion.replace(/"/g, '\\"');
  
  return `---
title: "${titulo}"
description: "${metaDescripcion}"
pubDate: ${date}
author: "${config.blog.postAuthor}"
categoria: "Tendencias"
subcategoria: "${data.subcategoria}"
tags: [${tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ')}]
image: "${data.imagenDestacada}"
---

`;
}

/**
 * Genera tabla de contenidos con <details>
 */
function generateTableOfContents() {
  return `
<details>
<summary style="cursor: pointer; font-weight: bold; color: var(--primary-color, #2d5016);">
  📑 Tabla de Contenidos
</summary>

- [Introducción](#introducción)
- [El contexto actual](#el-contexto-actual)
- [Impacto en Sullana/Piura](#impacto-en-sullanapira)
- [Acciones recomendadas](#acciones-recomendadas)
- [Conclusión](#conclusión)

</details>

`;
}

/**
 * Estructura el contenido completo en MDX para Astro
 */
export function createMarkdown(contentData, images) {
  const frontmatter = generateFrontmatter({
    titulo: contentData.titulo,
    metaDescripcion: contentData.metaDescripcion,
    subcategoria: contentData.subcategoria,
    tags: contentData.tags,
    imagenDestacada: `/${images.featured.filename}`
  });

  const toc = generateTableOfContents();

  let body = `# ${contentData.titulo}

![${contentData.titulo}](/${images.featured.filename})

## Introducción

${contentData.contenido}

${toc}

## El contexto actual

El sector agrícola peruano, especialmente en zonas como Sullana y Piura, se enfrenta a retos constantemente cambiantes. Este artículo profundiza en cómo podés adaptarte y prosperar en este entorno dinámico.

![Imagen contextual](/${images.body.filename})

## Impacto en Sullana/Piura

Para los productores de la región, esto significa:

- **Oportunidades**: Nuevos mercados y métodos más eficientes
- **Desafíos**: Adaptación tecnológica y regulatoria
- **Beneficios a largo plazo**: Mayor rentabilidad y sostenibilidad

## Acciones recomendadas

1. Mantente informado sobre regulaciones nuevas
2. Invierte en capacitación continua
3. Red con otros productores de la zona
4. Considera tecnologías sostenibles y certificación orgánica
5. Participa en comunidades locales de agricultores

## Conclusión

La transformación agrícola es una oportunidad, no una amenaza. En Sullana y Piura tenemos el potencial para liderar esta transformación hacia un agro más sostenible y rentable.

---

**Publicado por:** ${config.blog.postAuthor}  
**Última actualización:** ${format(new Date(), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
`;

  // Agregar enlace a noticia original si existe
  if (contentData.newsLink) {
    body += `\n\n**Fuente original:** [${contentData.newsSource}](${contentData.newsLink})\n`;
  }

  return frontmatter + body;
}

/**
 * Genera slug URL-seguro desde el título
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .substring(0, 50) // Limitar longitud
    .replace(/-+$/, ''); // Remover guiones finales
}