Opción A — result.gotoRule() en la Code Action de Botmaker ✅ (más limpia)                                                                                                                                                                                                          Como tu webhook es llamado desde una Code Action de Botmaker, esa Code Action puede leer tu respuesta y hacer el redirect:                                                                                                                                                          // Code Action en Botmaker                                                                                                                const response = await fetch('https://tu-servidor/botmaker/webhook', { ... });                                                            const data = await response.json();                                                                                                                                                                                                                                                 if (data.gotoRule) {                                                                                                                        result.gotoRule(data.gotoRule); // redirige al flujo indicado                                                                         
  } else {
    result.text(data.replyText);
  }
  result.done();

  Tu webhook simplemente agregaría un campo gotoRule cuando el agente detecta la intención:

  { "replyText": "...", "agent_is_speak": false, "gotoRule": "autorizaciones" }

  ---
  Opción B — API externa POST /api/v1.0/intent/v2

  Tu servidor hace una llamada de vuelta a Botmaker para disparar el flujo:

  POST https://go.botmaker.com/api/v1.0/intent/v2
  { "platformContactId": "...", "ruleNameOrId": "autorizaciones", ... }

  Más complejo, requiere manejar credenciales y timing.

  ---
  Mi recomendación

  Opción A es la más elegante porque ya estás dentro de una Code Action. Solo necesitás:

  1. Agregar gotoRule al response de tu webhook cuando el agente detecte la intención
  2. Modificar la Code Action en Botmaker para leer ese campo y llamar result.gotoRule()

  ¿Cómo está configurada actualmente tu Code Action en Botmaker? ¿Podés compartir el código que tiene? Eso me ayuda a ver exactamente cómo
   integrar esto.