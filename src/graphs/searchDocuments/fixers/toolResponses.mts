
import { ToolMessage } from "@langchain/core/messages";


/**
 * Chequea si el error es un error de OpenAI donde falta un toolMessage correspondiente a un toolCall.
 * 
 * 
 * @param err 
 * @return boolean
 */


export function isMissingToolResponseError(err: any): boolean {
    const type = err?.type || err?.error?.type || err?.name;
    const msg = String(err?.message || "").toLowerCase();
    const status = err?.status ?? err?.response?.status;
    console.log("type err in isMissingToolResponseError", type)
    return (
      status === 400 &&
      (type === "invalid_request_error" || /invalid[_\s-]?request/i.test(type || "")) &&
      msg.includes("tool_call") &&
      msg.includes("must be followed by tool messages")
    );
  }





// 2) Un “fixer” que agrega los mensajes tool faltantes para cada tool_call_id de tu último mensaje de asistente:
// Si usas SDK OpenAI “raw”: empuja { role: "tool", tool_call_id, content }.
// Si usas LangChain: crea new ToolMessage({ content, tool_call_id }) (o estructura equivalente según tu versión).
// Ejemplo genérico (JS/TS, usando un mapa nombre→tool):

type ToolImpl = { name: string; invoke: (args: any) => Promise<any> };

export async function ensureToolResponses(
  messages: any[],
  tools?: ToolImpl[]
): Promise<any[]> {
  const toolByName = new Map(tools?.map(t => [t.name, t]) || []);
  // Busca el último asistente con tool_calls
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m.role === "assistant" && Array.isArray(m.tool_calls) && m.tool_calls.length) {
      for (const call of m.tool_calls) {
        const callId = call.id || call.tool_call_id;
        const name = call.name || call.function?.name;
        const args = call.args ?? (call.function?.arguments ? JSON.parse(call.function.arguments) : {});
        const hasResponse = messages.some(
          (mm, idx) => idx > i && mm.role === "tool" && mm.tool_call_id === callId
        );
        if (!hasResponse) {
          const tool = toolByName.get(name);
          if (!tool) throw new Error(`Tool no encontrada: ${name}`);
          const result = await tool.invoke(args);
          console.log("result", result);
          const toolMessage = new ToolMessage({
            content: JSON.stringify(result), // o string directo
            tool_call_id: callId,
            name: name,
          });
          messages.push(toolMessage);
        }
      }
      break;
    }
  }
  return messages;
}