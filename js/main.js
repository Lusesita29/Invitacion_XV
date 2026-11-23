const CONFIG = {
  nombre: " keitlin Agudelo García",
  padres: "Jhonatan Agudelo & Katherine García",
  frase: "“Como faroles que iluminan el cielo, cada persona que amo ha llenado mi vida de luz. Hoy quiero que brilles conmigo.”",

  // Fecha y hora del evento en formato ISO con zona horaria (Colombia = -05:00)
  fechaEvento: "2027-02-20T19:00:00-05:00",
  duracionHoras: 7,                          // para el botón "Agendar en mi calendario"
  fechaTexto: "Sábado 20 de febrero de 2027",
  fechaCorta: "20 · 02 · 2027",

  ceremonia: {
    titulo: "Ceremonia religiosa",
    lugar: "Parroquia Nuestra Señora de la Candelaria",
    direccion: "Calle 10 # 5-20, Bogotá",
    hora: "7:00 p. m.",
    mapsUrl: "",   // Pega el enlace de "Compartir" de Google Maps (https://maps.app.goo.gl/...)
    wazeUrl: ""    // Opcional. Si lo dejas vacío, se genera con la dirección
  },
  recepcion: {
    titulo: "Recepción",
    lugar: "Salón Jardín de los Sueños",
    direccion: "Carrera 15 # 85-40, Bogotá",
    hora: "9:00 p. m.",
    mapsUrl: "",
    wazeUrl: ""
  },

  // Fotos: súbelas a assets/img/ y escribe aquí sus nombres
  fotos: [
    "assets/img/foto1.jpg",
    "assets/img/foto2.jpg",
    "assets/img/foto3.jpg",
    "assets/img/foto4.jpg"
  ],

  itinerario: [
    { hora: "7:00 p. m.", actividad: "Ceremonia religiosa" },
    { hora: "9:00 p. m.", actividad: "Recepción y entrada de la quinceañera" },
    { hora: "9:45 p. m.", actividad: "Vals y brindis" },
    { hora: "10:30 p. m.", actividad: "Cena" },
    { hora: "11:30 p. m.", actividad: "¡A bailar bajo los faroles!" }
  ],

  vestimenta: "Formal",
  notaVestimenta: "El color lila está reservado para la quinceañera.",
  regalo: "Tu presencia es mi mejor regalo; si deseas obsequiarme algo, habrá lluvia de sobres.",
  notaPase: "Evento solo para adultos.",
  pasesPorDefecto: 1,

  // Confirmación de asistencia
  fechaLimite: "10 de febrero de 2027",
  whatsapp: "573001234567"            // Código de país + número, sin + ni espacios
};

/* =========================================================
   2. UTILIDADES
   ========================================================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const leer = (ruta) => ruta.split(".").reduce((o, k) => (o ? o[k] : undefined), CONFIG);

const params = new URLSearchParams(location.search);
const INVITADO = (params.get("invitado") || "").trim().slice(0, 60);
const PASES = Math.max(1, Math.min(20, parseInt(params.get("pases"), 10) || CONFIG.pasesPorDefecto));

/* =========================================================
   3. TEXTOS DESDE LA CONFIGURACIÓN
   ========================================================= */
function aplicarConfig() {
  $$("[data-config]").forEach((el) => {
    const valor = leer(el.dataset.config);
    if (typeof valor === "string") el.textContent = valor;
  });
  document.title = `Mis XV Años · ${CONFIG.nombre}`;
  if (INVITADO) $("#saludoInvitado").textContent = `${INVITADO}, estás invitado(a) a`;
}

/* =========================================================
   4. LIBRO CON ANIMACIÓN DE PÁGINAS
   ========================================================= */
let hojas = [];
let actual = 0; // número de hojas ya volteadas

function prepararLibro() {
  hojas = $$(".hoja");
  hojas.forEach((hoja, i) => {
    const frente = hoja.querySelector(".frente");

    // Decoración floral en las esquinas
    frente.insertAdjacentHTML("beforeend",
      `<svg class="deco-esq sup" aria-hidden="true"><use href="#esquinaFlor"/></svg>
       <svg class="deco-esq inf" aria-hidden="true"><use href="#esquinaFlor"/></svg>
       <span class="num-pag">${i + 1}</span>`);

    // Esquina doblada para pasar página (menos en la última)
    if (i < hojas.length - 1) {
      const esquina = document.createElement("button");
      esquina.className = "esquina";
      esquina.setAttribute("aria-label", "Pasar página");
      esquina.addEventListener("click", siguiente);
      frente.appendChild(esquina);
    }

    // Reverso decorativo
    hoja.insertAdjacentHTML("beforeend",
      `<div class="cara reverso" aria-hidden="true"><svg><use href="#torre"/></svg></div>`);

    hoja.addEventListener("transitionend", (e) => {
      if (e.propertyName === "transform") hoja.classList.remove("girando");
    });
  });

  $("#btnSiguiente").addEventListener("click", siguiente);
  $("#btnAnterior").addEventListener("click", anterior);

  document.addEventListener("keydown", (e) => {
    if (!$("#lightbox").hidden) return;
    if (e.key === "ArrowRight") siguiente();
    if (e.key === "ArrowLeft") anterior();
  });

  // Deslizar con el dedo
  let x0 = 0, y0 = 0;
  const libro = $("#libro");
  libro.addEventListener("touchstart", (e) => {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  libro.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? siguiente() : anterior();
  }, { passive: true });

  actualizarLibro();
}

function siguiente() {
  if (actual >= hojas.length - 1) return;
  const hoja = hojas[actual];
  hoja.classList.add("girando", "volteada");
  actual++;
  actualizarLibro();
}

function anterior() {
  if (actual <= 0) return;
  actual--;
  const hoja = hojas[actual];
  hoja.classList.add("girando");
  hoja.classList.remove("volteada");
  actualizarLibro();
}

function actualizarLibro() {
  const total = hojas.length;
  hojas.forEach((h, i) => {
    h.style.zIndex = h.classList.contains("volteada") ? i + 1 : total - i + total;
    h.setAttribute("aria-hidden", i === actual ? "false" : "true");
  });
  $("#libro").classList.toggle("abierto", actual > 0);
  $("#indicador").textContent = `${actual + 1} / ${total}`;
  $("#btnAnterior").disabled = actual === 0;
  $("#btnSiguiente").disabled = actual === total - 1;
}

/* =========================================================
   5. CUENTA REGRESIVA
   ========================================================= */
function iniciarCuentaRegresiva() {
  const objetivo = new Date(CONFIG.fechaEvento).getTime();
  const dos = (n) => String(n).padStart(2, "0");

  function tick() {
    const resta = objetivo - Date.now();
    if (resta <= 0) {
      ["#cDias", "#cHoras", "#cMin", "#cSeg"].forEach((s) => ($(s).textContent = "00"));
      $("#cuentaMensaje").textContent = "¡Hoy es el gran día! ✨";
      clearInterval(intervalo);
      return;
    }
    $("#cDias").textContent = dos(Math.floor(resta / 86400000));
    $("#cHoras").textContent = dos(Math.floor((resta / 3600000) % 24));
    $("#cMin").textContent = dos(Math.floor((resta / 60000) % 60));
    $("#cSeg").textContent = dos(Math.floor((resta / 1000) % 60));
  }
  const intervalo = setInterval(tick, 1000);
  tick();

  // Enlace de Google Calendar
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const inicio = new Date(CONFIG.fechaEvento);
  const fin = new Date(inicio.getTime() + CONFIG.duracionHoras * 3600000);
  const cal = new URL("https://calendar.google.com/calendar/render");
  cal.searchParams.set("action", "TEMPLATE");
  cal.searchParams.set("text", `XV Años de ${CONFIG.nombre}`);
  cal.searchParams.set("dates", `${fmt(inicio)}/${fmt(fin)}`);
  cal.searchParams.set("details", `Ceremonia: ${CONFIG.ceremonia.lugar}\nRecepción: ${CONFIG.recepcion.lugar}`);
  cal.searchParams.set("location", CONFIG.ceremonia.direccion);
  $("#btnCalendario").href = cal.toString();
}

/* =========================================================
   6. BOTONES DE UBICACIÓN
   ========================================================= */
function prepararUbicaciones() {
  const enlaces = (lugar) => {
    const q = encodeURIComponent(`${lugar.lugar}, ${lugar.direccion}`);
    return {
      maps: lugar.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${q}`,
      waze: lugar.wazeUrl || `https://waze.com/ul?q=${q}&navigate=yes`
    };
  };
  const c = enlaces(CONFIG.ceremonia);
  const r = enlaces(CONFIG.recepcion);
  $("#mapsCeremonia").href = c.maps;
  $("#wazeCeremonia").href = c.waze;
  $("#mapsRecepcion").href = r.maps;
  $("#wazeRecepcion").href = r.waze;
}

/* =========================================================
   7. GALERÍA DE FOTOS + VISOR
   ========================================================= */
let fotoActual = 0;
function renderGaleria() {
  const g = $("#galeria");
  CONFIG.fotos.forEach((src, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "foto";
    const img = new Image();
    img.loading = "lazy";
    img.alt = `Foto ${i + 1} de ${CONFIG.nombre}`;
    img.src = src;
    img.onerror = () => { btn.classList.add("vacia"); img.remove(); };
    btn.appendChild(img);
    btn.addEventListener("click", () => { if (!btn.classList.contains("vacia")) abrirFoto(i); });
    g.appendChild(btn);
  });

  $("#lbCerrar").addEventListener("click", cerrarFoto);
  $("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") cerrarFoto(); });
  $("#lbPrev").addEventListener("click", () => moverFoto(-1));
  $("#lbNext").addEventListener("click", () => moverFoto(1));
  document.addEventListener("keydown", (e) => {
    if ($("#lightbox").hidden) return;
    if (e.key === "Escape") cerrarFoto();
    if (e.key === "ArrowRight") moverFoto(1);
    if (e.key === "ArrowLeft") moverFoto(-1);
  });
}
function abrirFoto(i) {
  fotoActual = i;
  $("#lbImg").src = CONFIG.fotos[i];
  $("#lightbox").hidden = false;
}
function cerrarFoto() { $("#lightbox").hidden = true; }
function moverFoto(paso) {
  const n = CONFIG.fotos.length;
  abrirFoto((fotoActual + paso + n) % n);
}

/* =========================================================
   8. ITINERARIO
   ========================================================= */
function renderItinerario() {
  const ul = $("#itinerario");
  CONFIG.itinerario.forEach(({ hora, actividad }) => {
    const li = document.createElement("li");
    const s = document.createElement("strong");
    const t = document.createElement("span");
    s.textContent = hora;
    t.textContent = actividad;
    li.append(s, t);
    ul.appendChild(li);
  });
}

/* =========================================================
   9. PASES PERSONALIZADOS  (?invitado=Familia%20Pérez&pases=4)
   ========================================================= */
function prepararPase() {
  $("#paseNombre").textContent = INVITADO || "Invitado especial";
  $("#paseCantidad").textContent = PASES;
  $("#paseTexto").textContent = PASES === 1 ? "pase" : "pases";
}

/* =========================================================
   10. CONFIRMACIÓN (Google Forms + WhatsApp)
   ========================================================= */
function prepararConfirmacion() {
  const f = CONFIG.formulario;
  const form = new URL(f.url);
  form.searchParams.set("usp", "pp_url");
  if (INVITADO) form.searchParams.set(f.campoNombre, INVITADO);
  form.searchParams.set(f.campoPases, PASES);
  $("#btnFormulario").href = form.toString();

  const quien = INVITADO ? `Soy ${INVITADO} y` : "Hola,";
  const msg = `${quien} confirmo mi asistencia a los XV años de ${CONFIG.nombre} ✨ (${PASES} ${PASES === 1 ? "pase" : "pases"})`;
  $("#btnWhatsapp").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}

/* =========================================================
   11. MÚSICA
   ========================================================= */
let musicaPausadaPorUsuario = false;
function prepararMusica() {
  const audio = $("#audio");
  const btn = $("#btnMusica");
  audio.volume = 0.6;

  btn.addEventListener("click", () => {
    if (audio.paused) { musicaPausadaPorUsuario = false; reproducir(); }
    else { musicaPausadaPorUsuario = true; audio.pause(); }
  });
  audio.addEventListener("play", () => { btn.classList.add("sonando"); btn.setAttribute("aria-label", "Pausar música"); });
  audio.addEventListener("pause", () => { btn.classList.remove("sonando"); btn.setAttribute("aria-label", "Reproducir música"); });

  // Pausar si la persona cambia de pestaña o bloquea el celular
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (!musicaPausadaPorUsuario && !btn.classList.contains("oculto")) reproducir();
  });
}
function reproducir() { $("#audio").play().catch(() => {}); }

/* =========================================================
   12. BIENVENIDA Y FAROLES
   ========================================================= */
function prepararBienvenida() {
  $("#btnAbrir").addEventListener("click", () => {
    reproducir(); // los navegadores solo permiten audio después de un toque
    $("#bienvenida").classList.add("salir");
    $("#escenario").classList.remove("oculto");
    $("#btnMusica").classList.remove("oculto");
  });
}

function crearFaroles() {
  const cont = $("#faroles");
  const cantidad = innerWidth < 600 ? 14 : 24;
  for (let i = 0; i < cantidad; i++) {
    const f = document.createElement("span");
    f.className = "farol";
    const t = 10 + Math.random() * 18;
    f.style.cssText = `left:${Math.random() * 100}%;width:${t}px;height:${t * 1.3}px;` +
      `animation-duration:${16 + Math.random() * 18}s;animation-delay:${-Math.random() * 34}s;` +
      `opacity:${0.45 + Math.random() * 0.55}`;
    cont.appendChild(f);
  }
}

/* =========================================================
   INICIO
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  aplicarConfig();
  prepararLibro();
  renderGaleria();
  renderItinerario();
  prepararUbicaciones();
  prepararPase();
  prepararConfirmacion();
  iniciarCuentaRegresiva();
  prepararMusica();
  prepararBienvenida();
  crearFaroles();
});
