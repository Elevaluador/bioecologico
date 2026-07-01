// astro.config.mjs
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'viewport'
    },
    
    output: 'server',        // ← CAMBIA esto
    adapter: netlify(),      // ← AHORA sí tiene sentido
    
    site: 'https://www.bioecologico.online',
    
    integrations: [
        mdx(), 
        sitemap({
            filter: (page) => !page.includes('/blog/'),
        }),
    ],
    
    fonts: [
        {
            provider: fontProviders.local(),
            name: 'Atkinson',
            cssVariable: '--font-atkinson',
            fallbacks: ['sans-serif'],
            options: {
                variants: [
                    {
                        src: ['./src/assets/fonts/atkinson-regular.woff'],
                        weight: 400,
                        style: 'normal',
                        display: 'swap',
                    },
                    {
                        src: ['./src/assets/fonts/atkinson-bold.woff'],
                        weight: 700,
                        style: 'normal',
                        display: 'swap',
                    },
                ],
            },
        },
    ],
});