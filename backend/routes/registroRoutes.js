const express = require("express");
const router = express.Router();

const registroController = require("../controllers/registroController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.use(requireAuth);
router.post("/", requireRole("admin"), registroController.salvar);
router.get("/", registroController.listar);
router.get("/:id", registroController.buscar);

module.exports = router;
