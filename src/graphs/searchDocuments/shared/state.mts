import { Document } from '@langchain/core/documents';
import { v4 as uuidv4 } from 'uuid';

/**
 * Reduces the document array based on the provided new documents or actions.
 *
 * @param existing - The existing array of documents.
 * @param newDocs - The new documents or actions to apply.
 * @returns The updated array of documents.
 */
export function reduceDocs(
  existing?: Document[],
  newDocs?:
    | Document[]
    | { [key: string]: any }[]
    | string[]
    | string
    | 'delete',
  user_id?: string,
  agent_id?: string,
  title?: string,
): Document[] {
  if (newDocs === 'delete') {
    return [];
  }

    const existingList = existing || [];
    const existingIds = new Set(existingList.map((doc) => doc.metadata?.uuid));

  if (typeof newDocs === 'string') {
    const docId = uuidv4();
    return [
      ...existingList,
      { pageContent: newDocs, metadata: { uuid: docId , user_id: user_id, agent_id: agent_id, title: title } },
    ];
  }

  const newList: Document[] = [];
  if (Array.isArray(newDocs)) {
    for (const item of newDocs) {
      if (typeof item === 'string') {
        const itemId = uuidv4();
        newList.push({ pageContent: item, metadata: { uuid: itemId , user_id: user_id, agent_id: agent_id }  });
        existingIds.add(itemId);
      } else if (typeof item === 'object') {
        const metadata = (item as Document).metadata ?? {};
        let itemId = metadata.uuid ?? uuidv4();

        if (!existingIds.has(itemId)) {
          if ('pageContent' in item) {
            // It's a Document-like object
            newList.push({
              ...(item as Document),
              metadata: { ...metadata, uuid: itemId , user_id: user_id, agent_id: agent_id },
            });
          } else {
            // It's a generic object, treat it as metadata
            newList.push({
              pageContent: '',
              metadata: { ...(item as { [key: string]: any }), uuid: itemId , user_id: user_id, agent_id: agent_id },
            });
          }
          existingIds.add(itemId);
        }
      }
    }
  }

  return [...existingList, ...newList];
}
