import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import matter from 'gray-matter';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// CONFIGURACIÓN
// ==========================================

interface UploadConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  openaiApiKey: string;
  userId: string;
  agentId?: string;
  batchSize: number;
  dataDir: string;
}

interface PlanDocument {
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
}

// ==========================================
// VALIDAR VARIABLES DE ENTORNO
// ==========================================

function validateEnv(): UploadConfig {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const userId = process.env.DEFAULT_USER_ID;
  const agentId = process.env.AGENT_ID;

  if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey || !userId) {
    throw new Error(
      'Missing required environment variables:\n' +
      '- SUPABASE_URL\n' +
      '- SUPABASE_SERVICE_ROLE_KEY\n' +
      '- OPENAI_API_KEY\n' +
      '- USER_ID\n' +
      'Optional: AGENT_ID'
    );
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    openaiApiKey,
    userId,
    agentId,
    batchSize: 10, // Subir de 10 en 10
    dataDir: path.join(__dirname, '../data/plan_documents'),
  };
}

// ==========================================
// LEER ARCHIVOS MARKDOWN
// ==========================================

async function readMarkdownFiles(dataDir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dataDir);
    const markdownFiles = files
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(dataDir, file));
    
    return markdownFiles;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Directory not found: ${dataDir}`);
    }
    throw error;
  }
}

// ==========================================
// PARSEAR DOCUMENTO MARKDOWN
// ==========================================

async function parseMarkdownFile(filePath: string): Promise<{
  content: string;
  metadata: Record<string, any>;
  filename: string;
}> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data: frontMetadata, content } = matter(fileContent);

  return {
    content: content.trim(),
    metadata: frontMetadata.metadata || frontMetadata,
    filename: path.basename(filePath),
  };
}

// ==========================================
// GENERAR EMBEDDINGS
// ==========================================

async function generateEmbeddings(
  documents: Array<{ content: string; metadata: Record<string, any>; filename: string }>,
  openaiApiKey: string
): Promise<PlanDocument[]> {
  console.log(`\n🔮 Generando embeddings para ${documents.length} documentos...\n`);

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: openaiApiKey,
    modelName: 'text-embedding-3-small',
  });

  const planDocuments: PlanDocument[] = [];

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    try {
      console.log(`  [${i + 1}/${documents.length}] Procesando: ${doc.filename}`);
      
      // Generar embedding
      const embedding = await embeddings.embedQuery(doc.content);
      
      planDocuments.push({
        content: doc.content,
        metadata: doc.metadata,
        embedding,
      });
      
      console.log(`  ✅ Embedding generado (${embedding.length} dimensiones)`);
      
      // Pequeño delay para no saturar la API
      if (i < documents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error: any) {
      console.error(`  ❌ Error en ${doc.filename}:`, error.message);
      throw error;
    }
  }

  return planDocuments;
}

// ==========================================
// SUBIR A SUPABASE
// ==========================================

async function uploadToSupabase(
  documents: PlanDocument[],
  config: UploadConfig
): Promise<void> {
  console.log(`\n📤 Subiendo ${documents.length} documentos a Supabase...\n`);

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  // Dividir en lotes
  const batches: PlanDocument[][] = [];
  for (let i = 0; i < documents.length; i += config.batchSize) {
    batches.push(documents.slice(i, i + config.batchSize));
  }

  let totalUploaded = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    console.log(`  📦 Lote ${batchIndex + 1}/${batches.length} (${batch.length} documentos)`);

    try {
      const rows = batch.map(doc => ({
        content: doc.content,
        metadata: doc.metadata,
        embedding: doc.embedding,
        user_id: config.userId,
        agent_id: config.agentId || null,
      }));

      const { data, error } = await supabase
        .from('plan_documents')
        .insert(rows)
        .select('id');

      if (error) {
        console.error(`  ❌ Error en lote ${batchIndex + 1}:`, error.message);
        throw error;
      }

      totalUploaded += batch.length;
      console.log(`  ✅ Lote ${batchIndex + 1} subido correctamente (${data?.length || 0} registros)`);
      
      // Pequeño delay entre lotes
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error: any) {
      console.error(`  ❌ Error crítico en lote ${batchIndex + 1}:`, error);
      throw error;
    }
  }

  console.log(`\n✅ Total subido: ${totalUploaded}/${documents.length} documentos`);
}

// ==========================================
// LIMPIAR TABLA (OPCIONAL)
// ==========================================

async function cleanTable(config: UploadConfig): Promise<void> {
  console.log('\n🧹 Limpiando tabla plan_documents...');
  
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  const { error } = await supabase
    .from('plan_documents')
    .delete()
    .eq('user_id', config.userId);

  if (error) {
    console.error('❌ Error al limpiar tabla:', error.message);
    throw error;
  }

  console.log('✅ Tabla limpiada correctamente');
}

// ==========================================
// FUNCIÓN PRINCIPAL
// ==========================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     📚 CARGA DE DOCUMENTOS DE PLANES A SUPABASE              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Validar configuración
    console.log('⚙️  Validando configuración...');
    const config = validateEnv();
    console.log(`✅ Configuración válida`);
    console.log(`   - User ID: ${config.userId}`);
    console.log(`   - Agent ID: ${config.agentId || 'N/A'}`);
    console.log(`   - Batch size: ${config.batchSize}`);
    console.log(`   - Data dir: ${config.dataDir}`);

    // 2. Preguntar si limpiar tabla
    console.log('\n⚠️  ¿Deseas limpiar la tabla antes de subir? (Eliminará documentos existentes del user)');
    console.log('   Para producción, comenta esta sección o cambia a false\n');
    const shouldClean = false; // Cambiar a true si quieres limpiar
    
    if (shouldClean) {
      await cleanTable(config);
    }

    // 3. Leer archivos
    console.log('\n📂 Leyendo archivos Markdown...');
    const filePaths = await readMarkdownFiles(config.dataDir);
    console.log(`✅ Encontrados ${filePaths.length} archivos .md`);

    if (filePaths.length === 0) {
      console.log('\n⚠️  No se encontraron archivos .md en:', config.dataDir);
      console.log('   Asegúrate de ejecutar primero los scripts de generación:');
      console.log('   npm run generate:plans:all\n');
      return;
    }

    // 4. Parsear archivos
    console.log('\n📖 Parseando archivos...');
    const documents = await Promise.all(
      filePaths.map(filePath => parseMarkdownFile(filePath))
    );
    console.log(`✅ ${documents.length} documentos parseados`);

    // Mostrar resumen por plan
    const planCounts: Record<string, number> = {};
    documents.forEach(doc => {
      const plan = doc.metadata.plan || 'unknown';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    
    console.log('\n📊 Resumen por plan:');
    Object.entries(planCounts).forEach(([plan, count]) => {
      console.log(`   - ${plan}: ${count} documentos`);
    });

    // 5. Generar embeddings
    const planDocuments = await generateEmbeddings(documents, config.openaiApiKey);

    // 6. Subir a Supabase
    await uploadToSupabase(planDocuments, config);

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 ¡CARGA EXITOSA!                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    console.log('📈 Estadísticas finales:');
    console.log(`   - Total de archivos procesados: ${filePaths.length}`);
    console.log(`   - Total de documentos subidos: ${planDocuments.length}`);
    console.log(`   - Dimensiones de embeddings: ${planDocuments[0]?.embedding.length || 0}`);
    console.log('\n✅ Los documentos están listos para ser consultados!\n');

  } catch (error: any) {
    console.error('\n╔════════════════════════════════════════════════════════════════╗');
    console.error('║                     ❌ ERROR CRÍTICO                          ║');
    console.error('╚════════════════════════════════════════════════════════════════╝\n');
    console.error('Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar
main();