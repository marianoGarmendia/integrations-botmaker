
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { supabaseClient } from "./supabaseClient.mjs";
import {
  pickMetadataFieldsTS,
  aggregateOptionsStrict,
} from "../utils/filters.mjs";


import { MetadataRow } from "../types/supabase.d.js";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();



export interface FAQSearchFilters {
  // Filtros principales
  document_type?: "faq";
  categoria?:
    | "informacion_general"
    | "urgencias"
    | "consultas_medicas"
    | "odontologia"
    | "farmacias"
    | "opticas"
    | "laboratorios"
    | "clinicas"
    | "diagnostico_imagenes"
    | "rehabilitacion"
    | "psicologia"
    | "fonoaudiologia"
    | "centros_especializados";

  ciudad?: "la_plata" | "chascomus" | "magdalena";

  planes?: Array<"plan_a_basic" | "b1" | "superior" | "elite">;

  // Filtros adicionales
  subcategoria?: string;
  zona?: string[];
  vigencia?: string;
  prioridad_max?: number;

  // Control de búsqueda
  k?: number; // Cantidad de resultados
  user_id?: string; // Usuario propietario de los docs
  agent_id?: string; // Agente asociado
}

export interface FAQSearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

/**
 * Busca documentos FAQ con filtros específicos
 * @param query - Pregunta del usuario
 * @param filters - Filtros de metadata
 * @returns Documentos relevantes con scores de similitud
 */
export async function searchFAQDocuments(
  query: string,
  filters: FAQSearchFilters = {},
): Promise<FAQSearchResult[]> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase credentials");
  }

  // Generar embedding de la query
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });

  const queryEmbedding = await embeddings.embedQuery(query);

  // Construir filtro metadata JSONB
  const metadataFilter: Record<string, any> = {};

  if (filters.document_type) {
    metadataFilter.document_type = filters.document_type;
  }

  if (filters.categoria) {
    metadataFilter.categoria = filters.categoria;
  }

  if (filters.subcategoria) {
    metadataFilter.subcategoria = filters.subcategoria;
  }

  if (filters.ciudad) {
    metadataFilter.ciudad = filters.ciudad;
  }

  if (filters.vigencia) {
    metadataFilter.vigencia = filters.vigencia;
  }

  // Llamar a la función RPC con filtros
  const { data, error } = await supabaseClient.rpc("match_documents_md", {
    query_embedding: queryEmbedding,
    match_count: filters.k || 5,
    match_threshold: 0.5, // Mínimo de similitud
    filter: metadataFilter,
    p_user_id: filters.user_id || null,
    p_agent_id: filters.agent_id || null,
    p_document_type: filters.document_type || null,
    p_categoria: filters.categoria || null,
    p_subcategoria: filters.subcategoria || null,
    p_ciudad: filters.ciudad || null,
    p_zona: filters.zona || null,
    p_planes: filters.planes || null,
    p_vigencia: filters.vigencia || null,
    p_prioridad_max: filters.prioridad_max || null,
  });

  if (error) {
    console.error("Error searching FAQs:", error);
    throw new Error(`Error en búsqueda: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id.toString(),
    content: row.content,
    metadata: row.metadata,
    similarity: row.similarity,
  }));
}

/**
 * Wrapper que retorna Documents de LangChain (útil para chains)
 */
export async function searchFAQDocumentsAsLangChain(
  query: string,
  filters: FAQSearchFilters = {},
): Promise<Document[]> {
  const results = await searchFAQDocuments(query, filters);

  return results.map(
    (result) =>
      new Document({
        pageContent: result.content,
        metadata: {
          ...result.metadata,
          similarity: result.similarity,
          id: result.id,
        },
      }),
  );
}

// Propuesta con user_id
// const { data, error } = await supabaseClient
//   .rpc("documents_md_metadata_kv", { p_user_id: "cb11c35c-d95c-4ae5-aa33-3fa683230bd6" });

// const { data, error } = await supabaseClient
//   .rpc("documents_md_metadata_kv", { p_user_id: "cb11c35c-d95c-4ae5-aa33-3fa683230bd6" });

// console.log("data linee 152 - buildFilters.mts : >>>>>")
// console.dir(data, { depth: null });

// console.log("error linee 155 - buildFilters.mts : >>>>>")
// console.dir(error, { depth: null });

// if (error) throw error;
// data: [{ key: "categoria", value: "X", occurrences: 10 }, ...]
// ---------------------------------------------------------------------------------------------------------->
// Me traigo toda la data key y value_canonical de la metadata
// const { data, error } = await supabaseClient.rpc('documents_md_metadata_kv_unified');
//   /*
//   data => [
//     { key: 'ciudad', value_canonical: 'cha​scomus', originals: ['chascomus','Chascomús'], occurrences: 60 },
//     { key: 'planes', value_canonical: 'plan_a_basic', originals: ['plan_a_basic'], occurrences: 120 },
//     ...
//   ]
//   */

//   console.log("data linee 175 - buildFilters.mts : >>>>>")
//   console.dir(data, { depth: null });

//   console.log("error linee 178 - buildFilters.mts : >>>>>")
//   console.dir(error, { depth: null });

//   if (error) throw error;
// data: [{ key: "categoria", value: "X", occurrences: 10 }, ...]
// ---------------------------------------------------------------------------------------------------------->

//   const { data: schemaJson, error } = await supabaseClient.rpc('documents_md_metadata_schema', {
//     p_user_id: 'cb11c35c-d95c-4ae5-aa33-3fa683230bd6'
//   });
//   if (error) throw error;

//   // schemaJson.ej: { ciudad: { enum: [...], originals: {...}, counts: {...} }, planes: {...}, ... }

//   type KeyMeta = { enum: string[]; originals: Record<string, string[]>; counts: Record<string, number> };
//   const enums: Record<string, z.ZodEnum<[string, ...string[]]>> = {};

// for (const [key, meta] of Object.entries(schemaJson as Record<string, KeyMeta>)) {
//   const values = meta.enum;
//   if (values.length > 0) {
//     enums[key] = z.enum(values as [string, ...string[]]);
//   }
// }

// // Ejemplo: validar filtro de ciudad
// const Ciudad = enums["ciudad"];              // z.enum(["chascomus","la_plata","magdalena"])
// const resultado = Ciudad?.safeParse("la_plata"); // OK

// import { z } from "zod";

// const { data: schemaJson, error } = await supabaseClient.rpc('documents_md_metadata_schema', );
// if (error) throw error;
// console.dir(schemaJson, { depth: null });
// // schemaJson.ej: { ciudad: { enum: [...], originals: {...}, counts: {...} }, planes: {...}, ... }

// type KeyMeta = { enum: string[]; originals: Record<string, string[]>; counts: Record<string, number> };
// const enums: Record<string, z.ZodEnum<[string, ...string[]]>> = {};

// for (const [key, meta] of Object.entries(schemaJson as Record<string, KeyMeta>)) {
//   const values = meta.enum;
//   if (values.length > 0) {
//     enums[key] = z.enum(values as [string, ...string[]]);
//   }
// }

// // Ejemplo: validar filtro de ciudad
// const Ciudad = enums["ciudad"];              // z.enum(["chascomus","la_plata","magdalena"])
// const resultado = Ciudad?.safeParse("la_plata"); // OK

// console.log("Ciudad linee 230 - buildFilters.mts : >>>>>")
// console.dir(Ciudad, { depth: null });

// console.log("resultado linee 233 - buildFilters.mts : >>>>>")
// console.dir(resultado, { depth: null });

// trae las primeras 100 metadatas

// ["b1","elite","plan_a_basic","superior"] (ordenado)

/*
{
  zona: [
    'berisso',
    'chascomus',
    'ensenada',
    'la_plata',
    'magdalena',
    'villa_elisa'
  ],
  planes: [ 'b1', 'elite', 'plan_a_basic', 'superior' ],
  ciudad: [ 'chascomus', 'la_plata', 'magdalena' ],
  document_id: [
    'faq_clinicas_chascomus_2025',
    'faq_clinicas_magdalena_2025_05',
    'faq_clinicas_plan_b1_superior_la_plata_2025_04',
    'faq_clinicas_plan_basic_la_plata_2025_04',
    'faq_clinicas_plan_elite_la_plata_2025_04'
  ],
  keywords: [
    'b1',                    'centro de salud',
    'centro médico bolívar', 'chascomús',
    'cirugía',               'clínica modelo',
    'clínicas',              'elite',
    'hospital',              'hospital italiano',
    'internación',           'ipensa',
    'magdalena',             'plan basic',
    'premium',               'sanatorios',
    'superior'
  ]
}

*/

// const aggCanon = aggregateOptions(dataWithMetadata, "canonical");
// console.log(aggCanon); // p.ej. ["chascomus","la_plata","magdalena"]

const builderMetadataSchema = (dataWithMetadata: MetadataRow) => {
  const { zona, planes, ciudad, document_id, keywords } = dataWithMetadata;

  const schema = z.object({
    zona: z.enum(zona as [string, ...string[]]).nullable().describe("La zona donde se busca"),
    planes: z.enum(planes as [string, ...string[]]).nullable().describe("El plan vigente del afiliado que está haciendo la consulta"),
    ciudad: z.enum(ciudad as [string, ...string[]]).nullable().describe("La ciudad donde se busca"),
    document_id: z.enum(document_id as [string, ...string[]]).nullable().describe("El document_id/nombre del documento para buscar en la metadata, esto es informacion interna no visible para el usuario"),
    keywords: z.enum(keywords as [string, ...string[]]).nullable().describe("Las palabras claves para buscar en la metadata, no visibles para el usuario"),
  });

  return schema;
};

  /**
   * Builder de schema de metadata para el tool de builder
   * @returns Schema de metadata
   */
  export const builderToolMetadataSchema = async (): Promise<
    z.ZodObject<any>
  > => {
    const { data, error } = await supabaseClient.rpc(
      "documents_md_get_metadata",
      { p_limit: 100, p_offset: 0 },
    );
    if (error) throw error;

    const dataWithMetadata = pickMetadataFieldsTS(data);

    const aggRaw = aggregateOptionsStrict(dataWithMetadata, { mode: "raw" });

    

    const schema = builderMetadataSchema(aggRaw);

    return schema;
};


