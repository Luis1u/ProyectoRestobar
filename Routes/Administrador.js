import { Router } from "express";


const router = Router();

router.get("/principal", async (req, res) => {
  res.render("Principal_Administracion", { usuario: req.session.usuario });
});
export default router;
