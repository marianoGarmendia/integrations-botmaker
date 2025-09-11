Mira Botmaker API Docs para probar y aprender con ejemplos desde tu browser. Cuando clickees el botón 'Authorize' te van a pedir tu 'Access Token' que se provee en esta misma página.

Cuando quieras hacer llamados a el API de Botmaker desde tus servidores, también se te solicitará autenticación usando el 'Access Token' provisto aquí. Este token es un JWT (JSON web token) y tiene expiración. Ten en cuenta que vas a necesitar renovarlo periódicamente mediante un llamado al servicio REST refreshAPICredentials

INTEGRACION BOTMAKER 

https://chatgpt.com/c/68c1a84a-b9f4-8321-b2d5-28afe5938600

Pasos concretos
1) Botmaker (lado cliente)

Genera credenciales del API v2 (access token) y guarda el token. 
Botmaker

Crea un Webhook de tipo Message and Status apuntando a POST https://TU_API/botmaker/webhook. Marca:

User Messages (mínimo).

Message Status si quieres delivery/read events.

Include change variables para que lleguen las variables del flujo cuando cambien.

Define un Security Token (se envía en auth-bm-token). 
Botmaker

En tu flujo activo, en el fallback (o en el bloque que definas como “caso especial”):

Setea una variable (p. ej. external_handoff = true).

(Recomendado) Mute Chatbot temporalmente para evitar doble respuesta mientras tu bot externo contesta. 
Botmaker

Tip: si luego quieres que el flujo retome en un intent específico, desde tu backend puedes enviar la respuesta y además disparar el intent por API v2 (endpoint de “trigger intents”). 
api.botmaker.com

2) Backend Node.js + LangGraph (tu bot)

Webhook de entrada + caller de la API de Botmaker. Ejemplo minimalista (Express + axios):

```JAVASCRIPT

import express from "express";
import axios from "axios";

const app = express();
app.use(express.json({ limit: "2mb" }));

const {
  BM_ACCESS_TOKEN,          // access token desde Botmaker (Integrations → API)
  BM_SECURITY_TOKEN,        // el que configuraste en el Webhook (auth-bm-token)
  BM_API_BASE = "https://api.botmaker.com/v2.0" // base API v2
} = process.env;

function assertAuth(req: express.Request) {
  const hdr = req.headers["auth-bm-token"];
  if (!BM_SECURITY_TOKEN || hdr !== BM_SECURITY_TOKEN) {
    const e = new Error("Unauthorized webhook");
    // Opcional: loggear IPs y rechazar si no están en la lista oficial de Botmaker
    throw e;
  }
}

app.post("/botmaker/webhook", async (req, res) => {
  try {
    assertAuth(req);

    // ⚠️ El payload exacto puede variar por canal; típicamente tendrás:
    // { message: { text, id }, chatId, contactId, channelId, variables, ... }
    const event = req.body;

    const text = event?.message?.text || "";
    const chatId = event?.chatId;
    const contactId = event?.contactId;   // en WhatsApp suele ser el número del cliente
    const channelId = event?.channelId;   // id del canal (WA/Webchat/IG...)
    const vars = event?.variables || {};

    // Procesa sólo si el flujo te marcó handoff externo
    if (!vars?.external_handoff) {
      return res.status(200).json({ ok: true, ignored: true });
    }

    // 1) Llama a tu LangGraph agent
    const answer = await runLangGraphAgent({ text, chatId, contactId });

    // 2) Responde por API v2 “send messages” (Chat Actions → Send messages)
    //    El path exacto lo ves en el apidocs del portal; el body típico incluye channelId y contactId.
    const SEND_MESSAGE_URL = `${BM_API_BASE}/chats-actions/send-message`; // ajusta al endpoint oficial "Send messages"
    await axios.post(
      SEND_MESSAGE_URL,
      {
        channelId,
        contactId,
        message: { text: answer },
        // Envía metadatos que luego volverán por webhook (útil para correlación)
        webhookPayload: { handledBy: "external-ai", model: "langgraph" }
      },
      { headers: { "access-token": BM_ACCESS_TOKEN } }
    );

    // (Opcional) trigger de intent para volver al flujo nativo
    // await axios.post(`${BM_API_BASE}/chats-actions/trigger-intent`, { chatId, intent: "VOLVER_FLUJO" }, { headers: { "access-token": BM_ACCESS_TOKEN } });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ ok: true }); // devuelve 200 para que Botmaker no reintente
  }
});

// Stub LangGraph
async function runLangGraphAgent({ text }: { text: string }) {
  // aquí invocas tu graph.run/stream, etc.
  return `Entendido: ${text}`;
}

app.listen(3000, () => console.log("Webhook listening on :3000"));

```


Notas clave del código

El header de autenticación del webhook es auth-bm-token; tú lo comparas con tu secreto. 
Botmaker

Para enviar mensajes, usa el endpoint “Send messages” (sección Chat Actions) con access-token en el header; el body requiere channelId y contactId. 
Botmaker

El campo webhookPayload hace que Botmaker te reenvíe esos metadatos en el próximo webhook (sirve para trazabilidad/locking). 
Botmaker

Si el usuario está fuera de la ventana de 24 h en WhatsApp, primero envía una template por API y después tu mensaje libre. 
Botmaker
+1

Si quieres reforzar seguridad, whitelistea IPs de Botmaker. 
Botmaker

Control de “quién responde”

Tienes dos formas limpias de evitar “doble respuesta”:

Mute Chatbot en el bloque de handoff (y lo “desmuteas” después de tu respuesta si el flujo debe seguir). 
Botmaker

Bandera de variable (external_handoff): tu backend solo contesta si la ve true en el webhook. Activa/desactiva esa variable en el flujo.

Checklist de producción

✅ Token de API v2 y credenciales listas. 
Botmaker

✅ Webhook “Message & Status” configurado, con User Messages y auth-bm-token. 
Botmaker

✅ IP allowlist aplicada. 
Botmaker

✅ Fallback del flujo setea external_handoff=true y Mute Chatbot. 
Botmaker

✅ Manejo de 24 h con plantillas si corresponde. 
Botmaker
+1

✅ Logs + correlation IDs (por ejemplo, webhookPayload.runId) para trazar ida y vuelta.