import { makeDocumentsMdRetriever , type DocumentsMdFilters} from "../retrievers/FAQretriever.mjs";
import { makePlanDocumentsRetriever , type PlanDocFilters} from "../retrievers/planDocRettriever.mjs";
// import { buildSchemaFromSupabase } from "../supabase/metadataUtils.mjs";
// import { supabaseClient } from "../supabase/supabaseClient.mjs";
import dotenv from "dotenv";
dotenv.config();

// Una herramienta que me devuelva todos los valores posibles de ciudad, planes y keywords
export const buildRetriever = (table: string , filters?: Record<string, any>) => {
  if(table === "documents_md") {
    return makeDocumentsMdRetriever(filters as DocumentsMdFilters);
  } else if(table === "plan_documents") {
    return makePlanDocumentsRetriever(filters as PlanDocFilters);
  } else {
    throw new Error("Table not found");
  }
}



// const retrieverPlanDocuments = await makePlanDocumentsRetriever(
//   {
//     ciudad: "magdalena",                  // si no lo pasás, no filtra por ciudad
//     planes: ["plan_a_basic", "b1"],       // opcional
//     keywords: ["internación", "clínicas"], // opcional
//   },
//   {
//     k: 6,
//     scoreThreshold: 0.25,                 // opcional
//   }
// );

// const docs = await retrieverPlanDocuments.invoke(
//   "¿Qué cubre internación para el plan basic en Magdalena?"
// );

// const docs = await retriever.invoke(
//   "¿Qué clínicas cubre el plan basic en Magdalena para internación?"
// );


// buildSchemaFromSupabase(supabaseClient, 'documents_md', {
//     rpcFunction: 'plan_documents_get_metadata',
//     limit: 100,
//     offset: 0,
//     excludeKeys: [], // Campos internos
//     includeKeys: [], // Solo estos
//     descriptions: {
      
//     },
//   }).then((schema) => {
//     console.log(schema);
//   }).catch((error) => {
//     console.error(error);
//   });

// src/db/planDocumentsFacets.ts
import { createClient } from "@supabase/supabase-js";

export type PlanDocFacets = {
  ciudades: string[];
  planes: string[];
  keywords: string[];
  sample_count: number;
};

// traer los valores posibles de ciudad, planes y keywords de la tabla plan_documents *********************************************************************************
// export async function fetchPlanDocumentsFacets(params?: {
//   userId?: string | null;
//   agentId?: string | null;
//   normalize?: boolean; // default true
// }): Promise<PlanDocFacets> {
//   const supabase = createClient(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ server-side only
//   );

//   const { data, error } = await supabase.rpc("get_plan_documents_facets", {
//     p_user_id: params?.userId ?? null,
//     p_agent_id: params?.agentId ?? null,
//     p_normalize: params?.normalize ?? true,
//   });

//   if (error) throw error;
//   // La RPC devuelve una sola fila
//   const row = Array.isArray(data) ? data[0] : data;
//   return {
//     ciudades: row?.ciudades ?? [],
//     planes: row?.planes ?? [],
//     keywords: row?.keywords ?? [],
//     sample_count: row?.sample_count ?? 0,
//   };
// }

// const facets = await fetchPlanDocumentsFacets({
//     userId: "cb11c35c-d95c-4ae5-aa33-3fa683230bd6",  // o tu user_id si querés scoping
//     agentId: null, // idem
//   });
  
//   console.log(facets.ciudades); // p.ej. ["la_plata","todas"]
//   console.log(facets.planes);   // p.ej. ["plan a basic","b1", ...]
//   console.log(facets.keywords); // p.ej. ["internacion","clinicas", ...]

// Con scoreThreshold la busqueda es mas fina, evitar y que lo analice el agente *********************************************************************************


// traer los valores posibles de ciudad, planes y keywords de la tabla documents_md *********************************************************************************

/*
{
  ciudades: [ 'chascomus', 'la_plata', 'magdalena', 'todas' ],
  planes: [ 'b1', 'elite', 'plan_a_basic', 'superior' ],
  keywords: [
    'administracion',              'afalp',                    'afiliaciones',
    'agremiacion medica platense', 'agremiacion odontologica', 'ambulancia',
    'amp',                         'analisis',                 'anteojos',
    'aolp',                        'asistente virtual',        'b1',
    'baioni',                      'bavio',                    'berisso',
    'bioquimico',                  'boca',                     'breast',
    'cardiologia',                 'casa central',             'centro de salud',
    'centro integral',             'centro medico bolivar',    'centros especializados',
    'chascomus',                   'cim',                      'circulo medico',
    'circulo odontologico',        'cirmedc',                  'cirugia',
    'clinica modelo',              'clinicas',                 'colegio de psicologos',
    'consulta',                    'contacto',                 'corpus',
    'creaa',                       'dean funes',               'dentista',
    'descuento',                   'diagnostico',              'dientes',
    'direccion',                   'doctores',                 'ecografia',
    'elite',                       'emergencias',              'ensenada',
    'especialistas',               'estudios',                 'faba',
    'factura',                     'farmacias',                'federacion medica',
    'femeba',                      'fisioterapia',             'fonoaudiologia',
    'fonoaudiologo',               'guardia',                  'habla',
    'hospital',                    'hospital italiano',        'ifi',
    'imagenes',                    'internacion',              'ipensa',
    'kinesiologia',                'la plata',                 'laboratorios',
    'lenguaje',                    'lentes',                   'magdalena',
    'mamografia',                  'mazzoni',                  'medicamentos',
    'medicos',                     'odontologia',              'odontologo',
    'oftalmologia',                'opticas',                  'plan basic',
    'premium',                     'psicologia',               'psicologo',
    'radiografia',                 'receta',                   'rehabilitacion',
    'reintegro',                   'remedios',                 'resonancia',
    'salud mental',                'sanatorios',               'sangre',
    'sipem',                       'sociedad odontologica',    'solp',
    'stylo',                       'sucursal',                 'superior',
    'telefono',                    'terapia',                  'tomografia',
    'tratamientos especificos',    'urgencia medica',          'urgencias',
    'vista',                       'whatsapp'
  ],
  sample_count: 37
}
*/

export type DocumentsMdFacets = {
  ciudades: string[];
  planes: string[];
  keywords: string[];
  sample_count: number;
};

export async function fetchDocumentsMdFacets(params?: {
  userId?: string | null;
  agentId?: string | null;
  normalize?: boolean; // default true
}): Promise<DocumentsMdFacets> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ server-side only
  );

  const { data, error } = await supabase.rpc("get_documents_md_facets", {
    p_user_id: params?.userId ?? null,
    p_agent_id: params?.agentId ?? null,
    p_normalize: params?.normalize ?? true,
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return {
    ciudades: row?.ciudades ?? [],
    planes: row?.planes ?? [],
    keywords: row?.keywords ?? [],
    sample_count: row?.sample_count ?? 0,
  };
}
// *********************************************************************************





//   const retrieverPlanDocuments = await makePlanDocumentsRetriever(
//     { ciudad: "la_plata", planes: ["plan_a_basic"], keywords: ["internaciones"] },
//     { k: 6 , scoreThreshold: 0.25 }
//   );

//   // buscar:
// const docs = await retrieverPlanDocuments.invoke(
//     "¿Qué cubre internación para el plan basic?"
//   );

//   console.log(docs);
//   console.log("---------------")

//   // ejemplo de lectura
// for (const d of docs) {
//     console.log(d.metadata?.document_id, d.metadata?.ciudad, d.pageContent.slice(0, 120));
//   }

// const query = "¿Qué cubre internación para el plan basic?";

// // A) sin filtros ni threshold (debe traer algo sí o sí)
// const rA = await makePlanDocumentsRetriever({}, { k: 6 });
// const dA = await rA.invoke(query);
// console.log("A sin filtros:", dA.length);

// // B) solo ciudad
// const rB = await makePlanDocumentsRetriever({ ciudad: "la_plata" }, { k: 6 });
// const dB = await rB.invoke(query);
// console.log("B solo ciudad:", dB.length);

// // C) ciudad + planes (sin threshold)
// const rC = await makePlanDocumentsRetriever(
//   { ciudad: "la_plata", planes: ["plan_a_basic"] },
//   { k: 6 }
// );
// const dC = await rC.invoke(query);
// console.log("C ciudad+planes:", dC.length);

// // D) ciudad + planes + keywords (sin threshold)
// const rD = await makePlanDocumentsRetriever(
//   { ciudad: "la_plata", planes: ["plan_a_basic"], keywords: ["internaciones"] },
//   { k: 6 }
// );
// const dD = await rD.invoke(query);
// console.log("D +keywords:", dD.length);

// // E) igual que D pero con threshold 0.25
// const rE = await makePlanDocumentsRetriever(
//   { ciudad: "la_plata", planes: ["plan_a_basic"], keywords: ["internaciones"] },
//   { k: 6, scoreThreshold: 0.25 }
// );
// const dE = await rE.invoke(query);
// console.log("E +threshold 0.25:", dE.length);



