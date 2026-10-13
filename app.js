// ===== DATOS =====
const productos = [
  { id: 1, nombre: "Guitarra Acústica Folk", categoria: "Cuerdas", precio: 189.9, icono: "🎸", specs: "Tapa de abeto, 6 cuerdas de acero, incluye funda." },
  { id: 2, nombre: "Guitarra Eléctrica Strat", categoria: "Cuerdas", precio: 349.0, icono: "🎸", specs: "3 pastillas single coil, mástil de arce." },
  { id: 3, nombre: "Ukelele Soprano", categoria: "Cuerdas", precio: 79.5, icono: "🪕", specs: "Caoba, 4 cuerdas de nylon, ideal para iniciar." },
  { id: 4, nombre: "Teclado Digital 61 teclas", categoria: "Teclados", precio: 159.0, icono: "🎹", specs: "100 timbres, USB-MIDI, teclas sensibles." },
  { id: 5, nombre: "Piano Digital 88 teclas", categoria: "Teclados", precio: 599.0, icono: "🎹", specs: "Teclado contrapesado, pedal incluido." },
  { id: 6, nombre: "Batería Acústica 5 piezas", categoria: "Percusión", precio: 720.0, icono: "🥁", specs: "Bombo 22\", toms, redoblante y herrajes." },
  { id: 7, nombre: "Cajón Peruano", categoria: "Percusión", precio: 95.0, icono: "🪘", specs: "Madera de haya, snares internos ajustables." },
  { id: 8, nombre: "Saxofón Alto", categoria: "Viento", precio: 540.0, icono: "🎷", specs: "Acabado dorado, boquilla y estuche incluidos." }
];

const talleres = [
  { nombre: "Guitarra", icono: "🎸", niveles: [["Principiante", 45], ["Intermedio", 55], ["Avanzado", 65]], horario: "Lun y Mié 18:00" },
  { nombre: "Piano", icono: "🎹", niveles: [["Principiante", 50], ["Intermedio", 60], ["Avanzado", 70]], horario: "Mar y Jue 17:00" },
  { nombre: "Canto", icono: "🎤", niveles: [["Principiante", 40], ["Intermedio", 50], ["Avanzado", 60]], horario: "Vie 18:30" },
  { nombre: "Batería", icono: "🥁", niveles: [["Principiante", 55], ["Intermedio", 65], ["Avanzado", 75]], horario: "Sáb 10:00" }
];

let carrito = []; // [{ id, cantidad }]
const DESCUENTO_EFECTIVO = 0.10;

// ===== UTILIDADES =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const dinero = (n) => "$" + n.toFixed(2);

// ===== CATÁLOGO + FILTROS =====
function renderProductos(categoria = "todos") {
  const lista = categoria === "todos" ? productos : productos.filter((p) => p.categoria === categoria);
  $("#productGrid").innerHTML = lista.map((p) => `
    <article class="card">
      <div class="photo" role="img" aria-label="${p.nombre}">${p.icono}</div>
      <div class="body">
        <span class="cat">${p.categoria}</span>
        <h3>${p.nombre}</h3>
        <p class="specs">${p.specs}</p>
        <span class="price">${dinero(p.precio)}</span>
        <button class="btn small" data-add="${p.id}">Agregar al Carrito</button>
      </div>
    </article>`).join("");
}

$("#filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  $$(".chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  renderProductos(chip.dataset.cat);
});

$("#productGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (btn) agregarAlCarrito(Number(btn.dataset.add));
});

// ===== TALLERES =====
function renderTalleres() {
  $("#workshopGrid").innerHTML = talleres.map((t) => `
    <article class="card">
      <div class="photo">${t.icono}</div>
      <div class="body">
        <h3>${t.nombre}</h3>
        <p class="specs">Horario: ${t.horario}</p>
        <ul class="levels">
          ${t.niveles.map(([nivel, costo]) => `<li><span>${nivel}</span><strong>${dinero(costo)}/mes</strong></li>`).join("")}
        </ul>
        <a class="btn small" href="#contacto">Inscribirme</a>
      </div>
    </article>`).join("");
}

// ===== TABS TIENDA / ESCUELA =====
$$(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    $$(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    $("#" + tab.dataset.tab).classList.add("active");
  });
});

// ===== CARRITO =====
function agregarAlCarrito(id) {
  const item = carrito.find((i) => i.id === id);
  if (item) item.cantidad++;
  else carrito.push({ id, cantidad: 1 });
  actualizarCarrito();
  abrirCarrito();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find((i) => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter((i) => i.id !== id);
  actualizarCarrito();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter((i) => i.id !== id);
  actualizarCarrito();
}

function calcularSubtotal() {
  return carrito.reduce((suma, item) => {
    const prod = productos.find((p) => p.id === item.id);
    return suma + prod.precio * item.cantidad;
  }, 0);
}

function calcularTotales() {
  const subtotal = calcularSubtotal();
  const descuento = $("#pago").value === "efectivo" ? subtotal * DESCUENTO_EFECTIVO : 0;
  return { subtotal, descuento, total: subtotal - descuento };
}

function actualizarCarrito() {
  const lista = $("#cartItems");
  if (carrito.length === 0) {
    lista.innerHTML = `<li class="empty">Tu carrito está vacío. Agrega un instrumento desde la tienda.</li>`;
  } else {
    lista.innerHTML = carrito.map((item) => {
      const p = productos.find((x) => x.id === item.id);
      return `
        <li>
          <div><strong>${p.nombre}</strong><br>${dinero(p.precio)} c/u</div>
          <strong>${dinero(p.precio * item.cantidad)}</strong>
          <div class="qty">
            <button data-minus="${p.id}" aria-label="Quitar uno">−</button>
            <span>${item.cantidad}</span>
            <button data-plus="${p.id}" aria-label="Agregar uno">+</button>
          </div>
          <button class="remove" data-remove="${p.id}">Eliminar</button>
        </li>`;
    }).join("");
  }
  $("#cartCount").textContent = carrito.reduce((n, i) => n + i.cantidad, 0);
  $("#cartTotal").textContent = dinero(calcularSubtotal());
  actualizarResumen();
}

$("#cartItems").addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.plus) cambiarCantidad(Number(t.dataset.plus), 1);
  if (t.dataset.minus) cambiarCantidad(Number(t.dataset.minus), -1);
  if (t.dataset.remove) quitarDelCarrito(Number(t.dataset.remove));
});

$("#clearCart").addEventListener("click", () => { carrito = []; actualizarCarrito(); });

function abrirCarrito() { $("#cart").classList.add("open"); $("#overlay").classList.add("open"); }
function cerrarCarrito() { $("#cart").classList.remove("open"); $("#overlay").classList.remove("open"); }
$("#cartToggle").addEventListener("click", abrirCarrito);
$("#cartClose").addEventListener("click", cerrarCarrito);
$("#overlay").addEventListener("click", cerrarCarrito);
$("#goCheckout").addEventListener("click", cerrarCarrito);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarCarrito(); });

// ===== RESUMEN DEL PEDIDO (con descuento) =====
function actualizarResumen() {
  const { subtotal, descuento, total } = calcularTotales();
  $("#summaryList").innerHTML = carrito.length
    ? carrito.map((i) => {
        const p = productos.find((x) => x.id === i.id);
        return `<li><span>${i.cantidad} × ${p.nombre}</span><span>${dinero(p.precio * i.cantidad)}</span></li>`;
      }).join("")
    : `<li>Sin productos. Puedes enviar el formulario para pedir una cotización.</li>`;
  $("#sumSubtotal").textContent = dinero(subtotal);
  $("#sumDiscount").textContent = "-" + dinero(descuento);
  $("#sumTotal").textContent = dinero(total);
}
$("#pago").addEventListener("change", actualizarResumen);

// ===== VALIDACIÓN DEL FORMULARIO =====
function validar(campo, errorId, regla, mensaje) {
  const valor = campo.value.trim();
  const ok = regla(valor);
  campo.classList.toggle("invalid", !ok);
  $(errorId).textContent = ok ? "" : mensaje;
  return ok;
}

$("#orderForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const v1 = validar($("#nombre"), "#errNombre", (v) => v.length >= 3, "Escribe tu nombre completo (mínimo 3 letras).");
  const v2 = validar($("#email"), "#errEmail", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Ingresa un correo válido, por ejemplo nombre@correo.com.");
  const v3 = validar($("#telefono"), "#errTelefono", (v) => /^[0-9+\s-]{7,15}$/.test(v), "Ingresa un teléfono de 7 a 15 dígitos.");
  const v4 = validar($("#pago"), "#errPago", (v) => v !== "", "Selecciona un método de pago.");

  const msg = $("#formMsg");
  if (!(v1 && v2 && v3 && v4)) {
    msg.textContent = "";
    return;
  }
  const { total } = calcularTotales();
  const detalle = carrito.length ? `Total a pagar: ${dinero(total)}.` : "Recibimos tu solicitud de cotización.";
  msg.textContent = `¡Gracias, ${$("#nombre").value.trim()}! ${detalle} Te contactaremos pronto.`;
  e.target.reset();
  carrito = [];
  actualizarCarrito();
});

// ===== INICIO =====
renderProductos();
renderTalleres();
actualizarCarrito();