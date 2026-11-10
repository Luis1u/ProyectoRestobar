window.addEventListener('pageshow', (event) => {
    // event.persisted es true si la página fue cargada desde la memoria caché del navegador
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        console.log("Detectado regreso con el botón Atrás, recargando página...");
        window.location.reload(); // Forzamos una recarga limpia para traer los datos nuevos
    }
});