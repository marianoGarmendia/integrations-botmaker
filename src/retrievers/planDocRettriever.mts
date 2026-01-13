// src/retrievers/planDocumentsRetriever.ts
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";

export type PlanDocFilters = {
  ciudad?: string;              // ej: "magdalena"
  planes?: string | string[];   // OR interno
  keywords?: string | string[]; // OR interno
};

export type PlanDocRetrieverOptions = {
  k?: number;                 // top-k (default 5)
  scoreThreshold?: number;    // 0..1 (opcional)
  embeddingModel?: string;    // default "text-embedding-3-small"
};

function toArray(v?: string | string[]) {
  if (v == null) return undefined;
  return Array.isArray(v) ? v : [v];
}

function buildFilterJson(f: PlanDocFilters): Record<string, any> {
  const filter: Record<string, any> = {
    ciudad: f.ciudad,
    planes: toArray(f.planes),
    keywords: toArray(f.keywords),
  };
  for (const k of Object.keys(filter)) {
    if (filter[k] == null) delete filter[k];
    if (Array.isArray(filter[k]) && filter[k].length === 0) delete filter[k];
  }
  return filter;
}

/*
ciudad: [ 'la_plata', 'todas' ]
planes: [ 'elite', 'plan_a_basic', 'superior' ]
keywords: [
  'ambulancia',
  'amp',
  'analisis',
  'anteojos',
  'aportes',
  'asistencia al viajero',
  'bebe',
  'bioquimica',
  'cargas virales',
  'categorias profesionales',
  'cesarea',
  'cim',
  'cirugia refractiva',
  'cirugias',
  'cirugias laparoscopicas',
  'clinicas',
  'cobertura',
  'cobertura por fallecimiento',
  'consultas',
  'contribuciones',
  'copagos',
  'credencial virtual',
  'dentista',
  'desregulacion',
  'diagnostico',
  'doppler',
  'ecografias',
  'embarazo',
  'emergencias',
  'especialidades',
  'farmacia',
  'fisiatria',
  'fonoaudiologia',
  'honorarios medicos',
  'hormonas',
  'implantes',
  'internaciones',
  'kinesiologia',
  'laboratorio',
  'lentes',
  'mamografias',
  'maternidad',
  'medicamentos',
  'medicos',
  'odontologia',
  'opticas',
  'ortesis',
  'ortodoncia',
  'parto',
  'plan b1',
  'plan basic',
  'plan elite',
  'plan superior',
  'pmo',
  'prepaga',
  'protesis',
  'psicologia',
  'psicologo',
  'psiquiatria',
  'radiografias',
  'recetas',
  'rehabilitacion',
  'reintegro',
  'resonancias',
  'salud mental',
  'seguro de sepelio',
  'sin bonos',
  'sin recetarios',
  'terapia',
  'terapia intensiva',
  'tomografias',
  'traslados',
  'urgencias',
  'vademecum',
  'vitaminas'
]

*/

/**
 * Retriever para la tabla `plan_documents` usando el RPC `match_plan_documents`,
 * con filtros opcionales de ciudad, planes y keywords.
 */
export async function makePlanDocumentsRetriever(
  filters: PlanDocFilters,
  opts: PlanDocRetrieverOptions = {}
): Promise<BaseRetriever> {
  const {
    k = 5,
    scoreThreshold,
    embeddingModel = "text-embedding-3-small",
  } = opts;

  const embeddings = new OpenAIEmbeddings({ model: embeddingModel });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ backend-only
  );

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: "plan_documents",
    queryName: "match_plan_documents",
  });

  const filter = buildFilterJson(filters);

  if (scoreThreshold == null) {
    // camino simple y rápido
    return vectorStore.asRetriever({ k, filter });
  }

  // camino con threshold (descarta resultados flojos)
  return new (class extends BaseRetriever {
    lc_namespace = ["custom", "supabase", "planDocumentsRetriever"];
    async _getRelevantDocuments(query: string): Promise<Document[]> {
      const fetchN = Math.max(k * 3, 20);
      const pairs = await vectorStore.similaritySearchWithScore(query, fetchN, filter);
      return pairs
        .filter(([, s]) => (s ?? 0) >= scoreThreshold)
        .slice(0, k)
        .map(([d]) => d);
    }
  })();
}
