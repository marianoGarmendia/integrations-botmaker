import { z } from "zod";
// import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { primedicFAQ } from "../config.mjs";


const systemPrompt =
  `
  Te encargas de evaluar la consulta del usuario e identificar en el listado de preguntas frecuentes si es posible responder con alguna de ellas, por lo que debes completar los campos de la herramienta
  `;
// const options = [END, ...members];

// Define the routing function
const routingTool = {
  name: "isFaq",
  description: "Identificar si la pregunta del usuario puede ser respondida con alguna del listado de las preguntas frecuentes",
  schema: z.object({
    isFaq: z.boolean().describe("Si la pregunta del usuario puede ser respondida con alguna del listado de las preguntas frecuentes. TRUE si puede ser respondida con alguna de las preguntas frecuentes, FALSE si no puede ser respondida con alguna de las preguntas frecuentes."),
    question: z.string().describe("La pregunta del usuario").nullable(),
    answer: z.string().describe("La respuesta a la pregunta del usuario").nullable(),
  }),
}

const escapedPrimedicFAQ = JSON.stringify(primedicFAQ)
  .replaceAll("{", "{{")
  .replaceAll("}", "}}");

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  ["human", "{question}"],
  ["assistant", escapedPrimedicFAQ],
]);

 
 
// const model = new ChatAnthropic({
//     model: "claude-sonnet-4-20250514",
//     temperature: 0,
//     maxRetries: 5,
// })


const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
})


export const evaluatorChain = prompt
  .pipe(model.bindTools(
    [routingTool],
    {
      tool_choice: "isFaq",
    },
  ).withConfig({tags: ["nostream"]}))
  .pipe((x:any) => {
    const firstCall = x.tool_calls?.[0];
    if (!firstCall) {
      throw new Error("No tool call returned by LLM");
    }
    return firstCall.args;
  });

  
