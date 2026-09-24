import { Router } from 'express';

const router = Router();

// ==========================================
// 1. MIDDLEWARES
// ==========================================

// Middleware para verificar que el usuario esté logueado
export function estaAutenticado(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }

  // Detecta si la petición viene de un fetch() / AJAX
  const esFetch = req.headers['accept']?.includes('json') || 
                  req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                  req.headers['sec-fetch-dest'] === 'empty';

  if (esFetch) {
    // Truco con etiqueta img para ejecutar JS de inmediato mediante innerHTML
    return res.status(200).send('<img src="x" onerror="window.location.href=\'/login\';" style="display:none;">');
  }

  // Si entra directamente desde la barra de direcciones
  return res.redirect('/login');
}

// Middleware para verificar el Rol
export function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    const rolUsuario = req.session?.usuario?.rol; 

    if (rolUsuario && rolesPermitidos.includes(rolUsuario)) {
      return next();
    }

    const esFetch = req.headers['accept']?.includes('json') || 
                    req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                    req.headers['sec-fetch-dest'] === 'empty';

    if (esFetch) {
      return res.status(200).send('<img src="x" onerror="window.location.href=\'/login\';" style="display:none;">');
    }

    return res.redirect('/login');
  };
}

// ==========================================
// 2. RUTAS
// ==========================================

// Ruta para cerrar sesión
router.get('/cierre', (req, res) => {
  // Destruir la sesión en el servidor
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    
    // Limpiar la cookie de sesión en el navegador
    res.clearCookie('connect.sid'); // Ajusta el nombre si cambiaste el nombre de la cookie
    console.log('Se cerró la sesión');

    // Detecta si la petición viene de un fetch() / AJAX
    const esFetch = req.headers['accept']?.includes('json') || 
                    req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                    req.headers['sec-fetch-dest'] === 'empty';

    if (esFetch) {
      return res.status(200).send('<img src="x" onerror="window.location.href=\'/login\';" style="display:none;">');
    }

    // Si entra directamente desde la barra de direcciones
    return res.redirect('/login');
  });
});

export default router;