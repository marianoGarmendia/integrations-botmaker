import { Annotation } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';
import {
  BaseConfigurationAnnotation,
  ensureBaseConfiguration,
} from '../shared/configuration.mjs';

// This file contains sample documents to index, based on the following LangChain and LangGraph documentation pages:
const DEFAULT_DOCS_FILE = './src/sample_docs.json';

/**
 * The configuration for the indexing process.
 */
export const IndexConfigurationAnnotation = Annotation.Root({
  ...BaseConfigurationAnnotation.spec,

  /**
   * Path to a JSON file containing default documents to index.
   */
  user_id: Annotation<string>,
  agent_id: Annotation<string>,
  title: Annotation<string>,
  docsFile: Annotation<string>,
  useSampleDocs: Annotation<boolean>,
});

/**
 * Create an typeof IndexConfigurationAnnotation.State instance from a RunnableConfig object.
 *
 * @param config - The configuration object to use.
 * @returns An instance of typeof IndexConfigurationAnnotation.State with the specified configuration.
 */
export function ensureIndexConfiguration(
  config: RunnableConfig,
): typeof IndexConfigurationAnnotation.State {
  const configurable = (config?.configurable || {}) as Partial<
    typeof IndexConfigurationAnnotation.State
  >;

  const baseConfig = ensureBaseConfiguration(config);

  return {
    ...baseConfig,
    docsFile: configurable.docsFile || DEFAULT_DOCS_FILE,
    useSampleDocs: configurable.useSampleDocs || false,
    user_id: configurable.user_id || '',
    agent_id: configurable.agent_id || '',
    title: configurable.title || '',
  };
}
