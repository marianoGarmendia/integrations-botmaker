import { ChatOpenAI } from "@langchain/openai";
import {
  StateGraph,
  END,
  START,
  MessagesAnnotation,
  Annotation,
} from "@langchain/langgraph";
// import { HumanMessage } from "@langchain/core/messages";
import { ToolNode  } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
// import { tool } from "@langchain/core/tools";
// import { getDocsTitlesOfSupabase } from "../shared/buildFilter.mjs";

// import { createPrimedicsaludSearchTool } from "../retrieval_graph/prestadores-graph-v1.js";
// import { prestadoresTool } from "../tools/prestadoresTool.mjs";
// import { graph as retrievalGraph } from "../retrieval_graph/graph.mjs";
// import { createRetrieverTool } from "langchain/tools/retriever";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
import { trimMessages, SystemMessage } from "@langchain/core/messages";
// import {evaluatorChain} from "../evaluation_graph/graph.mjs";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
// import { formatDocumentsAsString } from "langchain/util/document";
// import { PromptTemplate } from "@langchain/core/prompts";
import { SYSTEM_PROMPT_PRIMEDIC } from "../prompts.mjs";
// import {
//   RunnableSequence,
//   RunnablePassthrough,
// } from "@langchain/core/runnables";
// import { createPrimedicSystemPrompt } from "../config.mjs";
import {
  isMissingToolResponseError,
  ensureToolResponses,
} from "../fixers/toolResponses.mjs";
// import { extractText } from "../shared/full_rag.mjs";
// import { makeRetriever } from "../shared/retrieval.mjs";
import { FaqsToolRetriever } from "../../../tools/faq_tool.mjs";
import { PlansToolRetriever } from "../../../tools/plan_documents_tool.mjs";
import { z } from "zod";

// import { makeSupabaseRetriever } from "../shared/retrieval.mjs";
// import { z } from "zod";

// import { z } from "zod";
import { AIMessage } from "@langchain/core/messages";
import { prompt_faqs_context } from "../prompts.mjs";
import dotenv from 'dotenv';
dotenv.config();

// TODO: trim de mensajes para evitar que el estado se haga muy grande
//https://chatgpt.com/c/68c446cc-e44c-8331-aa05-e9aab954d760 [como hacerlo]

// const retrieverTool = tool(
//   async ({query}:{query: string})=>{
//     try{
// const responseRetrieval = await retrievalGraph.invoke({query: query})
// return responseRetrieval
//     }catch(error){
//       console.log("error in retrieverTool: ", error)
//       return "No se pudo obtener la información de los documentos"
//     }

//   },{

//     name: "retriever_tool",
//     description: "Recupera documentos y responde sobre cartilla de profesionales, farmacias disponibles, odontología, especialidades médicas, prestadores, telefonos de profesionales, de clinicas, psicologos y todo lo que no encuentra en el contexto disponible a la hora de responder la consulta del usuario, por eso ésta herrameinta debe llamarse cuando no encuetra la respuesta en el contexto disponible",
//     schema: z.object({
//       query: z.string().describe("La query del usuario, conformada de manera tal que genere una búsqueda vectorial efectiva"),
//     }),
//   }
// )

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function invokeWithBackoff<T>(
  attempts: number,
  fn: () => Promise<T>,
): Promise<T> {
  console.log("invoking with backoff");
  let delayMs = 250;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err: any) {
      const overloaded =
        err?.error?.type === "overloaded_error" ||
        /Overloaded/i.test(err?.message || "");
      if (!overloaded || i === attempts - 1) throw err;
      console.log("overloaded error");
      await sleep(delayMs);
      delayMs *= 2;
    }
  }
  // Should never reach here
  throw new Error("invokeWithBackoff failed unexpectedly");
}

const stateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  afiliate: Annotation<string>,
  isFaq: Annotation<boolean>,
  firstNodeResponse: Annotation<{
    answer: string;
    question: string;
    isFaq: boolean;
  }>,
  profile: Annotation<{
    isAfiliate: boolean;
    plan: string;
    localidad: string;
  }>,
  profileIsComplete: Annotation<boolean>,
  volver_al_menu: Annotation<boolean>({
    value: (_prev, next) => next, // último valor gana
    default: () => false,
  }),
});

const schema = z.object({
  isAfiliate: z.boolean(),
  plan: z.string(),
  localidad: z.string(),
  profileIsComplete: z.boolean(),
 
});
const profileTool = tool(
  async ({ query }: { query: string }) => {


    // const systemMessage = new SystemMessage(`
    //   Eres asistente de primedic salud, una obra social de la plata, magdalena, chascomus y brandsen.
    //    Eres encargado de determinar el perfil del usuario para poder responderle mejor.
    //   Tendras una salida estructurada con el siguiente esquema:
    //   {
    //     isAfiliate: boolean;
    //     plan: string;
    //     localidad: string;
    //   }

    //   ## Contexto de la pregunta del usuario:
    //   ${query}
    //   `)

    //   const model = new ChatOpenAI({
    //     model: "gpt-4o",
    //     temperature: 0,
    //   })
    //   .withStructuredOutput(schema)
    //   .withConfig({ tags: ["nostream"] });


  
    return { query };
  },
  {
    name: "profile_tool",
    description: "Obtiene la información del perfil del usuario",
    schema: schema,
  },
);

// Lista de herramientas
const tools = [FaqsToolRetriever, PlansToolRetriever, profileTool];

 const systemMessageProfile = new SystemMessage(`
      Eres asistente de primedic salud, una obra social de la plata, magdalena, chascomus y brandsen.
       Eres encargado de determinar el perfil del usuario para poder responderle mejor.
      Tendras una salida estructurada con el siguiente esquema:
      {
        isAfiliate: boolean;
        plan: string;
        localidad: string;
      }

      ## Contexto de la pregunta del usuario:
   
      `)


// Configurar modelo con herramientas
const model = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY ,
  temperature: 0,
})
  .bindTools(tools)
  .withConfig({ tags: ["nostream"] });

// Crear ToolNode
const toolNode = new ToolNode(tools);

// Definir nodo LLM
const llmNode = async (state: typeof stateAnnotation.State) => {
  const { messages } = state;

// Dtermino esl perfil del usuario
  const agentProfile = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
  })
  .bindTools([profileTool], { tool_choice: "profile_tool", strict: true })
  .withConfig({ tags: ["nostream"] });

  const responseAgentProfile = await agentProfile.invoke([systemMessageProfile, ...messages]);
  console.log("responseAgentProfile linee 226 - agent_graph/graph.ts : >>>>>");
  // console.log(responseAgentProfile);
  const toolArgs = responseAgentProfile.tool_calls?.[0]?.args;
  console.log("toolArgs linee 242 - agent_graph/graph.ts : >>>>>");
  // console.log(toolArgs);

  const profileComplete = toolArgs?.profileIsComplete;



  const systemMessageInitial = new SystemMessage(`
    Eres un asistente inteligente y tu tarea es identificar si la pregunta del usuario puede ser respondida con la información disponible en el contexto dentro de las preguntas frecuentes.
    También debes detectar si el usuario desea volver al menú principal.
    
    IMPORTANTE: Si el usuario responde con un mensaje de cierre/despedida/agradecimiento FINAL (por ejemplo: "gracias", "muchas gracias", "bueno gracias", "listo gracias", "ok gracias", "chau", "hasta luego", "nos vemos") y NO incluye una nueva pregunta/pedido (ej: no agrega "y ...", no pregunta algo, no solicita otra cosa), entonces debes marcar volver_al_menu = true.
    Si el usuario agradece pero además hace una nueva consulta (ej: "gracias, y dónde queda?", "gracias, pero necesito otra cosa"), entonces volver_al_menu = false.
    
    CONTEXTO CONVERSACIONAL (CLAVE): Debes mirar el ÚLTIMO mensaje del asistente en el historial.
    - Si el último mensaje del asistente fue una pregunta/confirmación/ofrecimiento (ej: "¿querés que te comparta el enlace...?", "¿te lo paso?", "¿querés que lo busque?") y el usuario responde afirmando aunque incluya agradecimiento (ej: "sí gracias", "dale gracias", "ok gracias"), eso NO es una finalización. En ese caso volver_al_menu = false.
    Tendras una salida estructurada con el siguiente esquema:

    {
    answer: // La respuesta a la pregunta del usuario si la encontraste en el contexto de las preguntas frecuentes
    question: // La pregunta del usuario
    isFaq: // Booleano que indica si la pregunta fue encontrada en el contexto de las preguntas frecuentes
    volver_al_menu: // Booleano que indica si el usuario desea volver al menu principal
    }

    ## Contexto de las preguntas frecuentes:
    ${prompt_faqs_context}
    `);

  const schema = z.object({
    answer: z
      .string()
      .describe(
        "La respuesta a la pregunta del usuario si la encontraste en el contexto de las preguntas frecuentes",
      ),
    question: z.string().describe("La pregunta del usuario"),
    isFaq: z
      .boolean()
      .describe(
        "Booleano que indica si la pregunta fue encontrada en el contexto de las preguntas frecuentes",
      ),

    volver_al_menu: z.boolean().describe("true si el usuario quiere volver al menú o si su mensaje es un cierre/despedida/agradecimiento FINAL (ej: 'gracias', 'muchas gracias', 'bueno gracias', 'listo gracias', 'ok gracias', 'chau', 'hasta luego') y NO incluye una nueva pregunta/pedido. Si agradece pero además consulta algo nuevo (ej: 'gracias, y dónde queda?'), debe ser false."),
  });

  const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
  })
    .withStructuredOutput(schema)
    .withConfig({ tags: ["nostream"] });

  const response = await llm.invoke([systemMessageInitial, ...messages]);
  console.log("response linee 346 - agent_graph/graph.ts : >>>>>");
  console.log(response);

  if(response.volver_al_menu) {
    return { messages: [new AIMessage("")], volver_al_menu: true };
  }

  if(response.isFaq && profileComplete) {
    return { messages: [new AIMessage(response.answer)] , volver_al_menu: false };
  }


// trimeed messages unused for now
  const trimmed = await trimMessages(messages, {
    // Keep the last <= n_count tokens of the messages.
    strategy: "last",
    // Remember to adjust based on your model
    // or else pass a custom token_encoder
    tokenCounter: new ChatOpenAI({ modelName: "gpt-4o" }),
    // Remember to adjust based on the desired conversation
    // length
    maxTokens: 45,
    // Most chat models expect that chat history starts with either:
    // (1) a HumanMessage or
    // (2) a SystemMessage followed by a HumanMessage
    startOn: "human",
    // Most chat models expect that chat history ends with either:
    // (1) a HumanMessage or
    // (2) a ToolMessage
    endOn: ["human", "tool"],
    // Usually, we want to keep the SystemMessage
    // if it's present in the original history.
    // The SystemMessage has special instructions for the model.
    includeSystem: true,
  });

  console.log("trimmed linee 114 - agent_graph/graph.ts : >>>>>");
  console.log(trimmed);

  // return { messages: new AIMessage(`En este momento estamos configurando el asistente... `) };

  // const evaluatorResponse = await invokeWithBackoff(5, () =>
  //   evaluatorChain.invoke({
  //     question: messages[messages.length - 1].content
  //   })
  // )
  // console.log("evaluatorResponse linee 111 - agent_graph/graph.ts : >>>>>")
  // console.log(evaluatorResponse)

  // const systemMessage = isFaqRetriever ? createPrimedicSystemPrompt({faqData: evaluatorResponse.isFaq}) : createPrimedicSystemPrompt({faqData: false})

  const systemMessage = SYSTEM_PROMPT_PRIMEDIC;

  // const AIMessageFAQ = isFaqRetriever ? new AIMessage(`contexto para responder la consulta del usuario sugerencia del agente evaluador de FAQS: ${respuestaNumerada}`) : new AIMessage(`No se ha podido obtener respuestas de las preguntas frecuentes para esta consulta, evalúa otras opciones`)

  const responseEnsureToolResponse = await invokeWithBackoff(5, async () => {
    try {
      console.log("invoke model without fixer");
      return await model.invoke([systemMessage, ...messages]);
    } catch (err) {
      if (isMissingToolResponseError(err)) {
        const fixed = await ensureToolResponses(trimmed);
        console.log("invoke model with fixer");
        return await model.invoke([systemMessage, ...fixed]);
      }
      throw err;
    }
  });

  // const response = await model.invoke([systemMessage, new AIMessage(`Sugerencia de respuesta del agente evaluador de FAQS: ${evaluatorResponse.answer}`),...messages ]);

  // console.log(
  //   "retriever_node_response linee 134 - agent_graph/graph.ts : >>>>>",
  // );
  // console.log(retriever_node_response);
  // console.log(
  //   "responseEnsureToolResponse linee 136 - agent_graph/graph.ts : >>>>>",
  // );
  console.log(responseEnsureToolResponse);

  return { messages: [responseEnsureToolResponse] , volver_al_menu: false };
};

// TODO:
/*
- Entrar en el nodo FaqRetriever
- intentar responder la pregunta del usuario con las preguntas frecuentes.
- si la respuesta fue encontrada en el contexto de las preguntas frecuentes, retornar la respuesta y la pregunta y el booleano isFaq = true
- si la respuesta no fue encontrada en el contexto de las preguntas frecuentes, retornar la respuesta y la pregunta y el booleano isFaq = false

// */
// const retriever_schema = z.object({
//   retriever_node_response: z.array(z.object({
//     isFaq: z.boolean().describe("Si la respuesta fue encontrada en el contexto de las preguntas frecuentes"),
//     answer: z.string().describe("La respuesta a la pregunta del usuario"),
//     question: z.string().describe("La pregunta del usuario"),
//   }))
// })

// 4) Prompt + cadena RAG
// const prompt = PromptTemplate.fromTemplate(`
//   Usa estrictamente el contexto para responder la pregunta.
//   Responde conciso y al esquema de la respuesta los valores correspondientes:

//   # Pregunta
//   {question}

//   # Contexto
//   {context}
//   `);

//   const otherAnnotation = Annotation.Root({
//     retriever_node_response:  Annotation<Record<string, any>>(),
//     isFaqRetriever: Annotation<boolean>({
//       value: (_prev, next) => next, // último valor gana
//       default: () => false,
//     }),
//     respuestaNumerada: Annotation<string>({
//       value: (_prev, next) => next, // último valor gana
//       default: () => "",
//     })
//   })

// const mergeAnnotation = Annotation.Root({
//   ...stateAnnotation.spec,
// });
// type NodeResp = { isFaq: boolean; answer: string; question: string };
// type Wrapper = { retriever_node_response: NodeResp[] };

// const FaqRetrieverNode = async (state: typeof mergeAnnotation.State , config: LangGraphRunnableConfig) => {
//   const {messages, isFaqRetriever} = state
//   console.log("isFaq linee 153 - agent_graph/graph.ts : >>>>>")
//   console.log(isFaqRetriever)
//   const lastMessage = messages[messages.length - 1] as HumanMessage
//   console.log("lastMessage linee 202 - agent_graph/graph.ts : >>>>>")
//   console.log(lastMessage)
//   const questionMessage = lastMessage.text
//   const questionMessageExtracted = extractText(lastMessage)
//   console.log("questionMessage linee 206 - agent_graph/graph.ts : >>>>>")
//   console.log(questionMessage)
//   // TODO: este filtro principal deberia ser dinamico, es decir, psaarle dinamicamente los documentos FAQS al principio.
//   // 3) Modelo y structured output

// const model = new ChatOpenAI({
//   model: "gpt-4o",
//   temperature: 0.2

// }).withStructuredOutput(retriever_schema).withConfig({tags: ["nostream"]});

// const docsTitles = await getDocsTitlesOfSupabase()

// const resultMap = docsTitles.map(async (title) => {

//   const retriever = await makeRetriever(config, {title: title})

//   const formatDocs = async (docs: any[]) =>{
//     console.log("docs linee 222 - agent_graph/graph.ts : >>>>>")
//     // console.log(docs)
//     // console.log("after docs >>>>>")
//       const context = formatDocumentsAsString(docs)
//       // console.log("context linee 209 - agent_graph/graph.ts : >>>>>")
//       // // console.log(context)
//       // console.log("after context >>>>>")
//       return context
//   }

//    const ragStructured = RunnableSequence.from([
//     {
//       question: new RunnablePassthrough(),
//       contextDocs: retriever // retriever.invoke(question) -> Document[]
//     },
//     async ({ question, contextDocs }) => ({
//       question,
//       context: await formatDocs(contextDocs)
//     }),
//     prompt,
//     model // <-- devuelve JSON ya validado por Zod
//   ]);

//   const result = await ragStructured.invoke(questionMessageExtracted);

//   // console.dir(result, {depth: null})
//   return result
// })
// const wrappers: Wrapper[] = await Promise.all(resultMap);

// // Aplano todas las respuestas y me quedo solo con las FAQ
// const onlyFaq: NodeResp[] = wrappers
//   .flatMap(w => w.retriever_node_response)
//   .filter(item => item.isFaq);

//   console.log("onlyFaq linee 260 - agent_graph/graph.ts : >>>>>")
//   // console.dir(onlyFaq, {depth: null})

// // Ejemplo: solo las answers
// const faqAnswers = onlyFaq.map(i => i.answer);

//     console.log("faqAnswers linee 266 - agent_graph/graph.ts : >>>>>")
//     console.dir(faqAnswers, {depth: null})

// // numeradas
// const respuestaNumerada = faqAnswers.length > 0 && faqAnswers
//   .filter(Boolean)
//   .map((s, i) => `${i + 1}. ${s.trim()}`)
//   .join("\n");

//   return { retriever_node_response: {} , isFaqRetriever: onlyFaq.length > 0 , respuestaNumerada: respuestaNumerada };
// }

// const firstNode = async (state: typeof stateAnnotation.State) => {
//   const { messages } = state;
//   const systemMessage = new SystemMessage(`
//     Eres un asistente inteligente y tu tarea es identificar si la pregunta del usuario puede ser respondida con la inforamcion disponible en el contexto dentro de las preguntas frecuentes.

//     Antes de cualquier respuesta, debes:



//     Tendras una salida estructurada con el siguiente esquema:

//     {
//     answer: // La respuesta a la pregunta del usuario si la encontraste en el contexto de las preguntas frecuentes
//     question: // La pregunta del usuario
//     isFaq: // Booleano que indica si la pregunta fue encontrada en el contexto de las preguntas frecuentes
//     }

//     `);

//   const schema = z.object({
//     answer: z
//       .string()
//       .describe(
//         "La respuesta a la pregunta del usuario si la encontraste en el contexto de las preguntas frecuentes",
//       ),
//     question: z.string().describe("La pregunta del usuario"),
//     isFaq: z
//       .boolean()
//       .describe(
//         "Booleano que indica si la pregunta fue encontrada en el contexto de las preguntas frecuentes",
//       ),
//   });

//   const llm = new ChatOpenAI({
//     model: "gpt-4o",
//     temperature: 0,
//   })
//     .withStructuredOutput(schema)
//     .withConfig({ tags: ["nostream"] });

//   const response = await llm.invoke([systemMessage, ...messages]);
//   console.log("response linee 346 - agent_graph/graph.ts : >>>>>");
//   console.log(response);
//   return { firstNodeResponse: [response], isFaq: response.isFaq };
// };

const shouldContinue = (state: typeof stateAnnotation.State) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const aiMessage = lastMessage as AIMessage;
  if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
    return "tools";
  }
  return END;
};

// Crear workflow
const workflow = new StateGraph(stateAnnotation)
 
  .addNode("llm", llmNode)
  .addNode("tools", toolNode)
  .addEdge(START, "llm")
  .addConditionalEdges("llm", shouldContinue)
  .addEdge("tools", "llm");

const memorySaver = new MemorySaver();

// Compilar y usar
export const graph = workflow.compile({ checkpointer: memorySaver });
