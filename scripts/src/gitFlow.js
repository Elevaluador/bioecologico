import { Octokit } from 'octokit';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import config from '../config.js';

const octokit = new Octokit({
  auth: config.github.token
});

/**
 * Configura Git con credenciales globales
 */
function setupGit() {
  try {
    execSync(`git config --global user.email "${config.github.email}"`, { stdio: 'pipe' });
    execSync(`git config --global user.name "${config.github.username}"`, { stdio: 'pipe' });
    console.log('✅ Git configurado');
  } catch (error) {
    console.error('⚠️  Error configurando Git:', error.message);
  }
}

/**
 * Crea una rama nueva, hace commit y push
 */
export async function commitAndPush(filename, mdxPath, images) {
  try {
    const branchName = 'auto/templates';

    console.log(`\n🌿 Usando rama: ${branchName}`);

    // Configurar Git
    setupGit();

    // Raíz del proyecto (fix: usar git para encontrar la raíz real)
    const projectRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();

    // Obtener información del remoto
    execSync('git fetch origin', {
      cwd: projectRoot,
      stdio: 'pipe'
    });

    // ¿Existe la rama remota?
    try {
      execSync(`git ls-remote --exit-code --heads origin ${branchName}`, {
        cwd: projectRoot,
        stdio: 'pipe'
      });

      console.log(`✅ La rama ${branchName} ya existe`);

      // Cambiar a la rama
      execSync(`git checkout ${branchName}`, {
        cwd: projectRoot,
        stdio: 'pipe'
      });

      // Actualizarla
      execSync(`git pull origin ${branchName}`, {
        cwd: projectRoot,
        stdio: 'pipe'
      });

      console.log('✅ Rama actualizada');

    } catch {

      console.log(`🆕 Rama no existe en remoto, verificando local...`);

      // Verificar si existe localmente
      try {
        execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, {
          cwd: projectRoot,
          stdio: 'pipe'
        });

        // Existe local: solo hacer checkout
        console.log(`✅ Rama existe local, cambiando a ella...`);
        execSync(`git checkout ${branchName}`, {
          cwd: projectRoot,
          stdio: 'pipe'
        });

      } catch {
        // No existe ni local ni remoto: crear
        console.log(`🆕 Creando rama ${branchName}`);
        try {
          execSync(`git checkout -b ${branchName} origin/master`, {
            cwd: projectRoot,
            stdio: 'pipe'
          });
        } catch {
          execSync(`git checkout -b ${branchName} master`, {
            cwd: projectRoot,
            stdio: 'pipe'
          });
        }
        console.log('✅ Rama creada');
      }
    }
    // Crear directorios
    const blogDir = path.join(projectRoot, 'src/content/blog');
    const imagesDir = path.join(blogDir, 'images');

    await fs.mkdir(imagesDir, { recursive: true });

    // Copiar MDX
    const targetMdx = path.join(blogDir, `${filename}.mdx`);
    const mdxContent = await fs.readFile(mdxPath, 'utf8');

    await fs.writeFile(targetMdx, mdxContent);

    console.log(`✅ Archivo ${filename}.mdx`);

    // Copiar imágenes
    for (const [, img] of Object.entries(images)) {
      try {
        const imageName = path.basename(img.path);

        await fs.copyFile(
          img.path,
          path.join(imagesDir, imageName)
        );

        console.log(`✅ Imagen ${imageName}`);

      } catch (err) {
        console.warn('⚠️ Imagen no copiada:', err.message);
      }
    }

    // Git
    execSync('git add src/content/blog/', {
      cwd: projectRoot,
      stdio: 'pipe'
    });

    // Commit (si hay cambios)
    try {
      execSync(`git commit -m "✨ Auto-Blog: ${filename}"`, {
        cwd: projectRoot,
        stdio: 'pipe'
      });

      console.log('✅ Commit realizado');

    } catch {
      console.log('ℹ️ No había cambios para commitear');
    }

    // Push
    execSync(`git push -u origin ${branchName}`, {
      cwd: projectRoot,
      stdio: 'pipe'
    });

    console.log('✅ Push realizado');

    // PR
    const prUrl = await createPullRequest(branchName, filename);

    return {
      branch: branchName,
      prUrl,
      file: targetMdx,
      images
    };

  } catch (error) {
    console.error('❌ Error en Git Flow:', error.message);
    throw error;
  }
}

/**
 * Crea un Pull Request automáticamente.
 * Si ya existe un PR abierto para la rama, devuelve su URL.
 */
export async function createPullRequest(branchName, postTitle) {
  try {
    console.log('📝 Creando Pull Request...');

    const pr = await octokit.rest.pulls.create({
      owner: config.github.owner,
      repo: config.github.repo,
      title: `✨ [AUTO-BLOG] ${postTitle}`,
      body: `# 🌾 Nuevo Post Automático

**Título:** ${postTitle}  
**Rama:** \`${branchName}\`  
**Generado:** ${new Date().toLocaleString('es-PE')}  
**Modo:** ${postTitle.includes('Inspiración') ? '✨ WOW' : '📰 Noticia'}

## 📋 Checklist de Revisión

- [ ] Título es SEO-optimizado
- [ ] Meta descripción es clara (150-160 caracteres)
- [ ] Imágenes se ven correctas (con logo superpuesto)
- [ ] Contenido es coherente y bien estructurado
- [ ] Etiquetas y categorías son relevantes
- [ ] Sin errores de ortografía o gramática
- [ ] Links funcionan correctamente
- [ ] Imagen destacada tiene buena resolución

## 🔄 Próximos Pasos

1. Revisar el contenido en la rama
2. Hacer cambios si es necesario
3. Aprobar si todo está bien
4. Mergear a \`master\`
5. Publicar el post

---

*Este PR fue generado automáticamente por Bioecológico Bot*
      `,
      head: branchName,
      base: 'master'
    });

    console.log(`✅ PR creado: ${pr.data.html_url}`);
    return pr.data.html_url;

  } catch (error) {
    // Si ya existe un PR abierto para esta rama, lo reutiliza
    if (error.status === 422) {
      console.log('ℹ️ Ya existe un PR abierto para esta rama, buscando...');

      const { data: pulls } = await octokit.rest.pulls.list({
        owner: config.github.owner,
        repo: config.github.repo,
        head: `${config.github.owner}:${branchName}`,
        state: 'open'
      });

      if (pulls.length > 0) {
        console.log(`✅ PR existente encontrado: ${pulls[0].html_url}`);
        return pulls[0].html_url;
      }
    }

    console.error('❌ Error creando PR:', error.message);
    throw error;
  }
}