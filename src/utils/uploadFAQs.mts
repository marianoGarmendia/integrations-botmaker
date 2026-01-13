import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { processFAQFolder } from './processFAQ.mjs';
import dotenv from 'dotenv';
dotenv.config();

export async function uploadFAQsToSupabase(
  faqFolderPath: string,
  userId: string,
  agentId?: string,
) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials');
  }

  console.log('📄 Procesando archivos FAQ...');
  const docs = await processFAQFolder(faqFolderPath, userId, agentId);
  console.log(`✅ ${docs.length} documentos FAQ procesados`);



  if (docs.length === 0) {
    console.log('⚠️ No se encontraron archivos .md para procesar');
    return;
  }

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });

  const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  

  console.log('⬆️ Generando embeddings y subiendo a Supabase...');
  
  await SupabaseVectorStore.fromDocuments(
    docs,
    embeddings,

    {
    
      client: supabaseClient,
      tableName: 'documents_md', // ← Nueva tabla
      queryName: 'match_documents_md', // ← Nueva función
      
    }
  );


  console.log('✅ FAQs subidos exitosamente a documents_md');
  
  // Estadísticas
  const categorias = new Set(docs.map(d => d.metadata.categoria));
  const ciudades = new Set(docs.map(d => d.metadata.ciudad));
  
  console.log('\n📊 Estadísticas:');
  console.log(`   - Total documentos: ${docs.length}`);
  console.log(`   - Categorías: ${Array.from(categorias).join(', ')}`);
  console.log(`   - Ciudades: ${Array.from(ciudades).join(', ')}`);
}