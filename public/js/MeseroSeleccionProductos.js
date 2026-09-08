
    // =========================================================================
    // 1. ESTADO GLOBAL Y SELECCIÓN DE ELEMENTOS DEL DOM
    // =========================================================================

    // Mapa en memoria para almacenar los productos de la categoría actualmente visible (búsqueda rápida O(1))
    const mapaProductos = new Map();

    // Caché en memoria para guardar productos por categoría y evitar peticiones innecesarias al backend
    const cacheCategorias = new Map();

    // Array que mantendrá el estado actual de la comanda/pedido en el cliente
    let pedido = [];

    // Referencias fijas a los elementos del HTML mediante sus IDs
    const $contenedorProductos = document.getElementById('contenedor-productos'); // Div del menú de productos
    const $contenedorPedido = document.getElementById('contenedor-pedido');       // Div de la lista del pedido
    const $txtTotal = document.getElementById('txt-total');                       // Span del monto total
    const $btnEnviar = document.getElementById('btn-enviar-pedido');              // Botón para procesar pedido

    // Evento que se dispara automáticamente cuando la estructura HTML de la página termina de cargar
    document.addEventListener('DOMContentLoaded', () => {
        // Mensaje inicial en la lista de productos antes de elegir una categoría
        $contenedorProductos.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:20px; font-size:0.85rem;">Selecciona una categoría arriba</p>';
        
        // Dibuja el estado inicial (vacío) del panel del pedido
        renderizarPedidoCompleto();
    });


    // =========================================================================
    // 2. CARGA Y RENDERIZADO DE MENÚ Y CATEGORÍAS
    // =========================================================================

    /**
     * Carga y gestiona la visualización de los productos según la categoría seleccionada.
     * @param {string} idCat - ID único de la categoría.
     * @param {HTMLElement} btn - Botón HTML de la categoría que recibió el clic.
     */
    async function cargarProductosPorCategoria(idCat, btn) {
        // Quita la clase visual 'activa' del botón que estaba marcado previamente
        const btnActivo = document.querySelector('.btn-categoria.activa');
        if (btnActivo) btnActivo.classList.remove('activa');
        
        // Marca visualmente el nuevo botón seleccionado
        if (btn) btn.classList.add('activa');

        // VERIFICACIÓN EN CACHÉ: Si la categoría ya se descargó previamente, no consulta al servidor
        if (cacheCategorias.has(idCat)) {
            actualizarMapaYRenderizar(cacheCategorias.get(idCat));
            return; // Corta la ejecución aquí
        }

        // Muestra indicador visual de carga mientras se realiza la petición HTTP
        $contenedorProductos.innerHTML = '<p style="text-align:center; padding:10px; color:#64748b; font-size:0.85rem;">Cargando...</p>';

        try {
            // Control de tiempo de espera (Timeout de 6 segundos)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000); // Cancela la petición si tarda demasiado

            // Petición HTTP GET al servidor Express/Node.js pasándole el ID de categoría
            const response = await fetch(`/producto/mostrarProductos/${idCat}`, { signal: controller.signal });
            clearTimeout(timeoutId); // Limpia el temporizador si la respuesta llegó a tiempo

            // Valida si la respuesta del servidor es correcta (Status HTTP 200-299)
            if (!response.ok) throw new Error('Error en respuesta');
            
            // Parsea los datos recibidos en formato JSON
            const productos = await response.json();
            
            // Guarda el resultado en el caché local para futuras lecturas
            cacheCategorias.set(idCat, productos);
            
            // Dibuja los productos obtenidos en la pantalla
            actualizarMapaYRenderizar(productos);
        } catch (error) {
            // Manejo de errores de red o timeout
            console.error("Error al cargar productos:", error);
            $contenedorProductos.innerHTML = '<p style="text-align:center; color:#ef4444; padding:10px; font-size:0.85rem;">Error al obtener productos</p>';
        }
    }

    /**
     * Actualiza el Mapa en memoria y construye el HTML de las tarjetas de productos.
     * @param {Array} productos - Lista de objetos de productos devueltos por el backend.
     */
    function actualizarMapaYRenderizar(productos) {
        mapaProductos.clear(); // Limpia la estructura previa de búsqueda
        const fragment = document.createDocumentFragment(); // Contenedor virtual para optimizar la inserción en el DOM

        // Si la lista de productos viene vacía desde la base de datos
        if (!productos || productos.length === 0) {
            $contenedorProductos.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:10px; font-size:0.85rem;">No hay productos en esta categoría</p>';
            return;
        }

        // Recorre cada producto devuelto por el backend
        productos.forEach(p => {
            const idClean = String(p.papdcodpro).trim(); // Sanitiza/limpia espacios en blanco del código de producto
            mapaProductos.set(idClean, p); // Asocia el ID limpio con todos los datos del producto en el Mapa

            // Crea el elemento contenedor de la tarjeta visual
            const card = document.createElement('div');
            card.className = 'tarjeta-producto';
            
            // Inyecta el contenido HTML con las propiedades del producto
            card.innerHTML = `
                <div class="info-producto">
                    <div class="nombre-prod">${p.capdnompro}</div>
                    <div class="ingredientes-prod">${p.capdingpro || ''}</div>
                    <div class="precio-prod">Bs. ${Number(p.capdpreven).toFixed(2)}</div>
                </div>
                <button class="btn-agregar" onclick="agregarAlPedido('${idClean}')">+</button>
            `;
            
            // Agrega la tarjeta al fragmento virtual en memoria
            fragment.appendChild(card);
        });

        // Reemplaza todo el contenido del contenedor en el DOM de una sola vez
        $contenedorProductos.replaceChildren(fragment);
    }


    // =========================================================================
    // 3. LÓGICA DE CONTROL DEL CARRITO Y COMANDA
    // =========================================================================

    /**
     * Añade un producto al array `pedido` o incrementa su cantidad si ya existe.
     * @param {string} idPro - Código identificador del producto.
     */
    function agregarAlPedido(idPro) {
        // Obtiene la información técnica del producto desde el Mapa en memoria
        const prod = mapaProductos.get(idPro);
        if (!prod) return; // Si no existe el producto, interrumpe

        // Busca si el producto ya fue agregado previamente al carrito
        const existe = pedido.find(item => item.id === idPro);

        if (existe) {
            // CASO A: Ya existe -> Incrementa su contador y refresca solo su fila
            existe.cantidad++;
            actualizarFilaExistente(existe);
        } else {
            // CASO B: No existe -> Crea un nuevo objeto de ítem y lo agrega al array
            pedido.push({
                id: idPro,
                nombre: prod.capdnompro,
                precioUnitario: Number(prod.capdpreven),
                cantidad: 1,
                nota: ''
            });
            // Vuelve a construir la lista visual del pedido y hace scroll hacia el nuevo ítem
            renderizarPedidoCompleto(true);
        }
        
        // Recalcula y actualiza el valor monetario total en pantalla
        actualizarTotalUI();
    }

    /**
     * Altera la cantidad de un producto (+1 o -1).
     * @param {string} idPro - ID del producto.
     * @param {number} cambio - Valor incremental o decremental (1 o -1).
     */
    function cambiarCantidad(idPro, cambio) {
        const item = pedido.find(i => i.id === idPro);
        if (!item) return;

        item.cantidad += cambio; // Suma o resta según el parámetro

        // Si la cantidad resulta menor o igual a cero, se remueve el elemento del pedido
        if (item.cantidad <= 0) {
            eliminarItem(idPro);
            return;
        }

        // Si la cantidad es válida, actualiza los datos visuales de la fila
        actualizarFilaExistente(item);
        actualizarTotalUI();
    }

    /**
     * Optimización visual: Actualiza únicamente los valores de texto de una fila del pedido.
     * @param {Object} item - Objeto del producto dentro del pedido.
     */
    function actualizarFilaExistente(item) {
        const row = document.getElementById(`item-pedido-${item.id}`);
        if (!row) {
            // Si la fila HTML no existe por algún motivo, redibuja todo el panel
            renderizarPedidoCompleto();
            return;
        }
        
        const subtotal = item.precioUnitario * item.cantidad; // Cálculo de subtotal por ítem
        
        // Inyecta directamente en el DOM la nueva cantidad y subtotal sin recargar otros elementos
        row.querySelector('.num-cantidad').innerText = item.cantidad;
        row.querySelector('.precio-item-subtotal').innerText = `Bs. ${subtotal.toFixed(2)}`;
    }

    /**
     * Guarda el texto introducido en el input de observaciones (ej. "Sin picante").
     * @param {string} idPro - ID del producto.
     * @param {string} texto - Contenido escrito por el usuario.
     */
    function actualizarNota(idPro, texto) {
        const item = pedido.find(i => i.id === idPro);
        if (item) item.nota = texto; // Guarda en memoria dentro del objeto del ítem
    }

    /**
     * Remueve completamente un ítem del pedido actual.
     * @param {string} idPro - ID del producto a eliminar.
     */
    function eliminarItem(idPro) {
        // Filtra el array conservando solo los ítems con un ID diferente al seleccionado
        pedido = pedido.filter(i => i.id !== idPro);
        
        // Remueve directamente el nodo HTML del DOM
        const row = document.getElementById(`item-pedido-${idPro}`);
        if (row) row.remove();
        
        // Si el pedido quedó completamente vacío, redibuja el mensaje inicial
        if (pedido.length === 0) {
            renderizarPedidoCompleto();
        } else {
            // Si aún quedan ítems, simplemente recalcula el importe total
            actualizarTotalUI();
        }
    }

    /**
     * Calcula la suma matemática global acumulada del pedido.
     * @returns {number} Monto total calculado.
     */
    function calcularTotal() {
        return pedido.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
    }

    /**
     * Actualiza la etiqueta del total acumulado en la barra inferior fija.
     */
    function actualizarTotalUI() {
        const total = calcularTotal();
        $txtTotal.innerText = `Bs. ${total.toFixed(2)}`;
    }

    /**
     * Construye o reconstruye la lista HTML completa de ítems dentro de la comanda.
     * @param {boolean} hacerScroll - Si es true, desplaza el contenedor hacia el último elemento inyectado.
     */
    function renderizarPedidoCompleto(hacerScroll = false) {
        // Manejo del estado cuando el pedido está vacío
        if (pedido.length === 0) {
            $contenedorPedido.innerHTML = `<p style="font-size:0.8rem; color:#94a3b8; text-align:center; padding:12px 0;">No hay productos seleccionados</p>`;
            actualizarTotalUI();
            return;
        }

        const fragment = document.createDocumentFragment(); // Fragmento virtual para optimizar el renderizado

        // Itera sobre el array global de pedido para generar cada elemento visual
        pedido.forEach(item => {
            const subtotal = item.precioUnitario * item.cantidad;
            const row = document.createElement('div');
            row.className = 'item-pedido';
            row.id = `item-pedido-${item.id}`; // Asigna ID único a la fila para modificaciones directas
            
            // Genera la interfaz del producto en el carrito (nombre, botón eliminar, nota, botones de cantidad y subtotal)
            row.innerHTML = `
                <div class="cabecera-item">
                    <span class="nombre-item-pedido">${item.nombre}</span>
                    <button class="btn-eliminar" onclick="eliminarItem('${item.id}')">✕</button>
                </div>
                <div class="controles-item">
                    <input 
                        type="text" 
                        class="input-nota" 
                        placeholder="Nota (ej. Sin cebolla)" 
                        value="${item.nota}"
                        oninput="actualizarNota('${item.id}', this.value)"
                    />
                    <div class="contador-cantidad">
                        <button class="btn-cantidad" onclick="cambiarCantidad('${item.id}', -1)">-</button>
                        <span class="num-cantidad">${item.cantidad}</span>
                        <button class="btn-cantidad" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                    </div>
                    <span class="precio-item-subtotal">Bs. ${subtotal.toFixed(2)}</span>
                </div>
            `;
            fragment.appendChild(row);
        });

        // Inyecta todas las filas al contenedor principal del pedido
        $contenedorPedido.replaceChildren(fragment);
        actualizarTotalUI();
        
        // Desplaza suavemente la barra de desplazamiento hacia el final del contenedor si se especifica
        if (hacerScroll) {
            $contenedorPedido.scrollTop = $contenedorPedido.scrollHeight;
        }
    }


    // =========================================================================
    // 4. ENVÍO DE DATOS AL SERVIDOR (BACKEND)
    // =========================================================================

    /**
     * Recopila la comanda actual y realiza la petición HTTP POST para registrarla en la base de datos.
     */
    async function enviarPedido() {
        // Validación previa: Previene envíos si no hay elementos seleccionados
        if (pedido.length === 0) {
            alert('Selecciona al menos un producto.');
            return;
        }

        // Bloquea el botón de envío para evitar clics duplicados durante la transacción
        $btnEnviar.disabled = true;
        $btnEnviar.innerText = 'Enviando...';

        // Estructura de datos (Data Transfer Object) enviada en el cuerpo del request
        const payload = {
            items: pedido.map(i => ({
                idProducto: i.id,
                cantidad: i.cantidad,
                precioUnitario: i.precioUnitario,
                nota: i.nota
            })),
            total: calcularTotal()
        };

        try {
            // Envío asíncrono vía POST mediante fetch en formato JSON
            const response = await fetch('/pedido/guardar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Parsea la respuesta devuelta por el controlador backend
            const data = await response.json();

            // Evalúa si la transacción fue exitosa en la lógica de negocio
            if (response.ok && data.exito) {
                // REDIRECCIÓN: Si se guardó correctamente, navega a la pantalla de confirmación
                window.location.href = '/pedido/confirmacion';
            } else {
                // Muestra el mensaje de error de negocio devuelto por el servidor
                alert(data.mensaje || 'Ocurrió un error al procesar el pedido.');
                
                // Habilita nuevamente el botón para permitir reintentos
                $btnEnviar.disabled = false;
                $btnEnviar.innerText = 'Enviar Pedido';
            }
        } catch (error) {
            // Manejo de fallas de red o caídas del servidor
            console.error("Error al enviar pedido:", error);
            alert('Error de conexión al enviar el pedido.');
            
            // Habilita nuevamente el botón para reintentar
            $btnEnviar.disabled = false;
            $btnEnviar.innerText = 'Enviar Pedido';
        }
    }
