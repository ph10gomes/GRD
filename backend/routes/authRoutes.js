const express = require("express");

const authController = require("../controllers/authController");
const loginRateLimit = require("../middleware/loginRateLimit");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginRateLimit, authController.login);
router.get("/me", requireAuth, authController.me);

module.exports = router;
