import nodemailer from 'nodemailer';
import config from '../config.js';

/**
 * Envía notificación de PR por email
 */
export async function sendPRNotification(prData, contentData) {
  try {
    console.log('\n📧 Enviando notificación por email...');
    
    // Validar que hay configuración de email
    if (!config.email.user || !config.email.password || !config.email.to) {
      console.warn('⚠️  Email no configurado, omitiendo notificación');
      return false;
    }
    
    // Crear transportador
    const transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 650px; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a8c2a 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 30px; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 18px; color: #2d5016; margin-bottom: 15px; border-bottom: 2px solid #4a8c2a; padding-bottom: 10px; }
    .info-box { background: #f0f8ff; border-left: 4px solid #4a8c2a; padding: 15px 20px; margin: 15px 0; border-radius: 4px; }
    .info-box strong { color: #2d5016; }
    .button { display: inline-block; background: #4a8c2a; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; transition: background 0.3s; }
    .button:hover { background: #3a6820; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0; }
    .tag { background: #e8f5e9; color: #2d5016; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .checklist { list-style: none; margin: 15px 0; }
    .checklist li { padding: 8px 0; border-bottom: 1px solid #eee; }
    .checklist li:before { content: "☐ "; color: #4a8c2a; font-weight: bold; margin-right: 8px; }
    .footer { background: #f9f9f9; border-top: 1px solid #eee; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
    .timestamp { color: #999; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌾 Nuevo Post Automático Generado</h1>
      <p>Bioecológico AgTech - Sistema de Automatización de Blog</p>
    </div>

    <div class="content">
      <div class="section">
        <h2>📰 Información del Post</h2>
        <div class="info-box">
          <p><strong>Título:</strong></p>
          <p style="margin-top: 5px; font-size: 16px; font-weight: 500;">${contentData.titulo}</p>
        </div>
        <div class="info-box">
          <p><strong>Meta Descripción:</strong></p>
          <p style="margin-top: 5px; font-size: 13px;">${contentData.metaDescripcion}</p>
        </div>
        <p style="margin-top: 15px;">
          <strong>Categoría:</strong> Tendencias → <span style="color: #4a8c2a;">${contentData.subcategoria}</span>
        </p>
        <p style="margin-top: 10px;">
          <strong>Modo:</strong> ${contentData.modo === 'news' ? '📰 Basado en Noticia' : '✨ Modo WOW (Sin noticias)'}
        </p>
      </div>

      <div class="section">
        <h2>🏷️ Etiquetas</h2>
        <div class="tags">
          ${contentData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>

      ${contentData.newsLink ? `
      <div class="section">
        <h2>📡 Fuente Original</h2>
        <div class="info-box">
          <p><strong>Fuente:</strong> ${contentData.newsSource}</p>
          <p style="margin-top: 10px;">
            <a href="${contentData.newsLink}" style="color: #4a8c2a; text-decoration: none;">Ver noticia original →</a>
          </p>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h2>🚀 Próximo Paso</h2>
        <p>El post está listo para revisar. Abre el Pull Request en GitHub:</p>
        <a href="${prData.prUrl}" class="button">Ver Pull Request en GitHub</a>
      </div>

      <div class="section">
        <h2>✅ Checklist Rápido</h2>
        <ul class="checklist">
          <li>Contenido coherente y bien escrito</li>
          <li>Imágenes se ven correctas (con logo)</li>
          <li>Etiquetas y categorías correctas</li>
          <li>Links y referencias funcionan</li>
          <li>Listo para mergear y publicar</li>
        </ul>
      </div>

      <div class="timestamp">
        <p>Generado: ${new Date().toLocaleString('es-PE')}</p>
        <p>Rama: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${prData.branch}</code></p>
      </div>
    </div>

    <div class="footer">
      <p>Este correo fue generado automáticamente por el sistema de automatización de Bioecológico AgTech</p>
      <p style="margin-top: 10px; opacity: 0.7;">No respondas a este correo. Para más información, accede a tu repositorio en GitHub.</p>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: `"🤖 Bioecológico Bot" <${config.email.user}>`,
      to: config.email.to,
      subject: `📰 [AUTO-BLOG] Nuevo post: "${contentData.titulo}"`,
      html: htmlContent,
      text: `Nuevo post generado: ${contentData.titulo}\n\nVer PR: ${prData.prUrl}`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${config.email.to}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    console.warn('⚠️  Continuando sin enviar email...');
    return false;
  }
}
