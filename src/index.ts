import express from 'express';
import dotenv from 'dotenv';
import router from '@/routes';
import { log } from 'node:console';

dotenv.config();

const {
  BM_ACCESS_TOKEN,          // access token desde Botmaker (Integrations → API)
  BM_SECURITY_TOKEN,        // el que configuraste en el Webhook (auth-bm-token)
  BM_API_BASE = "https://api.botmaker.com/v2.0" // base API v2
} = process.env;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', router);
app.post('/', (req, res) => {
  console.log('Ruta raíz accedida');
  console.log(req.body);
  console.log(req.url);

    return res.json({ replyText: " Respuesta del agente LangGraph" });

})

const callAgent = () => {
  fetch("https://djk48r3j-3000.brs.devtunnels.ms/botmaker/webhook",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BM_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      message: "un mensaje de prueba"
    })
  })
}

app.post("/botmaker/webhook" , (req, res) => {
 
console.log(req.body);

console.log(req.headers)




  return res.json({ message: "pong" }); 

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