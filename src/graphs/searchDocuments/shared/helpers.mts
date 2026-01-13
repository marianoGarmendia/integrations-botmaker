export function fechaHoraUsuario() {
    const ahora = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // ej: "America/Argentina/Buenos_Aires"
  
    const fecha = new Intl.DateTimeFormat(undefined, {
      weekday: "long",   // día de la semana completo
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(ahora);
  
    const hora = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,     // poné true si querés formato 12h
      timeZoneName: "short" // muestra GMT-3, etc.
    }).format(ahora);
  
    return { fecha, hora, timeZone: tz, texto: `${fecha} — ${hora} (${tz})` };
  }