const express = require("express");
const router = express.Router();

const registroController = require("../controllers/registroController");

router.post("/", registroController.salvar);
router.get("/", registroController.listar);
router.get("/:id", registroController.buscar);

module.exports = router;