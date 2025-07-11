document.addEventListener("DOMContentLoaded", () => {
  const productosContainer = document.getElementById("productos-container");
  const listaCarrito = document.getElementById("lista-carrito");
  const total = document.getElementById("total");
  const contadorCarrito = document.getElementById("contador-carrito");
  const reseñasContainer = document.getElementById("grid-reseñas");

  // Carrito con persistencia
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  actualizarCarrito();

  // Array de reseñas
  const reseñas = [
    "Excelente sabor y variedad",
    "Entrega rápida y segura",
    "Muy recomendable",
    "Atención al cliente excepcional",
    "Precios competitivos",
  ];

  // Calificaciones guardadas (key: índice de reseña, value: estrellas)
  let calificaciones = JSON.parse(localStorage.getItem("calificaciones")) || {};

  // Mostrar reseñas con estrellas
  function mostrarReseñas() {
    reseñasContainer.innerHTML = "";

    reseñas.forEach((texto, index) => {
      const div = document.createElement("div");
      div.className = "reseña";

      div.innerHTML = `
        <p>${texto}</p>
        <div class="stars" data-index="${index}">
          ${[1,2,3,4,5].map(i => `<span class="star" data-star="${i}">&#9733;</span>`).join('')}
        </div>
      `;

      reseñasContainer.appendChild(div);

      const starsContainer = div.querySelector(".stars");
      const rating = calificaciones[index] || 0;
      marcarEstrellas(starsContainer, rating);

      starsContainer.querySelectorAll(".star").forEach(star => {
        star.addEventListener("click", () => {
          const selectedStar = parseInt(star.dataset.star);
          calificaciones[index] = selectedStar;
          localStorage.setItem("calificaciones", JSON.stringify(calificaciones));
          marcarEstrellas(starsContainer, selectedStar);
        });
      });
    });
  }

  function marcarEstrellas(container, rating) {
    container.querySelectorAll(".star").forEach(star => {
      const starValue = parseInt(star.dataset.star);
      if (starValue <= rating) {
        star.classList.add("filled");
      } else {
        star.classList.remove("filled");
      }
    });
  }

  mostrarReseñas();

  // Cargar productos desde Fake Store API
  fetch("https://fakestoreapi.com/products")
    .then(res => res.json())
    .then(data => mostrarProductos(data))
    .catch(err => console.error("Error al cargar productos:", err));

  function mostrarProductos(productos) {
    productosContainer.innerHTML = "";
    productos.forEach(producto => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${producto.image}" alt="${producto.title}" width="100" height="100"/>
        <h3>${producto.title}</h3>
        <p>$${producto.price}</p>
        <button data-id="${producto.id}">Agregar al carrito</button>
      `;
      productosContainer.appendChild(card);

      card.querySelector("button").addEventListener("click", () => agregarAlCarrito({
        id: producto.id,
        title: producto.title,
        price: producto.price,
        image: producto.image,
        cantidad: 1
      }));
    });
  }

  function agregarAlCarrito(producto) {
    const existente = carrito.find(p => p.id === producto.id);
    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({ ...producto });
    }
    guardarCarrito();
    actualizarCarrito();
  }

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let totalPrecio = 0;
  let cantidadTotal = 0;

  carrito.forEach(prod => {
    const subtotal = prod.price * prod.cantidad;
    totalPrecio += subtotal;
    cantidadTotal += prod.cantidad;

    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${prod.image}" alt="${prod.title}" width="50" height="50" style="vertical-align: middle; border-radius: 6px; margin-right: 0.5em;" />
      ${prod.title} x ${prod.cantidad} = $${subtotal.toFixed(2)}
      <button data-id="${prod.id}" class="menos">-</button>
      <button data-id="${prod.id}" class="mas">+</button>
      <button data-id="${prod.id}" class="eliminar">Eliminar</button>
    `;
    listaCarrito.appendChild(li);
  });

  total.textContent = totalPrecio.toFixed(2);
  contadorCarrito.textContent = cantidadTotal;
  document.getElementById("contador-carrito-flotante").textContent = cantidadTotal;
  activarBotonesCarrito();
}

  function activarBotonesCarrito() {
    listaCarrito.querySelectorAll(".menos").forEach(btn => {
      btn.addEventListener("click", () => modificarCantidad(btn.dataset.id, -1));
    });
    listaCarrito.querySelectorAll(".mas").forEach(btn => {
      btn.addEventListener("click", () => modificarCantidad(btn.dataset.id, 1));
    });
    listaCarrito.querySelectorAll(".eliminar").forEach(btn => {
      btn.addEventListener("click", () => eliminarProducto(btn.dataset.id));
    });
  }

  function modificarCantidad(id, cambio) {
    const prod = carrito.find(p => p.id == id);
    if (prod) {
      prod.cantidad += cambio;
      if (prod.cantidad <= 0) eliminarProducto(id);
      guardarCarrito();
      actualizarCarrito();
    }
  }

  function eliminarProducto(id) {
    carrito = carrito.filter(p => p.id != id);
    guardarCarrito();
    actualizarCarrito();
  }

  function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  // Scroll suave para menú
  document.querySelectorAll('nav ul li a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetID = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetID);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  activarBotonesCarrito();
});
