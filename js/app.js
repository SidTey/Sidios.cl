// Datos demo
const PRODUCTS = [
  {id:"p1", name:"Asesoria Online Smartphone", category:"Smartphones", price:2000, img:"imagenes/vectores/3.png", desc:"Asesoría remota para Android o Iphone, A través de Zoom, Meet o Team-Viewer."},
  {id:"p2", name:"Asesoria Presencial Smartphone", category:"Smartphones", price:5000, img:"imagenes/vectores/3.png", desc:"Asesoría Precencial para Android o Iphone, en las cercanias de Concepcion, Chile."},
  {id:"p3", name:"Asesoria Online Notebook", category:"Notebooks", price:5000, img:"imagenes/vectores/2.png", desc:"Asesoría remota para Notebooks o Macbook, A través de Zoom, Meet o Team-Viewer."},
  {id:"p4", name:"Asesoria Precencial Notebook", category:"Notebooks", price:10000, img:"imagenes/vectores/2.png", desc:"Asesoría Precencial para Notebooks o Macbook, en las cercanias de Concepcion, Chile."},
  {id:"p5", name:"Asesoria Online PC", category:"PC", price:5000, img:"imagenes/vectores/1.png", desc:"Asesoría remota para PC de escritorio, A través de Zoom, Meet o Team-Viewer."},
  {id:"p6", name:"Asesoria Precencial PC", category:"PC", price:12000, img:"imagenes/vectores/1.png", desc:"Asesoría Precencial para PC de escritorio, en las cercanias de Concepcion, Chile."},
];

// Utilidades
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const CLP = new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP"});

let state = {
  search:"", category:"", sort:"popular", max:1500000,
  cart: JSON.parse(localStorage.getItem("cart")||"{}")
};

function saveCart(){ localStorage.setItem("cart", JSON.stringify(state.cart)); }

// Render productos
function renderProducts(){
  const grid = $("#grid");
  let items = PRODUCTS
    .filter(p => p.name.toLowerCase().includes(state.search.toLowerCase()))
    .filter(p => !state.category || p.category === state.category)
    .filter(p => p.price <= state.max);

  if(state.sort === "price-asc") items.sort((a,b)=>a.price-b.price);
  else if(state.sort === "price-desc") items.sort((a,b)=>b.price-a.price);

  // Si no hay resultados, muestra el mensaje
  if(items.length === 0) {
    grid.innerHTML = `<div class="no-results">No se encontraron coincidencias</div>`;
    return;
  }

  grid.innerHTML = items.map(p=>`
    <article class="card" data-id="${p.id}" style="cursor:pointer;">
      <img src="${p.img}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <div class="price">${CLP.format(p.price)}</div>
      <button class="btn" data-add="${p.id}">Agregar</button>
    </article>`).join("");

  // Botón agregar solo agrega, no abre modal
  $$("#grid [data-add]").forEach(b=>b.addEventListener("click",e=>{
    e.stopPropagation();
    addToCart(b.dataset.add);
  }));

  // Al hacer clic en la card, abre el modal
  $$("#grid .card").forEach(card =>
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      openProductModal(id);
    })
  );
}

// Función para abrir el modal de detalle
function openProductModal(id) {
  const producto = PRODUCTS.find(p => p.id === id);
  const modal = $("#modal-producto");
  const backdrop = $("#modal-backdrop");
  const content = $("#modal-content");
  if(producto){
    content.innerHTML = `
      <button class="close-modal" onclick="closeProductModal()">&times;</button>
      <img src="${producto.img}" alt="${producto.name}" />
      <h2>${producto.name}</h2>
      <div class="price">${CLP.format(producto.price)}</div>
      <p>${producto.desc || "Sin descripción disponible."}</p>
      <button class="btn" id="modal-add-btn">Agregar al carrito</button>
    `;
    modal.classList.add("open");
    backdrop.classList.add("open");
    // Asocia el evento al botón del modal
    $("#modal-add-btn").addEventListener("click", () => {
      addToCart(producto.id);
      closeProductModal();
    });
  }
}

// Cerrar modal
function closeProductModal() {
  $("#modal-producto").classList.remove("open");
  $("#modal-backdrop").classList.remove("open");
}

// Cerrar al hacer clic fuera
$("#modal-backdrop").addEventListener("click", closeProductModal);

// Eventos
if ($("#search")) {
  $("#search").addEventListener("input",e=>{
    state.search=e.target.value;
    renderProducts();
  });
}
if ($("#category")) {
  $("#category").addEventListener("change",e=>{
    state.category = e.target.value;
    renderProducts();
  });
}
if ($("#sort")) {
  $("#sort").addEventListener("change",e=>{
    state.sort = e.target.value;
    renderProducts();
  });
}

// Abrir carrito (asegura que cualquier parte del botón lo abre)
if ($("#inbox-btn")) {
  $("#inbox-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    $("#cart").classList.add("open");
    $("#cart-backdrop").style.display = "block";
  });
}

// Cerrar carrito con el botón
if ($("#close-cart")) {
  $("#close-cart").addEventListener("click", () => {
    $("#cart").classList.remove("open");
    $("#cart-backdrop").style.display = "none";
  });
}

// Cerrar carrito al hacer clic en el backdrop
if ($("#cart-backdrop")) {
  $("#cart-backdrop").addEventListener("click", () => {
    $("#cart").classList.remove("open");
    $("#cart-backdrop").style.display = "none";
  });
}

// Cierra el carrito al hacer clic fuera de él (opcional, si quieres mantenerlo)
document.addEventListener("click", function(e) {
  const cart = $("#cart");
  if (cart.classList.contains("open")) {
    if (!cart.contains(e.target) && e.target.id !== "inbox-btn" && !$("#inbox-btn").contains(e.target)) {
      cart.classList.remove("open");
      $("#cart-backdrop").style.display = "none";
    }
  }
});

function addToCart(id){
  state.cart[id]=(state.cart[id]||0)+1;
  saveCart(); 
  renderCart();

  // Animación visual en el botón "Agregar"
  // Busca el botón correspondiente en el grid
  const btn = document.querySelector(`#grid [data-add="${id}"]`);
  if(btn) {
    btn.classList.remove("added"); // Reinicia si ya tiene la clase
    // Forzar reflow para reiniciar animación si se hace rápido
    void btn.offsetWidth;
    btn.classList.add("added");
    setTimeout(()=>btn.classList.remove("added"), 400);
  }
}
window.addToCart = addToCart; // <-- Esto la hace accesible desde el HTML del modal

function renderCart() {
  const items = $("#cart-items");
  items.innerHTML = Object.entries(state.cart).map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return `
      <div>
        ${p.name} x${qty} - ${CLP.format(p.price * qty)}
        <button class="btn secondary btn-remove" data-remove="${id}" style="margin-left:8px;">Quitar</button>
      </div>
    `;
  }).join("");

  // Actualiza el contador del carrito
  const totalCount = Object.values(state.cart).reduce((a, b) => a + b, 0);
  // Cambia esto:
  // $("#cart-count").textContent = totalCount;
  // Por esto:
  const inboxCount = document.getElementById("inbox-count");
  if (inboxCount) inboxCount.textContent = totalCount;

  // Calcula y muestra el subtotal
  const subtotal = Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
  const cartTotal = $("#cart-total");
  if (cartTotal) cartTotal.textContent = CLP.format(subtotal);

  // Asocia el evento a los botones "Quitar"
  $$("#cart-items .btn-remove").forEach(b =>
    b.addEventListener("click", e => {
      e.stopPropagation();
      removeFromCart(b.dataset.remove);
    })
  );
}

// Quitar productos del carrito
function removeFromCart(id) {
  if (state.cart[id]) {
    state.cart[id]--;
    if (state.cart[id] <= 0) delete state.cart[id];
    saveCart();
    renderCart();
  }
}
window.removeFromCart = removeFromCart;
// Enviar pedido por WhatsApp
const checkoutWhatsapp = document.getElementById("checkout-whatsapp");
if (checkoutWhatsapp) {
  checkoutWhatsapp.addEventListener("click", () => {
    const pedido = Object.entries(state.cart).map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      return `${p.name} x${qty} - ${CLP.format(p.price * qty)}`;
    }).join("\n");

    const subtotal = $("#cart-total").textContent;
    const mensaje = `🛒 Nuevo Pedido:\n${pedido}\n\nTotal: ${subtotal}`;

    // Reemplaza con tu número de WhatsApp (sin +, ni 0 inicial)
    const telefono = "56947324223";  
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    // Abre WhatsApp con el mensaje
    window.open(url, "_blank");
  });
}


// Init
(function(){ renderProducts(); renderCart(); $("#year").textContent=new Date().getFullYear(); })();
