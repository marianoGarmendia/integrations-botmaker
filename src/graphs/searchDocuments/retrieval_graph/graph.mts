import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentStateAnnotation } from './state.mjs';
import { makeRetriever } from '../shared/retrieval.mjs';
import { formatDocs } from './utils.mjs';
import { HumanMessage } from '@langchain/core/messages';
import { buildFilterByTitle } from '../shared/buildFilter.mjs';
// import { z } from 'zod';
import { RESPONSE_SYSTEM_PROMPT } from './prompts.mjs';
import { RunnableConfig } from '@langchain/core/runnables';
import {
  AgentConfigurationAnnotation,
  ensureAgentConfiguration,
} from './configuration.mjs';
import { loadChatModel } from '../shared/utils.mjs';

async function checkQueryType(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<{
  route: 'retrieve' | 'direct';
}> {

  // ESTE CODIGO ES PARA RUTEAR , EN ESTA VERSION DE AGENTE UTILIZADO COMO HERRAMIENTA RETRIEVER, SIEMPRE VA A RETORNAR RETRIEVE
  // //schema for routing
  // const schema = z.object({
  //   route: z.enum(['retrieve', 'direct']),
  //   directAnswer: z.string().optional().nullable(),
  // });

  // const configuration = ensureAgentConfiguration(config);
  // const model = await loadChatModel(configuration.queryModel);

  // const routingPrompt = ROUTER_SYSTEM_PROMPT;

  // const formattedPrompt = await routingPrompt.invoke({
  //   query: state.query,
  // });

  // const response = await model
  //   .withStructuredOutput(schema).withConfig({tags: ["nostream"]})
  //   .invoke(formattedPrompt.toString());

  // const route = response.route;

  // return { route };
  return { route: 'retrieve' };
}

async function answerQueryDirectly(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const configuration = ensureAgentConfiguration(config);
  const model = await loadChatModel(configuration.queryModel);
  const userHumanMessage = new HumanMessage(state.query);

  const response = await model.invoke([userHumanMessage]);
  return { messages: [userHumanMessage, response] };
}

async function routeQuery(
  state: typeof AgentStateAnnotation.State,
): Promise<'retrieveDocuments' | 'directAnswer'> {
  const route = state.route;
  if (!route) {
    throw new Error('Route is not set');
  }

  if (route === 'retrieve') {
    return 'retrieveDocuments';
  } else if (route === 'direct') {
    return 'directAnswer';
  } else {
    throw new Error('Invalid route');
  }
}

async function retrieveDocuments(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {

  // Preguntale a un modelo que me diga que titulo me devuelve según la query del usuario
  const {title , question} = await buildFilterByTitle(state.query);
  // const retriever = await makeRetriever(config, config?.configurable?.filters);
  const retriever = await makeRetriever(config, {title: title});

  // const docByMetadata = await getDocByMetadata(config?.configurable);

  // console.log("docByMetadata linee 82 - retrieval_graph/graph.ts : >>>>>")
  // console.dir(docByMetadata, { depth: null });

  // const listOfDocumentsVectorized = await listOfDocuments();
  // console.log("listOfDocumentsVectorized linee 81 - retrieval_graph/graph.ts : >>>>>")
  // console.dir(listOfDocumentsVectorized, { depth: null });

console.log("filter - retriever linee 97 - retrieval_graph/graph.ts : >>>>>")
console.log(retriever.filter)
console.log("question linee 99 - retrieval_graph/graph.ts : >>>>>")
console.log(question)
  // const response = await retriever.invoke(state.query);
  const response = await retriever.invoke(question);

  console.log(" retrieval_graph/graph.ts : >>>>>")
  // response.forEach((doc) => {
  //   console.log("doc linee 106 - retrieval_graph/graph.ts : >>>>>")
    
  //   console.log(doc.metadata.source);
  //   console.log(doc.metadata.title);
  // });

  return { documents: response };
}

async function generateResponse(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const configuration = ensureAgentConfiguration(config);
  const context = formatDocs(state.documents);
  const model = await loadChatModel(configuration.queryModel);
  const promptTemplate = RESPONSE_SYSTEM_PROMPT;

  const formattedPrompt = await promptTemplate.invoke({
    question: state.query,
    context: context,
  });
const modelWithoutStream = model.withConfig({tags: ["nostream"]})
  const userHumanMessage = new HumanMessage(state.query);

  // Create a human message with the formatted prompt that includes context
  const formattedPromptMessage = new HumanMessage(formattedPrompt.toString());

  const messageHistory = [...state.messages, formattedPromptMessage];

  // Let MessagesAnnotation handle the message history
  const response = await modelWithoutStream.invoke(messageHistory);

  // Return both the current query and the AI response to be handled by MessagesAnnotation's reducer
  return { messages: [userHumanMessage, response] };
}

const builder = new StateGraph(
  AgentStateAnnotation,
  AgentConfigurationAnnotation,
)
  .addNode('retrieveDocuments', retrieveDocuments)
  .addNode('generateResponse', generateResponse)
  .addNode('checkQueryType', checkQueryType)
  .addNode('directAnswer', answerQueryDirectly)
  .addEdge(START, 'checkQueryType')
  .addConditionalEdges('checkQueryType', routeQuery, [
    'retrieveDocuments',
    'directAnswer',
  ])
  .addEdge('retrieveDocuments', 'generateResponse')
  .addEdge('generateResponse', END)
  .addEdge('directAnswer', END);

export const graph = builder.compile().withConfig({
  runName: 'RetrievalGraph',
});
