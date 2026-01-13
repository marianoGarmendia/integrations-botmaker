import express from 'express';
import dotenv from 'dotenv';
// import router from './routes';
import cors from 'cors';

import { graph } from './graphs/searchDocuments/agent_graph/graph.mjs';


dotenv.config();

// Memoria simple en proceso para evitar duplicados por usuario
const MAX_RECENT_IDS = 20;
const recentMessageIdsByUser = new Map<string, string[]>();

// Memoria para limitar cantidad de respuestas por cliente
const MAX_AGENT_REPLIES = 7;
const customerReplyCounts = new Map<string, number>();
// Memoria para controlar inactividad por cliente (último timestamp recibido)
const lastCustomerMessageAt = new Map<string, number>();

const {
  BM_ACCESS_TOKEN,          // access token desde Botmaker (Integrations → API)
  BM_SECURITY_TOKEN,        // el que configuraste en el Webhook (auth-bm-token)
  BM_API_BASE = "https://api.botmaker.com/v2.0" // base API v2
} = process.env;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())

app.use(express.json());
// app.use('/api', router);
app.post('/', (req, res) => {
  console.log('Ruta raíz accedida');
  console.log(req.body);
  console.log(req.url);

    return res.json({ replyText: " Respuesta del agente LangGraph" });

})

function assertAuth(req: express.Request) {
  const hdr = req.headers['auth-bm-token'];
  if (!BM_SECURITY_TOKEN || hdr !== BM_SECURITY_TOKEN) {
    const e = new Error('Unauthorized webhook');
    throw e;
  }
}



app.post("/botmaker/webhook" , async (req, res) => {
 try {
  // assertAuth(req);
  const body = req.body;
  const {context, TO} = body;
  const customer_id = context.message?.CUSTOMER_ID as string | undefined;
  console.log("Message inbound --->>>")
  console.log("TO --->>>")
  console.log(body.TO)
  console.log("message --->>>")
  console.log(body.message)
  console.log(body.userMessage)
  const id = body.userData._id_ as string
  const userMessage = body.userMessage.includes("button") ? "te quiero hacer una consulta" : body.userMessage
console.log("customer_id --->>>", customer_id)

  // Chequeo de inactividad (5 minutos) por customer_id
  if (customer_id) {
    const now = Date.now();
    const lastAt = lastCustomerMessageAt.get(customer_id) ?? 0;
    if (lastAt && (now - lastAt) > 5 * 60 * 1000) {
      // actualizar timestamp y cortar con redirección al menú
      lastCustomerMessageAt.set(customer_id, now);
      return res.status(200).json({ replyText: "Redirigiendo al menu principal" , agent_is_speak: false });
    }
    // actualizar timestamp de último mensaje del cliente
    lastCustomerMessageAt.set(customer_id, now);
  }

  // Corte temprano si alcanzó el máximo de respuestas
  if (customer_id) {
    
    const prevCount = customerReplyCounts.get(customer_id) ?? 0;
    console.log("mensajes del agente al usuario --->>>", prevCount)
    if (prevCount >= MAX_AGENT_REPLIES) {
      return res.status(200).json({ replyText: "Para mas informacion puedes volver al menu principal, solo di 'ok' para volver al menu principal", agent_is_speak: false });
    }
  }



  if(body.TO === "me"){
    res.status(200)
console.log("Simulacion invokando al agente langgraph")
    const result = await graph.invoke({
      messages: userMessage
    }, {
      configurable: {
        thread_id: customer_id ,
      },
    });
  

    // Registrar respuesta enviada por el agente
    if (customer_id) {
      const prevCount = customerReplyCounts.get(customer_id) ?? 0;
      customerReplyCounts.set(customer_id, prevCount + 1);
    }

   
    console.log("result linee 72 - index.ts : >>>>>");
    // console.log(result);
    // const responseAgent = result.messages[result.messages.length - 1].content as string
    return res.json({ replyText:result.messages[result.messages.length - 1].content as string, agent_is_speak: true }); // Responder a Botmaker
  }

 



 } catch (err) {
  console.error(err);
  return res.status(200).json({ ok: true, error: true });
 }
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


/*
Preguntarle con si o no
el siguiente enlace para cuando es no

si es Si  le pide que suba el archivo, que adjunte en el chat los siguientes docuemntos
comprobante de domicilio y la el documento.

el ine  el comprobante de docmicilio la guardamos en el sistema , le damos las gracias y procedemos a la validación.

nos vamos a ponder en contacto con vos.

Es para méxico.

*/