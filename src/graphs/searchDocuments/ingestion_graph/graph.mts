/**
 * This "graph" simply exposes an endpoint for a user to upload docs to be indexed.
 */

import { RunnableConfig } from '@langchain/core/runnables';
import { StateGraph, END, START } from '@langchain/langgraph';
import fs from 'fs/promises';

import { IndexStateAnnotation } from './state.mjs';
import { makeRetriever } from '../shared/retrieval.mjs';
import {
  ensureIndexConfiguration,
  IndexConfigurationAnnotation,
} from './configuration.mjs';
import { reduceDocs } from '../shared/state.mjs';

async function ingestDocs(
  state: typeof IndexStateAnnotation.State,
  config?: RunnableConfig,
): Promise<typeof IndexStateAnnotation.Update> {
  if (!config) {
    throw new Error('Configuration required to run index_docs.');
  }

  console.log("config linee 25 - ingestion_graph/graph.ts : >>>>>")
  console.log(config.configurable)

  const configuration = ensureIndexConfiguration(config);
  let docs = state.docs;

  if (!docs || docs.length === 0) {
    if (configuration.useSampleDocs) {
      const fileContent = await fs.readFile(configuration.docsFile, 'utf-8');
      const serializedDocs = JSON.parse(fileContent);
      console.log("serializedDocs linee 32 - ingestion_graph/graph.ts : >>>>>")
      console.dir(serializedDocs, { depth: null });
     
      docs = reduceDocs([], serializedDocs , configuration.user_id, configuration.agent_id,configuration.title);
    } else {
      throw new Error('No sample documents to index.');
    }
  } else {
    console.log("docs linee 40 - ingestion_graph/graph.ts : >>>>>")
 // TODO: En esta etapa podría agregar un resumen , una breve descripcion del documento para agregarlo a la metadata y asi pdoer hacer filtros por contenido
    docs = reduceDocs([], docs , configuration.user_id, configuration.agent_id ,configuration.title);
  }

  const retriever = await makeRetriever(config);
  await retriever.addDocuments(docs);

  return { docs: 'delete' };
}

// Define the graph
const builder = new StateGraph(
  IndexStateAnnotation,
  IndexConfigurationAnnotation,
)
  .addNode('ingestDocs', ingestDocs)
  .addEdge(START, 'ingestDocs')
  .addEdge('ingestDocs', END);

// Compile into a graph object that you can invoke and deploy.
export const graph = builder
  .compile()
  .withConfig({ runName: 'IngestionGraph' });
