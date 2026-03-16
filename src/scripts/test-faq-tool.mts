import { FaqsToolRetriever } from "../tools/faq_tool.mjs";
import dotenv from "dotenv";
dotenv.config();

// const queries = [
//   "¿Qué farmacias tengo en La Plata con el plan Elite?",
//   "¿Qué cobertura tengo en kinesiología con el plan Basic?",
//   "¿Dónde puedo hacerme análisis de sangre en Chascomús?",
//   "¿Cuáles son las clínicas para internación en Berisso?",
// ];

const queries = [
  "como puedo autorizar un estudio?",
];

async function run() {
  for (const query of queries) {
    console.log("\n" + "=".repeat(60));
    console.log("QUERY:", query);
    console.log("=".repeat(60));
    try {
      const result = await FaqsToolRetriever.invoke({ query });
      console.log("RESULT:", result);
    } catch (err) {
      console.error("ERROR:", err);
    }
  }
}

// run();
