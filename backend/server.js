const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const registroRoutes = require("./routes/registroRoutes");
const { garantirAdminInicial } = require("./models/userModel");

const app = express();

const frontendDir = path.join(__dirname, "..", "frontend");
const loginDir = path.join(__dirname, "..", "tela.inicial");
const clientOrigin = process.env.CLIENT_ORIGIN;

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

app.use(cors(
  clientOrigin
    ? {
        origin: clientOrigin,
        credentials: false
      }
    : undefined
));
app.use(express.json({ limit: "300kb" }));

app.use("/login-assets", express.static(loginDir));
app.use("/app", express.static(frontendDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(loginDir, "tela_inicial_1.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(loginDir, "tela_inicial_1.html"));
});

app.get("/app", (req, res) => {
  res.redirect("/app/");
});

app.use("/api/auth", authRoutes);
app.use("/api/registros", registroRoutes);

const PORT = process.env.PORT || 3001;

garantirAdminInicial()
  .then((status) => {
    if (status.criado) {
      console.log(`Admin inicial criado: ${status.email}`);
    } else {
      console.log(`Admin inicial pronto: ${status.email}`);
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((erro) => {
    console.error("Falha ao inicializar seguranca da aplicacao:", erro);
    process.exit(1);
  });
