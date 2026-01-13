import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
// import type { SupabaseFilterRPCCall } from "@langchain/community/vectorstores/supabase";
import { createClient } from '@supabase/supabase-js';
import { RunnableConfig } from '@langchain/core/runnables';
import {
  BaseConfigurationAnnotation,
  ensureBaseConfiguration,
} from './configuration.mjs';
// import { buildFilenameFilter } from './buildFilter.js';

export const getDocByMetadata = async (metadata: any): Promise<any> => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not defined',
    );
  }

  
  const supabaseClient = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  const { data, error } = await supabaseClient
  .from("documents")
  .select("id , metadata, user_id, agent_id, content")
  .filter("metadata->>user_id", "eq", metadata.user_id) 

  console.log("data linee 31 - retrieval.ts : >>>>>")
  console.dir(data, { depth: null });
 
  
  if(error) {
   console.log("error linee 33 - retrieval.ts : >>>>>")
   console.dir(error, { depth: null });
  }
  return data;


};

/**
 * Lista los documentos de la base de datos y el titulo de cada documento
 * @returns {Promise<any>} - Lista de documentos y titulos de cada documento
 */
export const listOfDocuments = async (

): Promise<any> => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not defined',
    );
  }

  const supabaseClient = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  const page = 1,
    pageSize = 100;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Esto sirve para realizar un filtro por metadata
  console.log('configuration - listOfDocuments - retrieval.ts : >>>>>');

  
  
  const { data, error, count } = await supabaseClient
    .from('documents')
    .select('id, metadata, user_id, agent_id', { count: 'exact' })
    .range(from, to);

    console.log('error - listOfDocuments - retrieval.ts : >>>>>');
    console.dir(error, { depth: null });

    console.log('count - listOfDocuments - retrieval.ts : >>>>>');
    console.dir(count, { depth: null });

  // console.log('data - listOfDocuments - retrieval.ts : >>>>>');
  // data?.forEach((doc) => {
  //   console.log(doc.metadata.pdf.info);
  //   console.log(doc.metadata.source);
  //   console.log(doc.metadata.pdf.info.Title);
  // });
  // console.log('error - listOfDocuments - retrieval.ts : >>>>>');
  // console.dir(error, { depth: null });
  // console.log('count - listOfDocuments - retrieval.ts : >>>>>');
  // console.dir(count, { depth: null });

  const listOfDocuments: any[] = [];

  const titleByDocument :any[] = [];

  data?.forEach((doc) => {
    titleByDocument.push(doc.metadata.title);
  });

  data?.forEach((doc) => {
    listOfDocuments.push({
      id: doc.id,
      title: doc.metadata.pdf.info.Title,
      info: doc.metadata.pdf.info,
      source: doc.metadata.source,
      description: doc.metadata.description,
      user_id: doc.user_id,
      agent_id: doc.agent_id,
    });
  });

  return { listOfDocuments, titleByDocument };
};

export async function makeSupabaseRetriever(
  configuration: typeof BaseConfigurationAnnotation.State,
  filters?: Record<string, any>,
): Promise<VectorStoreRetriever> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not defined',
    );
  }
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });
  const supabaseClient = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'match_documents',
  });
  // let filter: SupabaseFilterRPCCall = (rpc) => rpc;
  //   if(filters?.title) {
  //     filter = buildFilenameFilter(filters?.title || "", { mode: "AND" });

  //   }

  // const page = 1,
  //   pageSize = 100;
  // const from = (page - 1) * pageSize;
  // const to = from + pageSize - 1;

  // Esto sirve para realizar un filtro por metadata
  // if(filters?.title) {
  //   console.log('Hay un filtro designado: --- >>>>>');
  // console.log('configuration linee 32 - retrieval.ts : >>>>>');
  // console.dir(configuration.filterKwargs, { depth: null });

  // const { data, error, count } = await vectorStore.client
  //   .from('documents')
  //   .select('id, metadata, user_id, agent_id', { count: 'exact' })
  //   .range(from, to);

  // console.log('data linee 53 - retrieval.ts : >>>>>');
  // data?.forEach((doc) => {
  //   console.log(doc.metadata.pdf.info);
  //   console.log(doc.metadata.source);
  //   console.log(doc.metadata.pdf.info.Title);
  // });
  // console.log('error linee 56 - retrieval.ts : >>>>>');
  // console.dir(error, { depth: null });
  // console.log('count linee 57 - retrieval.ts : >>>>>');
  // console.dir(count, { depth: null });
  // }
  // return vectorStore.asRetriever({
  //   k: configuration.k,
  //   filter: { ...configuration.filterKwargs, ...filters },
  // });
  return vectorStore.asRetriever({
    k: configuration.k,
    filter: { ...(filters ?? {}) },
  });
}

export async function makeRetriever(
  config: RunnableConfig,
  filters?: Record<string, any>,
): Promise<VectorStoreRetriever> {
  const configuration = ensureBaseConfiguration(config);
  switch (configuration.retrieverProvider) {
    case 'supabase':
      return makeSupabaseRetriever(configuration, filters);
    default:
      throw new Error(
        `Unsupported retriever provider: ${configuration.retrieverProvider}`,
      );
  }
}

/*
Function match_documents actual

#variable_conflict use_column
BEGIN
    RETURN QUERY
    SELECT
        id,
        content,
        metadata,
        embedding,
        1 - (documents.embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE metadata @> filter
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
END;


Fucnion recomendada por supabase 

-- 2️⃣  Función RPC que acepta filtros opcionales por user_id y agent_id
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),                -- tamaño del embedding que uses
  match_count      int      DEFAULT NULL,     -- cuántos resultados devolver
  filter           jsonb    DEFAULT '{}'::jsonb, -- filtro sobre metadata (mantiene compatibilidad con LangChain)
  p_user_id        uuid     DEFAULT NULL,    -- filtro opcional por user_id
  p_agent_id       uuid     DEFAULT NULL     -- filtro opcional por agent_id
) RETURNS TABLE (
  id          bigint,
  content     text,
  metadata    jsonb,
  embedding   jsonb,
  similarity  float,
  user_id     uuid,   -- devolvemos también estos campos
  agent_id    uuid
) LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    (d.embedding::text)::jsonb AS embedding,
    1 - (d.embedding <=> query_embedding) AS similarity,
    d.user_id,
    d.agent_id
  FROM public.documents d
  /* 1️⃣ filtro genérico sobre metadata (para que LangChain siga funcionando) */
//   WHERE d.metadata @> filter
//   /* 2️⃣ filtro por user_id si el caller lo envía */
//   AND (p_user_id IS NULL OR d.user_id = p_user_id)
//   /* 3️⃣ filtro por agent_id si el caller lo envía */
//   AND (p_agent_id IS NULL OR d.agent_id = p_agent_id)
//   ORDER BY d.embedding <=> query_embedding
//   LIMIT match_count;
// END;
// $$;
