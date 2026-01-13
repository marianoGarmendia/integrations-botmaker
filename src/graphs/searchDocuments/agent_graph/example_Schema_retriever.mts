// import { ChatOpenAI } from "@langchain/openai";
// import { z } from "zod";
// import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
// import { StringOutputParser } from "@langchain/core/output_parsers";
// import { formatDocument } from "langchain/format_document";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { log } from "console";

// // 1) Tu retriever (del ejemplo que pasaste)
// const retriever = makeSupabaseRetriever(configuration, { category: "docs" });

// // 2) Esquema Zod para la salida
// const AnswerSchema = z.object({
//   answer: z.string(),
//   citations: z.array(
//     z.object({
//       id: z.string().optional(),
//       source: z.string().optional(),
//       uri: z.string().optional(),
//     })
//   ),
//   confidence: z.number().min(0).max(1)
// });

// // 3) Modelo y structured output
// const model = new ChatOpenAI({
//   model: "gpt-4o-mini",
//   temperature: 0.2
// }).withStructuredOutput(AnswerSchema);

// // 4) Prompt + cadena RAG
// const prompt = PromptTemplate.fromTemplate(`
// Usa estrictamente el contexto para responder la pregunta.
// Responde conciso y agrega citas a partir de los metadatos de los documentos.

// # Pregunta
// {question}

// # Contexto
// {context}
// `);

// const formatDocs = async (docs: any[]) =>
//   docs.map(d => formatDocument(d, "text")).join("\n\n---\n\n");

// export const ragStructured = RunnableSequence.from([
//   {
//     question: new RunnablePassthrough(),
//     contextDocs: retriever // retriever.invoke(question) -> Document[]
//   },
//   async ({ question, contextDocs }) => ({
    
//     question,
//     context: await formatDocs(contextDocs)
//   }),
//   prompt,
//   model // <-- devuelve JSON ya validado por Zod
// ]);

// // Uso (en un nodo de LangGraph p.ej.)
// const result = await ragStructured.invoke("Dame un resumen en 3 líneas con citas.");
// // result: { answer: string, citations: {..}[], confidence: number }
