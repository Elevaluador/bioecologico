/// <reference types="astro/client" />

interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;


}

// Variables de entorno de Supabase (nuevas)
interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  // Si alguna vez necesitas la pública:
  // readonly PUBLIC_SUPABASE_URL: string;
  // readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
