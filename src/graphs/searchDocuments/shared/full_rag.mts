// import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
// import { ChatOpenAI } from "@langchain/openai";
// import { formatDocumentsAsString } from "langchain/util/document";
import { HumanMessage } from "@langchain/core/messages";
// import {makeRetriever} from "./retrieval.mjs";

// ---------- util: extraer texto de HumanMessage ----------
export function extractText(msg: HumanMessage): string {
  if (!msg) return "";
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    const t:any = msg.content.find((b: any) => b?.type === "text" && typeof b?.text === "string");
    return (t?.text ?? "").trim();
  }
  return "";
}

// // ---------- util: timeout ----------
// function withTimeout<T>(p: Promise<T>, ms = 20000, label = "op") {
//   return new Promise<T>((resolve, reject) => {
//     const t = setTimeout(() => reject(new Error(`Timeout ${label} (${ms}ms)`)), ms);
//     p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
//   });
// }

// // ---------- util: retry exponencial ----------
// async function retry<T>(fn: () => Promise<T>, attempts = 3, baseMs = 500) {
//   let lastErr: any;
//   for (let i = 0; i < attempts; i++) {
//     try { return await fn(); } catch (e) {
//       lastErr = e;
//       await new Promise(r => setTimeout(r, baseMs * Math.pow(2, i)));
//     }
//   }
//   throw lastErr;
// }

// // ---------- limit de concurrencia simple ----------
// function limitConcurrency<T, R>(concurrency: number, arr: T[], worker: (item: T, idx: number) => Promise<R>) {
//   let i = 0; const results: Promise<R>[] = [];
//   const run = async () => {
//     while (i < arr.length) {
//       const idx = i++; results[idx] = worker(arr[idx], idx);
//     }
//   };
//   const runners = Array.from({ length: Math.min(concurrency, arr.length) }, run);
//   return Promise.all(results); // se resuelve cuando cada slot asignó su promesa
// }

// // ---------- cache de retrievers por título ----------
// const retrieverCache = new Map<string, any>(); // tipá si tenés el tipo concreto

// export async function getRetrieverForTitle(config: any, title: string) {
//   const key = JSON.stringify({ title });
//   if (!retrieverCache.has(key)) {
//     // OJO con filtros: Supabase usa containment sobre metadata
//     const r = await makeRetriever(config, { title });
//     retrieverCache.set(key, r);
//   }
//   return retrieverCache.get(key);
// }

// // ---------- formateo defensivo ----------
// function safeFormatDocs(docs: any[]) {
//   if (!Array.isArray(docs) || docs.length === 0) return "";
//   try {
//     return formatDocumentsAsString(docs, "\n\n---\n\n");
//   } catch {
//     return docs.map((d, i) => {
//       const src = d?.metadata?.source ?? d?.metadata?.uri ?? d?.metadata?.id ?? `doc_${i+1}`;
//       const text = (d?.pageContent ?? "").toString();
//       return `[${i + 1}] ${src}\n${text}`;
//     }).join("\n\n---\n\n");
//   }
// }

// // ---------- modelo con salida estructurada ----------
// const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0.2 })
//   .withStructuredOutput(retriever_schema)
//   .withConfig({ tags: ["nostream", "faq"], run_name: "faq_rag" });

// // ---------- construcción del chain RAG ----------
// function buildRagChain(retriever: any) {
//   const prompt = /* tu PromptTemplate ya creado */;
//   return RunnableSequence.from([
//     { question: new RunnablePassthrough(), contextDocs: retriever },
//     async ({ question, contextDocs }) => {
//       if (!question || !Array.isArray(contextDocs) || contextDocs.length === 0) {
//         // Short-circuit: sin contexto, devolvé vacío para no alucinar
//         return { question, context: "" };
//       }
//       return { question, context: safeFormatDocs(contextDocs) };
//     },
//     prompt,
//     model
//   ]).withConfig({ run_name: "faq_rag_chain" });
// }

// // ---------- uso robusto ----------
// export async function runFaqRagPerTitle(
//   titlesFaqs: string[],
//   state: any,
//   config: any
// ) {
//   const last = state.messages.at(-1) as HumanMessage;
//   const questionMessage = extractText(last);
//   if (!questionMessage) return [];

//   // Normalizá títulos (trim + únicos)
//   const uniqueTitles = Array.from(new Set(titlesFaqs.map(t => t?.trim()).filter(Boolean)));

//   // procesá con concurrencia limitada y robustez
//   const results = await limitConcurrency(4, uniqueTitles, async (title) => {
//     try {
//       const retriever = await retry(
//         () => withTimeout(getRetrieverForTitle(config, title), 8000, `getRetriever:${title}`),
//         2
//       );

//       // smoke test: si querés loguear por qué no hay docs
//       const probe = await withTimeout(retriever.getRelevantDocuments(questionMessage), 8000, `probe:${title}`);
//       if (!probe || probe.length === 0) {
//         console.warn(`[FAQ][${title}] sin resultados para: "${questionMessage}"`);
//       }

//       const chain = buildRagChain(retriever);

//       const result = await retry(
//         () => withTimeout(chain.invoke(questionMessage), 20000, `invoke:${title}`),
//         2
//       );

//       return { ok: true as const, title, result };
//     } catch (err) {
//       console.error(`[FAQ][${title}] fallo:`, err);
//       return { ok: false as const, title, error: (err as Error)?.message ?? String(err) };
//     }
//   });

//   // quedate sólo con los fulfilled
//   const fulfilled = results.filter(r => r && r.ok) as Array<{ ok: true; title: string; result: any }>;

//   // si tu schema es { retriever_node_response: NodeResp[] }
//   const onlyFaq = fulfilled
//     .flatMap(f => (f.result?.retriever_node_response ?? []))
//     .filter((item: any) => item?.isFaq === true);

//   // opcional: deduplicar answers
//   const seen = new Set<string>();
//   const dedup = onlyFaq.filter((x: any) => {
//     const k = (x.answer ?? "").trim();
//     if (!k || seen.has(k)) return false;
//     seen.add(k); return true;
//   });

//   return dedup; // NodeResp[]
// }
