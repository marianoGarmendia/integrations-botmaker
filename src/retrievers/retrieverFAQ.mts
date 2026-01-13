// import { VectorStoreRetriever } from '@langchain/core/vectorstores';
// import { Document } from '@langchain/core/documents';
// import { OpenAIEmbeddings } from '@langchain/openai';
// import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
// import { createClient } from '@supabase/supabase-js';
// import { supabaseClient as supabaseAdminClient } from '../supabase/supabaseClient.mjs';

// export interface FAQFilters {
//   document_type?: string;
//   categoria?: string;
//   subcategoria?: string;
//   ciudad?: string;
//   zona?: string[];
//   planes?: string[];
//   vigencia?: string;
//   prioridad_max?: number;
//   keywords?: string[];
//   document_id?: string;
// }

// const toArray = (v?: string | string[]) =>
//   v == null ? undefined : Array.isArray(v) ? v : [v];

// /**
//  * Crea un retriever específico para documentos FAQ // last_version
//  */
// export async function makeFAQRetriever(
//   userId: string,
//   agentId?: string,
//   faqFilters?: FAQFilters,
//   k: number = 5,
// ): Promise<VectorStoreRetriever> {
//   const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
//   const supabaseClient = createClient(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
//   );

//   const vectorStore = new SupabaseVectorStore(embeddings, {
//     client: supabaseClient,
//     tableName: 'documents_md',
//     queryName: 'match_documents_md', // la función de arriba
//   });

//   const filter: Record<string, any> = {
//     user_id: userId,
//     agent_id: agentId,
//     document_type: faqFilters?.document_type,
//     categoria: faqFilters?.categoria,
//     subcategoria: faqFilters?.subcategoria,
//     ciudad: faqFilters?.ciudad,
//     zona: toArray(faqFilters?.zona),
//     planes: toArray(faqFilters?.planes),
//     keywords: toArray(faqFilters?.keywords),
//     vigencia: faqFilters?.vigencia,
//     prioridad_max: faqFilters?.prioridad_max,
//     document_id: toArray(faqFilters?.document_id),
//   };
//   Object.keys(filter).forEach(k => filter[k] == null && delete filter[k]);

//   return vectorStore.asRetriever({ k, filter });
// }


// /**
//  * Mapea los argumentos de la tool del modelo a FAQFilters
//  */
// export function mapToolArgsToFAQFilters(input: {
//   zona?: string | null;
//   planes?: string | null;
//   ciudad?: string | null;
//   document_id?: string | null;
//   keywords?: string | null;
//   categoria?: string | null;
//   subcategoria?: string | null;
//   document_type?: string | null;
//   vigencia?: string | null;
// }): FAQFilters {
//   const filters: FAQFilters = {};

//   if (input.document_type) filters.document_type = input.document_type;
//   if (input.categoria) filters.categoria = input.categoria;
//   if (input.subcategoria) filters.subcategoria = input.subcategoria;
//   if (input.ciudad) filters.ciudad = input.ciudad;
//   if (input.vigencia) filters.vigencia = input.vigencia;

//   if (input.zona) filters.zona = [input.zona];
//   if (input.planes) filters.planes = [input.planes];
//   if (input.document_id) filters.document_id = input.document_id;
//   if (input.keywords) filters.keywords = [input.keywords];

//   return filters;
// }

// /**
//  * Construye un retriever directamente desde los argumentos de la tool
//  */
// export async function makeFAQRetrieverFromArgs(
//   userId: string,
//   agentId: string | undefined,
//   toolArgs: Parameters<typeof mapToolArgsToFAQFilters>[0],
//   k: number = 5,
// ) {
//   const filters = mapToolArgsToFAQFilters(toolArgs);
//   console.log("filters in makeFAQRetrieverFromArgs: ", filters);
//   return makeFAQRetriever(userId, agentId, filters, k);
// }

// /**
//  * Busca en documentos FAQ con filtros avanzados
//  */
// export async function searchFAQs(
//   query: string,
//   userId: string,
//   agentId?: string,
//   filters?: FAQFilters,
//   k: number = 5,
// ) {
//   const retriever = await makeFAQRetriever(userId, agentId, filters, k);
//   const results = await retriever.invoke(query);
  
//   return results.map(doc => ({
//     content: doc.pageContent,
//     metadata: doc.metadata,
//     score: doc.metadata.similarity || 0,
//   }));
// }

// /**
//  * Mapea los argumentos de la tool del modelo a FAQFilters
//  */
// // (Eliminada duplicación)

// /**
//  * Retriever basado en la RPC de Supabase que pasa p_user_id/p_agent_id y filtros avanzados.
//  * Úsalo cuando el retriever de VectorStore no devuelve resultados.
//  */
// export async function makeFAQRPCRetrieverFromArgs(
//   userId: string,
//   agentId: string | undefined,
//   toolArgs: Parameters<typeof mapToolArgsToFAQFilters>[0],
//   k: number = 5,
// ) {
//   if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
//     throw new Error('Missing Supabase credentials');
//   }

//   const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
//   const queryEmbeddingCache = new Map<string, number[]>();

//   const filters = mapToolArgsToFAQFilters(toolArgs);

//   async function rpcSearch(query: string): Promise<Document[]> {
//     let queryEmbedding = queryEmbeddingCache.get(query);
//     if (!queryEmbedding) {
//       queryEmbedding = await embeddings.embedQuery(query);
//       queryEmbeddingCache.set(query, queryEmbedding);
//     }

//     const metadataFilter: Record<string, any> = {};
//     if (filters.document_type) metadataFilter.document_type = filters.document_type;
//     if (filters.categoria) metadataFilter.categoria = filters.categoria;
//     if (filters.subcategoria) metadataFilter.subcategoria = filters.subcategoria;
//     if (filters.ciudad) metadataFilter.ciudad = filters.ciudad;
//     if (filters.vigencia) metadataFilter.vigencia = filters.vigencia;
//     if (filters.document_id) metadataFilter.document_id = filters.document_id;
//     if (filters.keywords && filters.keywords.length > 0) metadataFilter.keywords = filters.keywords.length === 1 ? filters.keywords[0] : filters.keywords;

//     const { data, error } = await supabaseAdminClient.rpc('match_documents_md', {
//       query_embedding: queryEmbedding,
//       match_count: k,
//       match_threshold: 0.5,
//       filter: metadataFilter,
//       p_user_id: userId || null,
//       p_agent_id: agentId || null,
//       p_document_type: filters.document_type || null,
//       p_categoria: filters.categoria || null,
//       p_subcategoria: filters.subcategoria || null,
//       p_ciudad: filters.ciudad || null,
//       p_zona: filters.zona || null,
//       p_planes: filters.planes || null,
//       p_vigencia: filters.vigencia || null,
//       p_prioridad_max: filters.prioridad_max || null,
//     });

//     if (error) {
//       throw new Error(`Error en búsqueda: ${error.message}`);
//     }

//     const rows = (data || []) as Array<{ id: string | number; content: string; metadata: any; similarity?: number }>;
//     return rows.map((row) => new Document({
//       pageContent: row.content,
//       metadata: { ...row.metadata, similarity: row.similarity ?? 0, id: String(row.id) },
//     }));
//   }

//   return {
//     invoke: rpcSearch,
//   };
// }



// // Test de uso:

// // const retriever = await makeFAQRetrieverFromArgs("cb11c35c-d95c-4ae5-aa33-3fa683230bd6", undefined,  {
// //   zona: "la_plata",
// //   planes: "plan_a_basic",
// //   ciudad: "la_plata",
// //   document_id: "faq_laboratorios_general_2025_04",
// //   keywords: "laboratorios"
// // },)

// // const response = await retriever.invoke("¿El plan basic que laboratorios me ofrece");
// // console.log("response in retrieverFAQ.mts: ", response);

// // const rpcRetriever = await makeFAQRPCRetrieverFromArgs(
// //   "cb11c35c-d95c-4ae5-aa33-3fa683230bd6",
// //   undefined,
// //   {
// //     zona: "la_plata",
// //     planes: "plan_a_basic",
// //     ciudad: "la_plata",
// //     document_id: "faq_laboratorios_general_2025_04",
// //     keywords: "laboratorios",
// //   },
// //   5,
// // );

// // const response = await rpcRetriever.invoke(
// //   "¿El plan basic qué laboratorios me ofrece?",
// // );
// // console.log(response);