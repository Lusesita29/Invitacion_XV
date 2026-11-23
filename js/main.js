/* =========================================================
   1. CONFIGURACIÓN — edita SOLO esta parte con tus datos
   ========================================================= */
const CONFIG = {
  nombre: "Keitlin",
  musica: "assets/audio/Enredados.mp3",
  apellidos: "Agudelo García",
  nombreCompleto: "Keitlin Agudelo García",
  padre: "Jhonatan Agudelo",
  madre: "Katherine García",
  frase: "“Como faroles que iluminan el cielo, cada persona que amo ha llenado mi vida de luz. Hoy quiero que brilles conmigo.”",

  // Fecha y hora en formato ISO con zona horaria de Colombia (-05:00)
  fechaEvento: "2026-12-19T20:00:00-05:00",
  fechaTexto: "Sábado 19 de diciembre de 2026",
  fechaCorta: "19 · 12 · 2026",
  hora: "8:00 p. m.",

  lugar: {                   // Opcional: nombre del salón o "Casa de la familia Agudelo"
    direccion: "Calle 37 # 9D-03",
    Barrio: "El Campito, Barranquilla, Atlántico",                    // ⚠️ ESCRIBE LA CIUDAD (ej. "Medellín") para que Maps encuentre la dirección
    mapsUrl: "https://maps.app.goo.gl/6yihX9d9K3eJJbQn8",                   // Mejor aún: pega el enlace de "Compartir" de Google Maps

  },

  // Música (debe coincidir EXACTO con el nombre del archivo, con mayúsculas)
  musica: "assets/audio/Enredados.mp3",
  inicioMusica: 0,                 // segundo en el que empieza la canción

  // Fotos de la quinceañera: aparecen intercaladas, una página sí y una no.
  // Hay 7 espacios para fotos. Si pones menos, se repiten en orden.
  fotos: [
    "assets/img/foto1.jpg",
    "assets/img/foto2.jpg",
    "assets/img/foto3.jpg",
    "assets/img/foto4.jpg",
    "assets/img/foto5.jpg",
    "assets/img/foto6.jpg",
    "assets/img/foto7.jpg"
  ],

  vestimenta: "Formal",
  notaVestimenta: "El color lila está reservado para la quinceañera.",
  regalo: "Tu presencia es mi mejor regalo; si deseas obsequiarme algo, habrá lluvia de sobres.",
  notaPase: "",                    // ej. "Evento solo para adultos." (vacío = no se muestra)
  pasesPorDefecto: 1,

  // Confirmación de asistencia
  fechaLimite: "12 de diciembre de 2026",
  formulario: {
    url: "https://docs.google.com/forms/d/e/TU_ID_DEL_FORMULARIO/viewform",
    campoNombre: "entry.1111111111",
    campoPases: "entry.2222222222"
  },
  whatsapp: "573001234567"         // Código de país + número, sin + ni espacios
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
    if (typeof valor === "string") {
      el.textContent = valor;
      el.hidden = valor.trim() === "";
    }
  });
  document.title = `Mis XV Años · ${CONFIG.nombre}`;
  if (INVITADO) $("#saludoInvitado").textContent = `${INVITADO}, estás invitado(a) a`;
}

/* =========================================================
   4. PÁGINAS DE FOTO INTERCALADAS (una sí, una no)
   ========================================================= */
function insertarFotos() {
  const fotos = CONFIG.fotos;
  if (!fotos.length) return;
  const paginas = $$("#libro .hoja");

  paginas.slice(0, -1).forEach((pagina, i) => {
    const n = i % fotos.length;
    const hoja = document.createElement("article");
    hoja.className = "hoja hoja-foto";
    hoja.innerHTML =
      `<div class="cara frente foto-pag"><div class="pagina">
         <button type="button" class="marco-foto" aria-label="Ver foto en grande"></button>
         <p class="pie-foto"></p>
       </div></div>`;

    const marco = hoja.querySelector(".marco-foto");
    const img = new Image();
    img.alt = `Foto de ${CONFIG.nombre}`;
    img.src = fotos[n];
    img.onerror = () => { marco.classList.add("vacia"); img.remove(); };
    marco.appendChild(img);
    marco.addEventListener("click", () => { if (!marco.classList.contains("vacia")) abrirFoto(n); });
    hoja.querySelector(".pie-foto").textContent = CONFIG.nombre;

    pagina.after(hoja);
  });
}

/* =========================================================
   5. LIBRO CON ANIMACIÓN DE PÁGINAS
   ========================================================= */
let hojas = [];
let actual = 0;
let tActiva;

function prepararLibro() {
  insertarFotos();
  hojas = $$(".hoja");

  hojas.forEach((hoja, i) => {
    const frente = hoja.querySelector(".frente");
    frente.insertAdjacentHTML("beforeend",
      `<svg class="deco-esq sup" aria-hidden="true"><use href="#esquinaFlor"/></svg>
       <svg class="deco-esq inf" aria-hidden="true"><use href="#esquinaFlor"/></svg>
       <span class="num-pag">${i + 1}</span>`);

    if (i < hojas.length - 1) {
      const esquina = document.createElement("button");
      esquina.className = "esquina";
      esquina.setAttribute("aria-label", "Pasar página");
      esquina.addEventListener("click", siguiente);
      frente.appendChild(esquina);
    }

    hoja.insertAdjacentHTML("beforeend",
      `<div class="cara reverso" aria-hidden="true"><svg><use href="#torre"/></svg></div>`);

    hoja.addEventListener("transitionend", (e) => {
      if (e.propertyName === "transform") hoja.classList.remove("girando");
    });

    // Orden de aparición de cada texto (efecto escalonado)
    [...hoja.querySelector(".pagina").children].forEach((el, k) => el.style.setProperty("--i", k));
  });

  $("#btnSiguiente").addEventListener("click", siguiente);
  $("#btnAnterior").addEventListener("click", anterior);

  document.addEventListener("keydown", (e) => {
    if (!$("#lightbox").hidden) return;
    if (e.key === "ArrowRight") siguiente();
    if (e.key === "ArrowLeft") anterior();
  });

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
  hojas[actual].classList.add("girando", "volteada");
  actual++;
  actualizarLibro();
  marcarActiva(0);
}

function anterior() {
  if (actual <= 0) return;
  actual--;
  const hoja = hojas[actual];
  hoja.classList.add("girando");
  hoja.classList.remove("volteada");
  actualizarLibro();
  marcarActiva(0);
}

// Activa los efectos de texto de la página visible
function marcarActiva(retraso) {
  clearTimeout(tActiva);
  hojas.forEach((h) => h.classList.remove("activa"));
  const hoja = hojas[actual];
  tActiva = setTimeout(() => hoja.classList.add("activa"), retraso);
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
   6. CUENTA REGRESIVA
   ========================================================= */
function iniciarCuentaRegresiva() {
  const objetivo = new Date(CONFIG.fechaEvento).getTime();
  const dos = (n) => String(n).padStart(2, "0");
  let intervalo;

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
  intervalo = setInterval(tick, 1000);
  tick();
}

/* =========================================================
   7. BOTONES DE UBICACIÓN
   ========================================================= */
function prepararUbicacion() {
  const l = CONFIG.lugar;
  const q = encodeURIComponent([l.nombre, l.direccion, l.ciudad, "Colombia"].filter(Boolean).join(", "));
  $("#btnMaps").href = l.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${q}`;
  $("#btnWaze").href = l.wazeUrl || `https://waze.com/ul?q=${q}&navigate=yes`;
}

/* =========================================================
   8. VISOR DE FOTOS
   ========================================================= */
let fotoActual = 0;
function prepararVisor() {
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
  const quien = INVITADO ? `Soy ${INVITADO} y` : "Hola,";
  const msg = `${quien} confirmo mi asistencia a los XV años de ${CONFIG.nombre} ✨ (${PASES} ${PASES === 1 ? "pase" : "pases"})`;
  $("#btnWhatsapp").href = `https://wa.me/+573168041589${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}

/* =========================================================
   11. REPRODUCTOR DISCRETO
   ========================================================= */
let musicaPausadaPorUsuario = false;
function prepararMusica() {
  const audio = $("#audio");
  const player = $("#miniPlayer");
  const barra = $("#mpBarra");
  audio.src = CONFIG.musica;
  audio.volume = 0.6;

  audio.addEventListener("loadedmetadata", () => {
    if (CONFIG.inicioMusica) audio.currentTime = CONFIG.inicioMusica;
  }, { once: true });

  $("#btnMusica").addEventListener("click", () => {
    if (audio.paused) { musicaPausadaPorUsuario = false; reproducir(); }
    else { musicaPausadaPorUsuario = true; audio.pause(); }
  });
  audio.addEventListener("play", () => {
    player.classList.add("sonando");
    $("#btnMusica").setAttribute("aria-label", "Pausar música");
  });
  audio.addEventListener("pause", () => {
    player.classList.remove("sonando");
    $("#btnMusica").setAttribute("aria-label", "Reproducir música");
  });
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) $("#mpProgreso").style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  });

  // Tocar la barra para adelantar o regresar
  barra.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const r = barra.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });
  barra.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") audio.currentTime += 5;
    if (e.key === "ArrowLeft") audio.currentTime -= 5;
  });

  // En el celular se ilumina unos segundos al tocarlo
  let tPlayer;
  player.addEventListener("touchstart", () => {
    player.classList.add("visible");
    clearTimeout(tPlayer);
    tPlayer = setTimeout(() => player.classList.remove("visible"), 3000);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (!musicaPausadaPorUsuario && !player.classList.contains("oculto")) reproducir();
  });
}
function reproducir() {
  const p = $("#audio").play();
  if (p) p.catch((e) => console.warn("No se pudo reproducir el audio:", e.message));
}

/* =========================================================
   12. BIENVENIDA Y FAROLES
   ========================================================= */
function prepararBienvenida() {
  [...$(".sobre").children].forEach((el, k) => el.style.setProperty("--i", k));
  $("#btnAbrir").addEventListener("click", () => {
    $("#bienvenida").classList.add("salir");
    $("#escenario").classList.remove("oculto");
    $("#miniPlayer").classList.remove("oculto");
    reproducir(); // los navegadores solo permiten audio después de un toque
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
  // El sello y la música van primero: así siempre funcionan, aunque otra parte falle
  const pasos = [
    prepararBienvenida, prepararMusica, aplicarConfig, prepararLibro,
    prepararVisor, prepararUbicacion, prepararPase, prepararConfirmacion,
    iniciarCuentaRegresiva, crearFaroles
  ];
  pasos.forEach((paso) => {
    try { paso(); }
    catch (err) { console.error(`Error en ${paso.name}:`, err); }
  });
});