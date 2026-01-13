import { uploadFAQsToSupabase } from '../utils/uploadFAQs.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function main() {
  // Configuración
  const faqsPath = path.join(__dirname, '../../data/faqs_docs');
  const userId = process.env.DEFAULT_USER_ID || '1234'; // Cambiar por tu user_id real
  const agentId = process.env.DEFAULT_AGENT_ID; // Opcional

  console.log('🚀 Iniciando carga de FAQs...');
  console.log(`📁 Carpeta: ${faqsPath}`);
  console.log(`👤 User ID: ${userId}`);
  if (agentId) console.log(`🤖 Agent ID: ${agentId}`);

  try {
    await uploadFAQsToSupabase(faqsPath, userId, agentId);
    console.log('\n🎉 Proceso completado exitosamente');
  } catch (error) {
    console.error('\n❌ Error durante la carga:', error);
    process.exit(1);
  }
}

// main();