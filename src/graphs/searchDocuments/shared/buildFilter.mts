import {ChatOpenAI} from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {MessagesPlaceholder} from "@langchain/core/prompts";
import {listOfDocuments} from "./retrieval.mjs";
import {z} from "zod";
import dotenv from "dotenv";
dotenv.config();

// Me traigo todos los títulos de los documentos que hay en la base de datos
const buildSchema = async () => {
    const {titleByDocument}:{titleByDocument: string[]} = await listOfDocuments();
    console.log("titleByDocument linee 10 - buildFilter.mts : >>>>>")
    console.dir(titleByDocument, {depth: null});

    const schema = z.object({
        title: z.enum(titleByDocument as [string, ...string[]]).describe("El titulo del documento que me interesa").nullable(),
        question: z.string().describe("La pregunta del usuario gramaticalmente corregida de ser necesario").nullable(),
    })
    console.log("schema linee 15 - buildFilter.mts : >>>>>")
    console.dir(schema, {depth: null});
    return schema;
}

const BUILD_FILTER_SYSTEM_PROMPT = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Sos un asistente de primedic salud, que se encarga de analizar la pregunta , consulta o mensaje del usuario e identificar a que titulo de documento se refiere, para luego poder filtrar los documentos que se van a recuperar.

      Primedic salud esa obra social ubicada en la ciudad de la plata que ofrece sus servicos en , la plata, brandsen, chascomus, magdalena, gran la plata, los hornos, berisso, ensenada.

      Tenés una gran gama de prestadores, tanto como psicologia, odontologia, espcialidades medicas, farmacias, clinicas, sanatorios, y más.
      contas con el CIM que es el 'centro integral de medicina' que es un centro de salud que ofrece servicios de medicina general.

      Los planes son:
      - Plan A basic
      - Plan superior B1
      - Plan superior B2
      - Plan Elite

      tu tarea principal es identificar en base a la pregunta, consulta o mensaje del usuario, a que titulo de documento se refiere, para luego poder filtrar los documentos que se van a recuperar.

      adicionalmente tambien deberas darle forma y corregir gramaticalmente de ser necesario la pregunta del usuario para que sea mas facil de entender y procesar.
  `
    ],
    new MessagesPlaceholder("list_of_titles"),
  
    ["human", "{query}"],
  ]);



const model = new ChatOpenAI({
    model: "gpt-5",
    apiKey: process.env.OPENAI_API_KEY,
})



export const buildFilterByTitle = async (query: string): Promise<Record<string, any>> => {
    const schema = await buildSchema();
    const {titleByDocument}:{titleByDocument: string[]} = await listOfDocuments();
    const routingPrompt = BUILD_FILTER_SYSTEM_PROMPT;

    const formattedPrompt = await routingPrompt.invoke({
      query: query,
      list_of_titles: titleByDocument,
    });
  
    const response = await model
      .withStructuredOutput(schema).withConfig({tags: ["nostream"]})
      .invoke(formattedPrompt.toString());

    // console.log("response linee 71 - buildFilter.mts : >>>>>")
    // console.dir(response, {depth: null});
    return response;
}

export const getDocsTitlesOfSupabase = async (): Promise<string[]> => {
    try {
        const {titleByDocument}:{titleByDocument: string[]} = await listOfDocuments();
        console.log("titleByDocument linee 80 - buildFilter.mts : >>>>>")
        console.dir(titleByDocument, {depth: null});
        return titleByDocument;
        
    } catch (error) {
        console.log("error linee 86 - buildFilter.mts : >>>>>")
        console.dir(error, {depth: null});
        return [];
    }
}


export const titlesFaqs = ['FAQ_cartilla_de_prestadores_chascomus_primedic_salud.pdf',
'FAQ_cartilla_de_prestadores_plan_A_basic_primedic_salud.pdf',
'FAQ_cartilla_prestadores_plan_b1_y_plan superior_y_plan elite_primedic_salud.pdf',
'FAQ_cartilla_prestadores_sucursal_magdalena_primedic_salud.pdf',]

