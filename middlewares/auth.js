import { Router } from 'express';

const router = Router();

export function estaAutenticado(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }


  const esFetch = req.headers['accept']?.includes('json') || 
                  req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                  req.headers['sec-fetch-dest'] === 'empty';

  if (esFetch) {

    return res.status(200).send('<img src="x" onerror="window.location.href=\'/login\';" style="display:none;">');
  }


  return res.redirect('/login');
}


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


router.get('/cierre', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    

    res.clearCookie('connect.sid'); 
    console.log('Se cerró la sesión');

    
    const esFetch = req.headers['accept']?.includes('json') || 
                    req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                    req.headers['sec-fetch-dest'] === 'empty';

    if (esFetch) {
      return res.status(200).send('<img src="x" onerror="window.location.href=\'/login\';" style="display:none;">');
    }

    
    return res.redirect('/login');
  });
});

export default router;