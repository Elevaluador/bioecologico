// src/lib/supabase.server.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY // Clave privada, nunca expuesta al cliente
)

