// import { primedicsaludData } from "../data/prestadores.mjs";
// import {systemPromptPrestadoresTool} from "../prompts.mjs"
// import {ChatPromptTemplate} from "@langchain/core/prompts"
// import { StringOutputParser } from "@langchain/core/output_parsers";
// import {z} from "zod"
// import { ChatAnthropic } from "@langchain/anthropic";
// import { tool } from "@langchain/core/tools";  




// export const prestadoresTool = tool(
//     async ({query}:{query: string})=>{

//         try{

//         const model = new ChatAnthropic({
//             model: "claude-sonnet-4-20250514",
//             temperature: 0,
//         }).withConfig({tags: ["nostream"]})
//         const templateCompleto = ChatPromptTemplate.fromTemplate(
//             ` {contexto}

//             Informacion sobre prestadores: {primedicsaludData}
          
//           Pregunta del usuario: {query}
          
//         `
//           );
//           console.log("qyery del ususario", query)
//           const chainCompleto = templateCompleto.pipe(model).pipe(new StringOutputParser());

          

//           const response = await chainCompleto.invoke({
//             contexto: systemPromptPrestadoresTool,
//             primedicsaludData: JSON.stringify(primedicsaludData),
//             query: query,
//           })

//           console.log("=== PROMPT FORMATEADO ===");
//           console.dir(response, {depth: null});
//           console.log("=========================");


//           console.log("response in prestadoresTool: ", response)
//           return response
//         }catch(error){
//             console.log("error in prestadoresTool: ", error)
//             return "No se pudo obtener la información de los prestadores"
//         }
//     },
//     {
//     name: "buscar_prestador_primedicsalud",
//     description: "Busca prestadores de salud de Primedic Salud según ubicación, especialidad o tipo de servicio, pueden ser servicios generales, especialidades médicas, servicios específicos, ubicaciones",
//     schema: z.object({
//       query: z.string().describe("La consulta del usuario, por ejemplo: 'Quiero buscar un odontólogo en la ciudad de La Plata','Con que farmacias tengo descuentos','Quiero sacar un turno para kinesiología' ") ,
//     }),
 
// })