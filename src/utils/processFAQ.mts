import { Document } from '@langchain/core/documents';
import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';

export interface FAQMetadata {
  document_id: string;
  document_type: string;
  categoria: string;
  subcategoria: string;
  ciudad: string;
  zona: string[];
  planes: string[];
  vigencia: string;
  nivel_detalle: string;
  prioridad: number;
  keywords: string[];
  
  // Campos opcionales
  convenio?: string;
  convenios?: string[];
  incluye_centro_propio?: boolean;
  centro_propio?: string;
  modalidad?: string;
  descuento?: string;
  cartilla_online?: string;
  incluye_internacion?: boolean;
  clinicas_exclusivas?: string[];
  excluye_clinicas?: string[];
  prestador_local?: string;
}

/**
 * Procesa un archivo Markdown con frontmatter (FAQ)
 */
export async function processFAQMarkdown(
  filePath: string,
  userId: string,
  agentId?: string,
): Promise<Document> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);

  const metadata: FAQMetadata = frontmatter.metadata;

  // Validaciones básicas
  if (!metadata.document_id || !metadata.categoria || !metadata.ciudad) {
    throw new Error(
      `Metadata incompleta en ${filePath}. Requiere: document_id, categoria, ciudad`
    );
  }

  const doc = new Document({
    pageContent: content.trim(),
    metadata: {
      // Metadata del FAQ
      ...metadata,
      
      // Metadata del sistema
      user_id: userId,
      agent_id: agentId,
      source: filePath,
      filename: path.basename(filePath),
      
      // Para compatibilidad con sistema actual
      title: metadata.document_id,
      custom_title: metadata.document_id,
      description: `FAQ de ${metadata.categoria} - ${metadata.ciudad}`,
    },
  });

  return doc;
}

/**
 * Procesa múltiples archivos FAQ desde una carpeta (recursivo)
 */
export async function processFAQFolder(
  folderPath: string,
  userId: string,
  agentId?: string,
): Promise<Document[]> {
  const docs: Document[] = [];
  
  async function processDirectory(dirPath: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursivo para subcarpetas
        await processDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const doc = await processFAQMarkdown(fullPath, userId, agentId);
          docs.push(doc);
          console.log(`✅ Procesado: ${entry.name}`);
        } catch (error) {
          console.error(`❌ Error procesando ${entry.name}:`, error);
        }
      }
    }
  }
  
  await processDirectory(folderPath);
  return docs;
}