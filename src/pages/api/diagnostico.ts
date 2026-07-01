// src/pages/api/diagnostico.ts
export const prerender = false;
import type { APIRoute } from 'astro';
// Log inmediato al cargar el archivo
console.log('=== DIAGNOSTICO.TS CARGADO y listo===');
import { supabase } from '../../lib/supabase.server';



export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    console.log('=== POST RECIBIDO ===');
    console.log('Raw body:', rawBody);

    if (!rawBody || rawBody.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Body vacío' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = JSON.parse(rawBody);

    if (!body.nombre || !body.telefono || !body.cultivo) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos obligatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('diagnosticos_agricultores')
      .insert([{
        nombre: body.nombre,
        telefono: body.telefono,
        ubicacion: body.ubicacion,
        cultivo: body.cultivo,
        hectareas: body.hectareas,
        anos_cultivando: body.anos_cultivando,
        problemas: body.problemas || '',
        fertilizante_actual: body.fertilizante_actual,
        gasto_mensual: body.gasto_mensual,
        tipo_interes: body.tipo_interes,
        comentarios: body.comentarios,
        ahorro_estimado: body.ahorro_estimado,
        estado: body.estado || 'nuevo',
      }]);

    // Log detallado del error de Supabase
    if (error) {
      console.error('=== ERROR SUPABASE ===');
      console.error('Código:', error.code);
      console.error('Mensaje:', error.message);
      console.error('Detalles:', error.details);
      console.error('Hint:', error.hint);
      console.error('======================');

      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Duplicado' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Devolver el error real de Supabase
      return new Response(
        JSON.stringify({ 
          error: error.message,
          code: error.code,
          details: error.details 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    // Captura cualquier cosa que no sea Error
    console.error('=== ERROR CATCH ===');
    console.error('Tipo:', typeof err);
    console.error('Valor:', err);
    console.error('===================');

    let message: string;
    
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    } else if (err && typeof err === 'object') {
      try {
        message = JSON.stringify(err);
      } catch {
        message = 'Error objeto no serializable';
      }
    } else {
      message = 'Error desconocido';
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};