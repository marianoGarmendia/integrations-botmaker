// Botmaker → Tu endpoint: Body principal
export interface BotmakerWebhookBody {
    userData: BotmakerUserData;
    message: BotmakerMessage;
    params: Record<string, unknown>;
  }
  
  // userData (datos de sesión/usuario)
  export interface BotmakerUserData {
    CURRENT_OPERATOR_EMAIL: string;
    LAST_SESSION_CREATION_TIME: string; // ISO
    PLATFORM_CONTACT_ID: string;        // <- Útil como contactId
    webChatCountry?: string;
    _id_: string;                       // <- customer/contact internal id
    QUEUE: string;
    LAST_NAME?: string;
    FIRST_NAME?: string;
    CHAT_CHANNEL_ID: string;            // <- Útil como channelId
    CHAT_PLATFORM_ID: string;           // 'webchat' | 'whatsapp' | ...
    LAST_MODIFICATION: string;          // ISO
    HAS_TALKED?: boolean;
    constants?: string;                 // JSON string
    BOT_MUTED?: boolean;
    LAST_SEEN?: string;                 // ISO
    variables?: {
      ca_error?: string;
      response_variable?: string;
      botmakerEnvironment?: string;
      aUserValue?: string;
      [k: string]: unknown;
    };
    tags?: string[];
    ipAddress?: string;
    messengerReferral?: string;
    locale?: string;
    currentBotId?: string;
    [k: string]: unknown;               // forward-compat
  }
  
  // message (evento del chat)
  export interface BotmakerMessage {
    BUSINESS_ID: string;
    REACTIONS?: unknown[];
    CREATION_TIME: string;              // ISO
    INTENT_ID?: string;
    FROM_NAME?: string;
    FILES_URLS: string[];
    CUSTOMER_ID: string;
    _id_: string;
    FROM: string;
    OBJECT_TYPE: 'Message' | string;
    QUEUE: string;
    DEBUG?: { lastBotLiteral?: string; [k: string]: unknown };
    SESSION_CREATION_TIME: string;      // ISO
    AUDIOS_URLS: string[];
    CHAT_PLATFORM_ID: string;           // 'webchat' | 'whatsapp' | ...
    MESSAGE: string;                    // OJO: a veces JSON string (button/intent), a veces texto plano
    CALLBACK_ID?: string;               // Ídem, frecuentemente JSON string
    CHAT_CHANNEL_ID: string;
    RENDERING_INFO?: { [k: string]: unknown };
    LAST_MODIFICATION: string;          // ISO
    TO: string;
    VIDEOS_URLS: string[];
    TAGS?: Record<string, unknown>;
    IMAGES_URLS: string[];
    [k: string]: unknown;               // forward-compat
  }
  
  // Cuando MESSAGE/CALLBACK_ID vienen como JSON (webchat buttons)
  export interface BotmakerCallbackPayload {
    intent?: string;
    button?: string;
    entities?: string | Record<string, unknown>;
    [k: string]: unknown;
  }
  
  // Helpers
  export const parseJsonSafe = <T = any>(s?: string | null): T | null => {
    if (!s) return null;
    try { return JSON.parse(s) as T; } catch { return null; }
  };
  
  // Extrae un "texto del usuario" robusto (button si existe; si no, el MESSAGE plano)
  export const extractUserText = (body: BotmakerWebhookBody): string => {
    const rawMsg = body?.message?.MESSAGE ?? '';
    const rawCb  = body?.message?.CALLBACK_ID ?? '';
    const parsedMsg = parseJsonSafe<BotmakerCallbackPayload>(rawMsg);
    const parsedCb  = parseJsonSafe<BotmakerCallbackPayload>(rawCb);
  
    if (parsedMsg?.button) return String(parsedMsg.button);
    if (parsedCb?.button)  return String(parsedCb.button);
    // Si MESSAGE no era JSON, úsalo como texto
    if (typeof rawMsg === 'string' && rawMsg.trim()) return rawMsg.trim();
    return '';
  };
  
  // Ejemplo de uso en tu handler Express:
  import type { Request, Response } from 'express';
  
  export const handleBotmakerWebhook = (req: Request, res: Response) => {
    const body = req.body as BotmakerWebhookBody;
  
    const contactId  = body.userData.PLATFORM_CONTACT_ID; // para API v2
    const channelId  = body.userData.CHAT_CHANNEL_ID;     // para API v2
    const platform   = body.userData.CHAT_PLATFORM_ID;    // webchat/whatsapp/etc.
    const userText   = extractUserText(body);             // "Agente de IA" en tu ejemplo
    const vars       = body.userData.variables ?? {};
  
    // ...tu lógica...
    // res.json({ replyText: `OK ${contactId}: ${userText}` });
    res.json({ ok: true });
  };
  