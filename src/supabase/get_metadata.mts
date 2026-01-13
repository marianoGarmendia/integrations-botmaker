import { buildSchemaFromSupabase } from './metadataUtils.mjs';
import { DynamicStructuredTool } from '@langchain/core/tools';

interface ToolConfig {
  tableName: string;
  toolName: string;
  description: string;
  rpcFunction?: string;
  excludeKeys?: string[];
  includeKeys?: string[];
  descriptions?: Record<string, string>;
  searchFunction: (input: any) => Promise<any>;
}

/**
 * Factory genérico para crear tools de búsqueda con schemas dinámicos
 */
export async function createDynamicSearchTool(
  supabaseClient: any,
  config: ToolConfig
) {
  const schema = await buildSchemaFromSupabase(supabaseClient, config.tableName, {
    rpcFunction: config.rpcFunction,
    excludeKeys: config.excludeKeys,
    includeKeys: config.includeKeys,
    descriptions: config.descriptions,
  });
  
  return new DynamicStructuredTool({
    name: config.toolName,
    description: config.description,
    schema,
    func: async (input) => {
      try {
        const result = await config.searchFunction(input);
        return JSON.stringify(result);
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      }
    },
  });
}

// Uso:
// export const documentsMdTool = await createDynamicSearchTool(supabaseClient, {
//   tableName: 'documents_md',
//   toolName: 'search_prestadores',
//   description: 'Busca prestadores médicos, farmacias, ópticas, etc.',
//   rpcFunction: 'documents_md_get_metadata',
//   excludeKeys: ['document_type', 'vigencia'],
//   descriptions: {
//     zona: 'Zona de búsqueda',
//     planes: 'Plan del afiliado',
//     ciudad: 'Ciudad',
//   },
//   searchFunction: async (input) => {
//     // Lógica de búsqueda
//     console.log('input en la tool documentsMdTool', input);
//     return { success: true, results: [] };
//   },
// });

// export const planDocumentsTool = await createDynamicSearchTool(supabaseClient, {
//   tableName: 'plan_documents',
//   toolName: 'search_plan_info',
//   description: 'Busca información de planes de salud',
//   rpcFunction: 'plan_documents_get_metadata',
//   includeKeys: ['plan', 'categoria_prestacion', 'ciudad'],
//   descriptions: {
//     plan: 'Plan del afiliado',
//     categoria_prestacion: 'Categoría de prestación',
//   },
//   searchFunction: async (input) => {
//     // Lógica de búsqueda
//     console.log('input en la tool planDocumentsTool', input);
//     return { success: true, results: [] };
//   },
// });

// console.dir(documentsMdTool, { depth: null });
// console.log(documentsMdTool.schema);