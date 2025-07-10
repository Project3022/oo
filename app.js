import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG1wd2p4dnlmcHhybnpwZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxMDUsImV4cCI6MjA2NzY1NTEwNX0.rouJg4RHgNZwEIN01yV-JEJxHW7idmiFBd-oYgU8MUQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const container = document.querySelector('.container');
const selectEstado = document.getElementById('select-filtro-estado');
const inputBusqueda = document.getElementById('buscador');

const phoneNumber = "8292308873";

async function cargarProductos() {
  container.innerHTML = '<p>Cargando productos...</p>';

  const { data: productos, error } = await supabase
    .from('Productos')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    container.innerHTML = `<p>Error cargando productos: ${error.message}</p>`;
    return;
  }

  if (!productos || productos.length === 0) {
    container.innerHTML = '<p>No hay productos publicados.</p>';
    return;
  }

  container.innerHTML = '';

  productos.forEach(p => {
    const estadoLower = p.estado.toLowerCase();
    const estadoClass = estadoLower.includes('nuevo') ? 'nuevo' :
                        estadoLower.includes('usado') ? 'usado' : 'otro';

    const shortDesc = p.descripcion.length > 100 ? p.descripcion.slice(0, 100) + '...' : p.descripcion;

    const div = document.createElement('div');
    div.classList.add('product-card', estadoClass);
    div.dataset.estado = estadoClass;

    div.innerHTML = `
      <img src="${p.imagen_url || 'https://via.placeholder.com/300?text=Sin+imagen'}" alt="${p.titulo}" loading="lazy">
      <div class="product-info">
        <h3 class="titulo">${p.titulo}</h3>
        <p class="precio">$${p.precio}</p>
        <p class="estado">Estado: ${p.estado}</p>
        <p class="descripcion">
          <span class="short-desc">${shortDesc}</span>
          <span class="full-desc">${p.descripcion}</span>
          ${p.descripcion.length > 10 ? `<a href="#" class="toggle-desc">Ver más</a>` : ''}
        </p>
        <button class="buy-button">💵 Comprar</button>
      </div>
    `;

    container.appendChild(div);
  });

  activarToggleDescripcion();
  activarBotonesComprar();
  aplicarFiltros(); // Aplica filtro inicial (si ya hay selección/búsqueda)
}

function activarToggleDescripcion() {
  document.querySelectorAll('.toggle-desc').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const desc = link.closest('.descripcion');
      desc.classList.toggle('expandida');
      link.textContent = desc.classList.contains('expandida') ? 'Ver menos' : 'Ver más';
    });
  });
}

function activarBotonesComprar() {
  document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();

      const card = button.closest('.product-card');
      if (!card) return;

      const titulo = card.querySelector('.titulo').textContent.trim();
      const precio = card.querySelector('.precio').textContent.trim();
      const descripcion = card.querySelector('.full-desc').textContent.trim();

      const mensaje = `Hola, estoy interesado en comprar:\n- Producto: ${titulo}\n- Precio: ${precio}\n- Descripción: ${descripcion}`;
      const urlWhatsapp = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(mensaje)}`;

      window.open(urlWhatsapp, '_blank');
    });
  });
}

function aplicarFiltros() {
  const estadoSel = selectEstado.value.toLowerCase() || 'todos';
  const textoBusq = inputBusqueda.value.toLowerCase() || '';

  document.querySelectorAll('.product-card').forEach(card => {
    const estadoProd = card.dataset.estado || 'otro';
    const titulo = card.querySelector('.titulo').textContent.toLowerCase();
    const descripcion = card.querySelector('.descripcion').textContent.toLowerCase();

    const coincideEstado = estadoSel === 'todos' || estadoProd === estadoSel;
    const coincideTexto = titulo.includes(textoBusq) || descripcion.includes(textoBusq);

    card.style.display = (coincideEstado && coincideTexto) ? 'block' : 'none';
  });
}

selectEstado.addEventListener('change', aplicarFiltros);
inputBusqueda.addEventListener('input', aplicarFiltros);

window.addEventListener('DOMContentLoaded', cargarProductos);
