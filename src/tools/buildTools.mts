// import {createDynamicSearchTool} from "../supabase/get_metadata.mjs";
// import { supabaseClient } from "../supabase/supabaseClient.mjs";
// import { makeFAQRetriever } from "../retrievers/retrieverFAQ.mjs";
// import { tool } from "@langchain/core/tools";
// import { ChatOpenAI } from "@langchain/openai";
// import { builderToolMetadataSchema } from "../supabase/buildFilters.mjs";
// import { z } from "zod";

// export const documentsMdTool = await createDynamicSearchTool(supabaseClient, {
//     tableName: 'documents_md',
//     toolName: 'search_prestadores',
//     description: 'Busca prestadores médicos, farmacias, ópticas, etc.',
//     rpcFunction: 'documents_md_get_metadata',
//     excludeKeys: ['document_type', 'vigencia'],
//     descriptions: {
//       zona: 'Zona de búsqueda',
//       planes: 'Plan del afiliado',
//       ciudad: 'Ciudad',
//     },
//     searchFunction: async (input) => {
//       // Lógica de búsqueda
//       console.log('input en la tool documentsMdTool', input);
//       return { success: true, results: [] };
//     },
//   });
  
//   export const planDocumentsTool = await createDynamicSearchTool(supabaseClient, {
//     tableName: 'plan_documents',
//     toolName: 'search_plan_info',
//     description: 'Busca información de planes de salud',
//     rpcFunction: 'plan_documents_get_metadata',
//     includeKeys: ['plan', 'categoria_prestacion', 'ciudad'],
//     descriptions: {
//       plan: 'Plan del afiliado',
//       categoria_prestacion: 'Categoría de prestación',
//     },
//     searchFunction: async (input) => {
//       // Lógica de búsqueda
//       console.log('input en la tool planDocumentsTool', input);
//       return { success: true, results: [] };
//     },
//   });



//   // Dep: zod
//   // Inspeccionamos tools


// // Desanidar opcional/nullable hasta el tipo base (enum, literal, string, etc.)
// function unwrapZod(schema: any): any {
//   let s = schema;
//   while (s?._def?.innerType) s = s._def.innerType;
//   return s;
// }

// // Extraer "shape" de un ZodObject independientemente de la versión
// function getZodShape(zodObj: any): Record<string, any> {
//   if (!zodObj) return {};
//   if (zodObj.shape) return zodObj.shape;
//   if (zodObj._def?.shape) return zodObj._def.shape();
//   return {};
// }

// // Imprime name, description y los campos del schema con sus valores permitidos (si aplican)
// function inspectTool(tool: any) {
//   console.log("name:", tool.name);
//   console.log("description:", tool.description);

//   const schema = tool.schema as z.ZodObject<any>;
//   const shape = getZodShape(schema);

//   const fields = Object.entries(shape).map(([key, fieldSchema]: [string, any]) => {
//     const inner = unwrapZod(fieldSchema);
//     const typeName = inner?._def?.typeName;

//     // Valores posibles si es enum o literal
//     let allowed: unknown = undefined;
//     if (typeName === "ZodEnum") {
//       allowed = inner?._def?.values ?? [];
//     } else if (typeName === "ZodLiteral") {
//       allowed = [inner?._def?.value];
//     }

//     // Descripción si está disponible
//     const description = typeof inner?.description === "string"
//       ? inner.description
//       : typeof fieldSchema?.description === "string"
//       ? fieldSchema.description
//       : undefined;

//     return { key, type: typeName, description, allowed };
//   });

//   console.log("schema:");
//   for (const f of fields) {
//     console.log(` - ${f.key}: ${f.type}${f.description ? ` — ${f.description}` : ""}`);
//     if (Array.isArray(f.allowed)) {
//       console.log(`   valores: ${f.allowed.join(", ")}`);
//     }
//   }
// }

// // Ejemplos de uso (descomenta lo que necesites):
// // inspectTool(documentsMdTool);


// // De esta manera obtengo el schema de la tool, la invoko según la consulta y me devuelve los argumentos con los cuales puedo realizar una busqueda

// const schema = await builderToolMetadataSchema()

// // console.log("schema in buildTools.mts: ", schema.shape);

// const planTool = tool(async (input: z.infer<typeof schema>) => {
//   console.log("input in planTool: ", input);

// const top_k = 6;
// const filters = {...input.toolArgs}

// const userId = "cb11c35c-d95c-4ae5-aa33-3fa683230bd6";
// const agentId = undefined;

//   const retriever = await makeFAQRetriever(userId, agentId, filters,top_k ?? 6);

//   // 2) Consulta de similitud usando la pregunta original
//   const q = input.q;
//   const docs = await retriever.invoke(q);

//   // 3) Devolver al modelo un JSON legible (máximo 3–6 trozos)
//   const out = docs.slice(0, top_k ?? 6).map((d) => ({
//     id: (d as any).id ?? d.metadata?.id ?? null,
//     document_id: d.metadata?.document_id,
//     ciudad: d.metadata?.ciudad,
//     categoria: d.metadata?.categoria,
//     planes: d.metadata?.planes,
//     zona: d.metadata?.zona,
//     prioridad: d.metadata?.prioridad,
//     vigencia: d.metadata?.vigencia,
//     snippet: d.pageContent?.slice(0, 1200), // evita contextos gigantes
//   }));

//   return JSON.stringify({ matches: out });
//   // return "Respuesta de la pregunta del usuario";
// }, {
//   name: "plan_tool",
//   description: "Tool para buscar información de planes de salud",
//   schema: z.object({
//     toolArgs: schema,
//     q: z.string().describe("Consulta realizada por el usuario"),
   
//   }),
// });

// const model = new ChatOpenAI({
//   model: "gpt-4o",
//   apiKey: process.env.OPENAI_API_KEY,
//   temperature: 0,
// }).bindTools([planTool], { strict: true});

// // CON ESTO YA PUEDO INVOKAR A LA HERRAMIENTA Y GENERAR LOS FILTROS NECESARIOS
// // const response = await model.invoke("¿Cual es el arancel diferenciado por sesion de psicologia en la plata?");
// // console.dir(response, {depth: null});

// // “Reglas” en tu tool para no auto-excluir el plan

// // No metas document_id salvo que el usuario lo pida explícitamente (bloquea todo lo demás).

// // Si la pregunta menciona arancel/copago/precio/costo, forzá document_type = "plan_prestaciones" y NO metas zona.

// // Enviá arrays en planes/zona/keywords (aunque haya 1 valor).
// const response = await planTool.invoke(  {
//   toolArgs: {
//     zona: 'la_plata',
//     planes: null,
//     ciudad: 'la_plata',
//     document_id: '',
//     keywords: 'psicología'
//   },
//   q: 'arancel diferenciado por sesión de psicología en La Plata'


// });
// console.log("response in buildTools.mts: ", response);

// const res = {"matches":[{"id":null,"document_id":"faq_psicologia_la_plata_2025_04","ciudad":"la_plata","categoria":"psicologia","planes":["plan_a_basic","b1","superior","elite"],"zona":["la_plata"],"prioridad":1,"vigencia":"2025-04","snippet":"# Psicología - La Plata\r\n\r\n## Convenio de Psicología\r\n\r\n### Colegio de Psicólogos de La Plata\r\nTenemos convenio con el **Colegio de Psicólogos de La Plata**.\r\n\r\n**Cartilla online:** www.primedicsalud.com.ar/psicologia\r\n\r\n## Preguntas Frecuentes\r\n\r\n### ¿Qué psicólogos tengo disponibles?\r\n**Respuesta:**\r\nTenemos convenio con el **Colegio de Psicólogos de La Plata**. La cartilla de prestadores podés consultarla en: **www.primedicsalud.com.ar/psicologia**\r\n\r\nSi preferís, también podés solicitar el PDF de la cartilla por WhatsApp (221-399-1351).\r\n\r\n### ¿Dónde me puedo atender en psicología?\r\n**Respuesta:**\r\nCon cualquier psicólogo del Colegio de Psicólogos de La Plata. Consultá la cartilla en: www.primedicsalud.com.ar/psicologia\r\n\r\n### ¿Cómo obtengo la cartilla de psicólogos?\r\n**Respuesta:**\r\nPodés consultarla online en www.primedicsalud.com.ar/psicologia o pedirla en PDF por WhatsApp al 221-399-1351.\r\n\r\n### ¿Necesito autorización previa?\r\n**Respuesta:**\r\nConsultá en administración sobre los requisitos de autorización para sesiones de psicología.\r\n\r\n## Variantes de la Pregunta\r\n\r\n- psicólogo la plata\r\n- terapia la plata\r\n- salud mental\r\n- cartilla psicólogos\r\n- colegio de psicólogos\r\n- "}]}

// console.log("res in buildTools.mts: ", res);  