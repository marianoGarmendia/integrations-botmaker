// src/retrievers/documentsMdRetriever.ts
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";

export type DocumentsMdFilters = {
  ciudad?: string;
  planes?: string | string[];
  keywords?: string | string[];
};

export type DocumentsMdRetrieverOptions = {
  k?: number;
  scoreThreshold?: number;
  embeddingModel?: string;
  fallbackToTodasIfEmpty?: boolean;
};

const toArray = (v?: string | string[]) =>
  v == null ? undefined : Array.isArray(v) ? v : [v];

function buildFilterJson(f: DocumentsMdFilters): Record<string, any> {
  const filter: Record<string, any> = {
    ciudad: f.ciudad,
    planes: toArray(f.planes),
    keywords: toArray(f.keywords),
  };
  // ⚠️ no mandes arrays vacíos
  for (const k of Object.keys(filter)) {
    if (filter[k] == null) delete filter[k];
    if (Array.isArray(filter[k]) && filter[k].length === 0) delete filter[k];
  }
  return filter;
}

export async function makeDocumentsMdRetriever(
  filters: DocumentsMdFilters,
  opts: DocumentsMdRetrieverOptions = {}
): Promise<BaseRetriever> {
  const {
    k = 5,
    scoreThreshold,
    embeddingModel = "text-embedding-3-small",
    fallbackToTodasIfEmpty = true,
  } = opts;

  const embeddings = new OpenAIEmbeddings({ model: embeddingModel });
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: "documents_md",
    queryName: "match_documents_md_lite", // 👈 usa la robusta
  });

  const filter = buildFilterJson(filters);

  if (scoreThreshold == null) {
    // camino simple + fallback opcional a quitar ciudad para que entren 'todas'
    return new (class extends BaseRetriever {
      lc_namespace = ["custom", "supabase", "documentsMdRetriever"];
      async _getRelevantDocuments(query: string): Promise<Document[]> {
        const fetchN = Math.max(k * 3, 20);
        const first = await vectorStore.similaritySearch(query, fetchN, filter);
        if (first.length > 0 || !fallbackToTodasIfEmpty || !filter.ciudad) {
          return first.slice(0, k);
        }
        const { ciudad, ...rest } = filter;
        const second = await vectorStore.similaritySearch(query, fetchN, rest);
        return second.slice(0, k);
      }
    })();
  }

  // con threshold
  return new (class extends BaseRetriever {
    lc_namespace = ["custom", "supabase", "documentsMdRetriever"];
    async _getRelevantDocuments(query: string): Promise<Document[]> {
      const fetchN = Math.max(k * 3, 20);
      const run = (flt: Record<string, any>) =>
        vectorStore.similaritySearchWithScore(query, fetchN, flt);

      let pairs = await run(filter);
      if (pairs.length === 0 && fallbackToTodasIfEmpty && filter.ciudad) {
        const { ciudad, ...rest } = filter;
        pairs = await run(rest);
      }

      return pairs
        .filter(([, s]) => (s ?? 0) >= scoreThreshold)
        .slice(0, k)
        .map(([d]) => d);
    }
  })();
}
