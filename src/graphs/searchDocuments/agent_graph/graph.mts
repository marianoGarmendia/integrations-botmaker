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
import { trimMessages, SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
// import {evaluatorChain} from "../evaluation_graph/graph.mjs";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
// import { formatDocumentsAsString } from "langchain/util/document";
// import { PromptTemplate } from "@langchain/core/prompts";
import { SYSTEM_PROMPT_PRIMEDIC , SYSTEM_PROMPT_PRIMEDIC_v2} from "../prompts.mjs";
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
import { cartillasTools } from "../../../tools/cartillasTools.mjs";
import { z } from "zod";
import { ChatAnthropic } from "@langchain/anthropic";
import { PRIMEDIC_CORRECTIONS_RULES } from "./corrections_rules.mjs";

// import { makeSupabaseRetriever } from "../shared/retrieval.mjs";
// import { z } from "zod";

// import { z } from "zod";
import { AIMessage , BaseMessage} from "@langchain/core/messages";
import { prompt_faqs_context } from "../prompts.mjs";
import dotenv from 'dotenv';
dotenv.config();

// TODO: trim de mensajes para evitar que el estado se haga muy grande
//https://chatgpt.com/c/68c446cc-e44c-8331-aa05-e9aab954d760 [como hacerlo]

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
  profileIsComplete: Annotation<boolean>({
    value: (_prev, next) => next,
    default: () => false,
  }),
  volver_al_menu: Annotation<boolean>({
    value: (_prev, next) => next, // último valor gana
    default: () => false,
  }),
  summarize: Annotation<string>,
});

const schema = z.object({
  isAfiliate: z.boolean().describe("true si el usuario es afiliado a primedic salud, false si no es afiliado"),
  plan: z.string().describe("el plan del usuario puede ser b1, elite, plan_a_basic, superior"),
  localidad: z.string().describe("la localidad del usuario, puede ser la plata, magdalena, chascomus, brandsen, ensenada, etc."),
  profileIsComplete: z.boolean().describe("true si el perfil del usuario fue completado en los campos isAfiliate, plan y localidad, false si no fue completado"),

});
const profileTool = tool(
  async ({ query }: { query: string }) => {
    return { query };
  },
  {
    name: "profile_tool",
    description: "Obtiene la información del perfil del usuario en base a los mensajes del usuario",
    schema: schema,
  },
);

// Lista de herramientas
const tools = [ PlansToolRetriever, cartillasTools];

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

})
  .bindTools(tools)
  .withConfig({ tags: ["nostream"] });

// Crear ToolNode
const toolNode = new ToolNode(tools);

const summarizeConversation = async (messages: BaseMessage[]) => {
  const schemaSummarizeConversation = z.object({
    summary: z.string().describe("La resumen de la conversacion al momento"),
  });
  const systemMessage = new SystemMessage(`
    Eres un asistente que resume la conversacion al momento, obtiene la información clave de la conversación entre un usuario/afiliado y el asistente de atencion de primedic salud.
    Respeta la salida estructurada con el schema provisto

    ## Lista de mensajes de la conversacion:
    ${messages.map((message) => message.content).join("\n")}

  `);

  const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.2,
  })
  .withStructuredOutput(schemaSummarizeConversation)
  .withConfig({ tags: ["nostream"] });

  const response = await llm.invoke([systemMessage, ...messages]);
  return response;
}

const buildPrompt = async ({prompt, summarize}: {prompt: string, summarize: string}) => {
  return `
  ${prompt}

  ## Resumen de la conversacion al momento:
  ${summarize}

  `
}

// Definir nodo LLM (mantenido aunque no esté conectado al grafo)
const llmNode = async (state: typeof stateAnnotation.State) => {
  const { messages , profileIsComplete , summarize } = state;
  let profileComplete = false;
  let profileArgs = {} as any;

  if(!profileIsComplete) {

    // Dtermino esl perfil del usuario
      const agentProfile = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0.2,
      })
      .bindTools([profileTool], { tool_choice: "profile_tool", strict: true })
      .withConfig({ tags: ["nostream"] });

      const responseAgentProfile = await agentProfile.invoke([systemMessageProfile, ...messages]);

      const toolArgs = responseAgentProfile.tool_calls?.[0]?.args;
      console.log("toolArgs linee 242 - agent_graph/graph.ts : >>>>>");
      console.log(toolArgs);


      profileComplete = toolArgs?.profileIsComplete;
      profileArgs = toolArgs;
  }
// Primedia : nombre del agente



  const systemMessageInitial = new SystemMessage(`
    Eres un asistente inteligente y tu tarea es identificar si la pregunta del usuario puede ser respondida con la información disponible en el contexto dentro de las preguntas frecuentes.
    También debes detectar si el usuario desea volver al menú principal.

    IMPORTANTE: Si el usuario responde con un mensaje de cierre/despedida/agradecimiento FINAL (por ejemplo: "gracias", "muchas gracias", "bueno gracias", "listo gracias", "ok gracias", "chau", "hasta luego", "nos vemos") y NO incluye una nueva pregunta/pedido (ej: no agrega "y ...", no pregunta algo, no solicita otra cosa), entonces debes marcar volver_al_menu = true.
    Si el usuario agradece pero además hace una nueva consulta (ej: "gracias, y dónde queda?", "gracias, pero necesito otra cosa"), entonces volver_al_menu = false.

    CONTEXTO CONVERSACIONAL (CLAVE): Debes mirar el ÚLTIMO mensaje del asistente en el historial.
    - Si el último mensaje del asistente fue una pregunta/confirmación/ofrecimiento (ej: "¿querés que te comparta el enlace...?", "¿te lo paso?", "¿querés que lo busque?") y el usuario responde afirmando aunque incluya agradecimiento (ej: "sí gracias", "dale gracias", "ok gracias"), eso NO es una finalización. En ese caso volver_al_menu = false.
    Tendras una salida estructurada con el esquema provisto:



    ## información del perfil del usuario hasta el momento:
    ${profileArgs ? JSON.stringify(profileArgs) : "No se ha podido obtener el perfil del usuario"}

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
  })
    .withStructuredOutput(schema)
    .withConfig({ tags: ["nostream"] });

    const messagesWithSummarize = summarize ?  [new AIMessage(summarize), messages.at(-1)] as BaseMessage[] : messages as BaseMessage[];

   console.log(messagesWithSummarize);

  const response = await llm.invoke([systemMessageInitial, ...messagesWithSummarize]);
  console.log("response linee 346 - agent_graph/graph.ts : >>>>>");
  console.log(response);


  if(response.volver_al_menu) {
    return { messages: [new AIMessage("")], volver_al_menu: true };
  }

  if(response.isFaq) {
    return { messages: [new AIMessage(response.answer)] , volver_al_menu: false };
  }
// Resumir la conversacion al momento:

  const summaryConversation = await summarizeConversation(messages);
  console.log("summaryConversation linee 311 - agent_graph/graph.ts : >>>>>");
  console.log(summaryConversation);

 // Acá ingresa si no encontró respuestas en el contexto de las preguntas frecuentes y el perfil del usuario está completo

  const prompt = await buildPrompt({prompt: SYSTEM_PROMPT_PRIMEDIC_v2, summarize: summaryConversation.summary});

  const systemMessage = new SystemMessage(prompt);

  const responseEnsureToolResponse = await invokeWithBackoff(5, async () => {
    try {
      console.log("invoke model without fixer");
      return await model.invoke([systemMessage, ...messagesWithSummarize]);
    } catch (err) {
      if (isMissingToolResponseError(err)) {
        const fixed = await ensureToolResponses(messages);
        console.log("invoke model with fixer");
        return await model.invoke([systemMessage, ...fixed]);
      }
      throw err;
    }
  });



  console.log(responseEnsureToolResponse);

  return { messages: [responseEnsureToolResponse], volver_al_menu: false , summarize: summaryConversation.summary };
};

// Schema para firstNode: clasifica la consulta Y extrae el perfil en una sola llamada
const schemaFirstNode = z.object({
  needsProfile: z.boolean().describe("true si es consulta de cartilla, prestadores, búsqueda de médicos/especialistas/farmacias o cobertura específica por plan/localidad. false para preguntas generales (horarios, contacto, qué es Primedic, FAQs generales)"),
  hasRealQuery: z.boolean().describe("true si en la conversación el usuario hizo una pregunta o consulta real sobre el servicio (ej: buscar médico, cartilla, cobertura, farmacias). false si el usuario SOLO está aportando datos de perfil (ej: 'soy afiliado', 'vivo en la plata', 'plan elite') sin haber hecho ninguna consulta todavía"),
  isAfiliate: z.boolean().nullable().describe("true si el usuario es afiliado a Primedic Salud, false si es prospecto, null si no se menciona en la conversación"),
  plan: z.string().nullable().describe("plan del usuario: b1, elite, plan_a_basic, superior. null si no se menciona"),
  localidad: z.string().nullable().describe("localidad del usuario: la plata, magdalena, chascomus, brandsen, ensenada, berisso, etc. null si no se menciona"),
  questionForUser: z.string().nullable().describe("Pregunta concisa y amigable al usuario para obtener TODOS los datos faltantes en un solo mensaje. null si no se necesita perfil o ya está completo"),
});

const firstNode = async (state: typeof stateAnnotation.State) => {
  const { profile, messages } = state;

  // Solo saltear si tenemos los 3 campos reales del perfil — NO basarse en el flag profileIsComplete
  // porque ese flag puede estar en true por una consulta anterior que no requería perfil
  const hasCompleteProfile =
    profile != null &&
    profile.isAfiliate != null &&
    profile.plan != null &&
    profile.localidad != null;

  if (hasCompleteProfile) return { profileIsComplete: true };

  const systemPromptFirstNode = new SystemMessage(`Sos asistente de Primedic Salud. Analizá el HISTORIAL COMPLETO de la conversación y completá el esquema de salida estructurada.

PASO 1 – CLASIFICÁ si la conversación requiere conocer el perfil del usuario (plan + localidad + afiliación).
La MAYORÍA de las consultas operativas requieren perfil. Usá la siguiente guía:

needsProfile = TRUE para cualquiera de estos temas:
- Cartilla de prestadores, médicos, especialistas, farmacias, clínicas, laboratorios
- Cobertura de prácticas, estudios, tratamientos, cirugías
- Autorizaciones de estudios o prácticas médicas (el proceso puede variar por plan y localidad)
- Reintegros, medicamentos crónicos, incorporación de adherentes
- Turnos en CIM u otras instituciones
- Credenciales o estado de afiliación
- Cualquier consulta donde el plan o la localidad del usuario afecte la respuesta

needsProfile = FALSE SOLO para consultas completamente genéricas que aplican igual para todos:
- Horario y dirección de la oficina central
- Teléfono de SIPEM (emergencias)
- Qué es Primedic Salud o cómo afiliarse (prospecto sin plan)

TAMBIÉN marcá needsProfile=true si el asistente ya le pidió los datos al usuario en mensajes anteriores (indica que la consulta original los requería).

PASO 2 – DETERMINÁ si el usuario ya hizo una consulta/pregunta real sobre el servicio (hasRealQuery).
- hasRealQuery=true: el usuario preguntó algo concreto (ej: "busco un cardiólogo", "cómo autorizo un estudio", "qué farmacias tengo")
- hasRealQuery=false: el usuario SOLO aportó datos de perfil (ej: "soy afiliado", "vivo en la plata", "plan elite") sin hacer ninguna pregunta todavía

PASO 3 – EXTRAÉ del historial los datos que ya haya mencionado el usuario: isAfiliate, plan, localidad. Si no se mencionan, dejá el campo en null.

PASO 4 – Si needsProfile=true y aún faltan datos (algún campo es null), escribí UNA pregunta amigable y concisa pidiendo TODOS los datos faltantes juntos en un solo mensaje. Si no se necesita perfil o el perfil ya está completo, dejá questionForUser en null.`);

  const llmFirstNode = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
  })
    .withStructuredOutput(schemaFirstNode)
    .withConfig({ tags: ["nostream"] });

  const result = await llmFirstNode.invoke([systemPromptFirstNode, ...messages]);
  console.log("firstNode result - agent_graph/graph.ts : >>>>>");
  console.log(result);

  // El LLM a veces devuelve el string "null" en vez de null real — normalizar
  const nullify = (v: string | null | undefined): string | null =>
    v == null || v === "null" || v === "" ? null : v;

  const plan = nullify(result.plan);
  const localidad = nullify(result.localidad);
  const isAfiliate = result.isAfiliate;

  const profileComplete =
    !result.needsProfile ||
    (isAfiliate !== null && plan !== null && localidad !== null);

  if (profileComplete) {
    if (result.needsProfile) {
      if (!result.hasRealQuery) {
        // Perfil completo pero el usuario aún no hizo su consulta real
        // Guardar el perfil, pedir la consulta y terminar el turno (→ END)
        return {
          profile: {
            isAfiliate: isAfiliate!,
            plan: plan!,
            localidad: localidad!,
          },
          messages: [new AIMessage("¡Perfecto! Ya tengo tu información. ¿En qué puedo ayudarte hoy?")],
          profileIsComplete: false,
        };
      }
      return {
        profileIsComplete: true,
        profile: {
          isAfiliate: isAfiliate!,
          plan: plan!,
          localidad: localidad!,
        },
      };
    }
    return { profileIsComplete: true };
  }

  // Perfil necesario pero incompleto — preguntar al usuario y terminar el turno
  return {
    messages: [new AIMessage(result.questionForUser!)],
    profileIsComplete: false,
  };
};

const routeAfterFirstNode = (state: typeof stateAnnotation.State) => {
  return state.profileIsComplete ? "secondNode" : END;
};

const secondNode = async (state: typeof stateAnnotation.State) => {
  const { messages, profile } = state;

  // Si venimos de ejecutar tools, saltear el FAQ check — los mensajes ya incluyen
  // el resultado de la tool y solo necesitamos que el modelo sintetice la respuesta
  const comingFromTools = messages[messages.length - 1] instanceof ToolMessage;

  if (!comingFromTools) {
    // Construir query enriquecida con perfil para que el retriever filtre mejor
    const lastHumanMessage = messages.filter(m => m.type === "human").at(-1);
    const baseQuery = String(lastHumanMessage?.content ?? "");
    const faqQuery = profile
      ? `${baseQuery} - plan: ${profile.plan}, localidad: ${profile.localidad}`
      : baseQuery;

    // Buscar en FAQs usando la tool de retrieval (en vez de contexto hardcodeado en el prompt)
    let faqContext = "";
    try {
      const faqRaw = await FaqsToolRetriever.invoke({ query: faqQuery });
      const faqResult = typeof faqRaw === "string" ? faqRaw : JSON.stringify(faqRaw);
      if (faqResult.trim().length > 50) {
        faqContext = faqResult;
      }
    } catch (err) {
      console.error("Error al consultar FaqsToolRetriever:", err);
    }
    console.log("faqContext length:", faqContext.length);

    const profileContext = profile
      ? `Perfil del usuario: isAfiliate=${profile.isAfiliate}, plan=${profile.plan}, localidad=${profile.localidad}`
      : "No se requiere perfil para esta consulta";

    const systemMessageInitial = new SystemMessage(`
    Eres un asistente de Primedic Salud que atiende por WhatsApp dentro de un flujo con múltiples opciones (autorizaciones, prestadores, centro médico, ayudas económicas, etc.).
    Tu tarea es identificar si la pregunta del usuario puede ser respondida con los documentos recuperados del sistema de FAQs.
    También debes detectar si el usuario desea volver al menú principal o acceder a otra opción del flujo.

    REGLA DE CIERRE / DERIVACIÓN AL MENÚ:
    Marcá volver_al_menu = true cuando:
    - El usuario se despide o agradece sin nueva consulta (ej: "gracias", "chau", "hasta luego", "listo gracias").
    - El usuario pide explícitamente volver al menú o acceder a otra opción (ej: "quiero ver autorizaciones", "menú", "otras opciones", "volver").
    - El asistente le sugirió al usuario volver al menú y el usuario acepta o confirma (ej: "ok", "dale", "sí").
    Marcá volver_al_menu = false si el usuario agradece pero además hace una nueva consulta (ej: "gracias, y dónde queda?").

    CONTEXTO CONVERSACIONAL (CLAVE): Si el último mensaje del asistente fue una pregunta/ofrecimiento y el usuario responde afirmando ("sí gracias", "dale"), NO es una finalización → volver_al_menu = false.

    REGLA IMPORTANTE: Si los documentos recuperados no responden la consulta (isFaq=false), NO sugieras números de teléfono ni ir a la sucursal. En cambio, indicá brevemente que esta consulta no podés resolverla desde este módulo y sugerí al usuario que vuelva al menú principal para seleccionar la opción adecuada. La única excepción es urgencias médicas → SIPEM 221-451-3145.

    Tendras una salida estructurada con el esquema provisto:

    ## Perfil del usuario:
    ${profileContext}

    ## Documentos recuperados del sistema de FAQs (usá SOLO esta información para responder en caso de haya información provista):
    ${faqContext || "No se recuperaron documentos relevantes para esta consulta."}
    `);

    const schemaSecondNode = z.object({
      answer: z
        .string()
        .describe(
          "Respuesta positiva y específica basada ÚNICAMENTE en los documentos recuperados. Si los documentos NO contienen el dato concreto que pide el usuario (ej: nombre de un profesional, dirección específica), dejá este campo vacío ('') y marcá isFaq=false. NUNCA pongas respuestas del tipo 'Lo siento, no tengo información' — eso es isFaq=false, no una respuesta.",
        ),
      question: z.string().describe("La pregunta del usuario"),
      isFaq: z
        .boolean()
        .describe(
          "true SOLO si los documentos recuperados contienen la respuesta concreta y útil para el usuario (datos reales: nombre, dirección, teléfono, cobertura, etc.). false si: los documentos no tienen el dato, no encontraste al profesional/prestador buscado, o la respuesta sería 'no tengo información'. En caso de duda, marcá false para que otra herramienta busque.",
        ),
      volver_al_menu: z.boolean().describe("true si: (1) el usuario se despide/agradece sin nueva consulta, (2) pide volver al menú o acceder a otra opción del flujo (autorizaciones, prestadores, etc.), o (3) el asistente le sugirió volver al menú y el usuario acepta. false si el usuario agradece pero además hace una nueva consulta."),
    });

    const llm = new ChatOpenAI({
      model: "gpt-4o",
    })
      .withStructuredOutput(schemaSecondNode)
      .withConfig({ tags: ["nostream"] });

    const response = await llm.invoke([systemMessageInitial, ...messages]);
    console.log("response secondNode - agent_graph/graph.ts : >>>>>");
    console.log(response);

    if (response.volver_al_menu) {
      return { messages: [new AIMessage("")], volver_al_menu: true };
    }

    // Safeguard: si isFaq=true pero la respuesta es vacía o es una negativa, tratar como false
    const negativePatterns = /no tengo|no encontr|lo siento|no dispongo|no puedo|no hay información|no figura/i;
    const effectiveIsFaq = response.isFaq && response.answer.trim().length > 0 && !negativePatterns.test(response.answer);

    if (effectiveIsFaq) {
      return { messages: [new AIMessage(response.answer)], volver_al_menu: false };
    }
  }

  // FAQ no encontrado O venimos de tools → llamar al modelo con tools disponibles
  console.log(comingFromTools ? "secondNode: viniendo de tools, salteo FAQ check" : "secondNode: FAQ no encontrado, invocando modelo con tools");

  const summaryConversation = await summarizeConversation(messages);
  console.log("summaryConversation secondNode - agent_graph/graph.ts : >>>>>");
  console.log(summaryConversation);

  const prompt = await buildPrompt({ prompt: SYSTEM_PROMPT_PRIMEDIC_v2, summarize: summaryConversation.summary });
  const systemMessage = new SystemMessage(prompt);

  const responseEnsureToolResponse = await invokeWithBackoff(5, async () => {
    try {
      console.log("invoke model without fixer");
      return await model.invoke([systemMessage, ...messages]);
    } catch (err) {
      if (isMissingToolResponseError(err)) {
        const fixed = await ensureToolResponses(messages);
        console.log("invoke model with fixer");
        return await model.invoke([systemMessage, ...fixed]);
      }
      throw err;
    }
  });

  console.log(responseEnsureToolResponse);

  return { messages: [responseEnsureToolResponse], volver_al_menu: false, summarize: summaryConversation.summary };
};


const shouldContinue = (state: typeof stateAnnotation.State) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const aiMessage = lastMessage as AIMessage;
  if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
    return "tools";
  }
  return "validatorNode";
};

const validatorNode = async (state: typeof stateAnnotation.State) => {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

  const content =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

  // Saltar mensajes vacíos (cierre/menú) o con tool_calls (intermedios)
  if (
    !content ||
    content.trim() === "" ||
    (lastMessage.tool_calls && lastMessage.tool_calls.length > 0)
  ) {
    return {};
  }

  const { profile } = state;

  const validatorSchema = z.object({
    isCorrect: z
      .boolean()
      .describe("true si la respuesta cumple todas las reglas de PRIMEDIC"),
    correctedResponse: z
      .string()
      .describe(
        "La respuesta final a enviar al usuario. Si isCorrect=true, copiá la respuesta original sin ningún cambio. Si isCorrect=false, escribí la versión corregida aplicando las reglas.",
      ),
  });

  const validatorLlm = new ChatAnthropic({
    model: "claude-sonnet-4-5",
    temperature: 0,
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
    .withStructuredOutput(validatorSchema)
    .withConfig({ tags: ["nostream"] });

  const profileContext = profile
    ? `Plan: ${profile.plan} | Localidad: ${profile.localidad} | Afiliado: ${profile.isAfiliate}`
    : "Sin perfil disponible";

  const systemPrompt = new SystemMessage(`Sos un validador de respuestas del asistente virtual de PRIMEDIC Salud.

Tu tarea es verificar si la respuesta del asistente cumple con las reglas de negocio. Si no las cumple, corregirla.
Mantené el mismo tono y extensión de la respuesta original. Solo corregí lo que viola las reglas.

PERFIL DEL USUARIO:
${profileContext}

${PRIMEDIC_CORRECTIONS_RULES}

RESPUESTA A EVALUAR:
"${content}"

Evaluá si la respuesta viola alguna regla. Si es correcta → isCorrect=true y copiá la respuesta original exactamente. Si hay algún problema → isCorrect=false y escribí la versión corregida.`);

  const result = await validatorLlm.invoke([systemPrompt]);

  if (result.isCorrect) {
    console.log("validatorNode: respuesta correcta, sin cambios");
    return {};
  }

  console.log("validatorNode: respuesta corregida");
  console.log("original  :", content);
  console.log("corregida :", result.correctedResponse);

  // Reemplazar el mensaje usando el mismo ID para que el reducer lo sobreescriba
  const correctedMessage = new AIMessage({
    id: lastMessage.id,
    content: result.correctedResponse,
  });

  return { messages: [correctedMessage] };
};

// Crear workflow
const workflow = new StateGraph(stateAnnotation)
  .addNode("firstNode", firstNode)
  .addNode("secondNode", secondNode)
  .addNode("tools", toolNode)
  .addNode("validatorNode", validatorNode)
  .addEdge(START, "firstNode")
  .addConditionalEdges("firstNode", routeAfterFirstNode)
  .addConditionalEdges("secondNode", shouldContinue)
  .addEdge("tools", "secondNode")
  .addEdge("validatorNode", END);

const memorySaver = new MemorySaver();

// Compilar y usar
export const primedicGraph = workflow.compile({ checkpointer: memorySaver });
