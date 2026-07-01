// src/content/config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Esquema base reutilizable
const postSchema = (image: () => any) =>
  z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: image(),
    author: z.string().default('Raul Flores'),
    tags: z.array(z.string()).default([]),
  });

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => postSchema(image),
});

const categorias = defineCollection({
  loader: glob({ base: './src/content/categorias', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    postSchema(image).extend({
      categoria: z.enum([
        'mercado',
        'innovacion-y-tecnologia',
        'eventos',
        'sostenibilidad',
        'casos-de-exito',
      ]),
    }),
});

const tendencias = defineCollection({
  loader: glob({ base: './src/content/tendencias', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    postSchema(image).extend({
      trending: z.boolean().default(true),
      relevance: z.number().min(1).max(10).default(5),
      categoria: z.enum([
        'mercado',
        'innovacion-y-tecnologia',
        'eventos',
        'sostenibilidad',
        'casos-de-exito',
      ]),
    }),
});

export const collections = { blog, categorias, tendencias };