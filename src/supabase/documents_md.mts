import { buildSchemaFromSupabase } from './metadataUtils.mjs';
import { supabaseClient } from './supabaseClient.mjs';


/**
 * Builder de schema para documents_md
 */
export async function buildDocumentsMdToolSchema() {
  const schema = await buildSchemaFromSupabase(supabaseClient, 'documents_md', {
    rpcFunction: 'documents_md_get_metadata',
    limit: 100,
    offset: 0,
    excludeKeys: ['document_type', 'vigencia'], // Excluir campos internos
    descriptions: {
      zona: 'La zona donde se busca el prestador',
      planes: 'El plan vigente del afiliado que está haciendo la consulta',
      ciudad: 'La ciudad donde se busca el prestador',
      document_id: 'El document_id/nombre del documento para buscar en la metadata (interno)',
      keywords: 'Las palabras claves para buscar en la metadata (interno)',
      categoria: 'Categoría del prestador (médicos, farmacias, etc)',
    },
  });
  
  return schema;
}

// Uso en una tool
import { DynamicStructuredTool } from '@langchain/core/tools';

export async function createDocumentsMdTool() {
  const schema = await buildDocumentsMdToolSchema();
  
  return new DynamicStructuredTool({
    name: 'search_documents_md',
    description: 'Busca información sobre prestadores médicos, farmacias, etc.',
    schema,
    func: async (input) => {
      // Tu lógica de búsqueda aquí
      return JSON.stringify({ success: true, data: input });
    },
  });
}

/**
 * Builder de schema para plan_documents
 */
export async function buildPlanDocumentsToolSchema() {
  const schema = await buildSchemaFromSupabase(supabaseClient, 'plan_documents', {
    rpcFunction: 'plan_documents_get_metadata',
    limit: 100,
    offset: 0,
    excludeKeys: ['document_id', 'document_type', 'vigencia'], // Campos internos
    includeKeys: ['plan', 'categoria_prestacion', 'ciudad', 'tiene_copago'], // Solo estos
    descriptions: {
      plan: 'El plan del afiliado (plan_a_basic, elite, superior, b1)',
      categoria_prestacion: 'Categoría de la prestación consultada',
      ciudad: 'Ciudad donde necesita el servicio',
      tiene_copago: 'Si la prestación tiene copago',
    },
  });
  
  return schema;
}

// Uso en una tool
export async function createPlanDocumentsTool() {
  const schema = await buildPlanDocumentsToolSchema();
  
  return new DynamicStructuredTool({
    name: 'search_plan_documents',
    description: 'Busca información sobre características y prestaciones de planes de salud',
    schema,
    func: async (input) => {
      // Tu lógica de búsqueda aquí
      return JSON.stringify({ success: true, data: input });
    },
  });
}

