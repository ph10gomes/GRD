const db = require("../config/db");
const { gerarHashSenha } = require("../utils/password");

async function garantirTabelaUsuarios() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT NOT NULL AUTO_INCREMENT,
      nome VARCHAR(150) NOT NULL,
      email VARCHAR(180) NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'viewer') NOT NULL DEFAULT 'viewer',
      ativo TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_usuarios_email (email)
    )
  `);
}

async function buscarPorEmail(email) {
  await garantirTabelaUsuarios();
  const [rows] = await db.execute(
    "SELECT id, nome, email, senha_hash, role, ativo, created_at FROM usuarios WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] || null;
}

async function contarUsuarios() {
  await garantirTabelaUsuarios();
  const [rows] = await db.execute("SELECT COUNT(*) AS total FROM usuarios");
  return Number(rows[0]?.total || 0);
}

async function criarUsuario({ nome, email, senhaHash, role = "viewer", ativo = 1 }) {
  await garantirTabelaUsuarios();
  const [result] = await db.execute(
    `
      INSERT INTO usuarios (nome, email, senha_hash, role, ativo)
      VALUES (?, ?, ?, ?, ?)
    `,
    [nome, email, senhaHash, role, ativo]
  );

  return result;
}

async function garantirAdminInicial() {
  await garantirTabelaUsuarios();
  const email = (process.env.ADMIN_EMAIL || "admin@grd.local").trim().toLowerCase();
  const senha = (process.env.ADMIN_PASSWORD || "Admin@123456").trim();
  const nome = (process.env.ADMIN_NAME || "Administrador GRD").trim();

  const existente = await buscarPorEmail(email);

  if (existente) {
    return { criado: false, email };
  }

  const totalUsuarios = await contarUsuarios();
  const senhaHash = gerarHashSenha(senha);

  await criarUsuario({
    nome,
    email,
    senhaHash,
    role: "admin",
    ativo: 1
  });

  if (!process.env.ADMIN_PASSWORD || !process.env.AUTH_TOKEN_SECRET) {
    console.warn(
      "Seguranca: configure ADMIN_PASSWORD e AUTH_TOKEN_SECRET no arquivo .env antes de publicar o sistema."
    );
  }

  return { criado: totalUsuarios === 0, email };
}

module.exports = {
  buscarPorEmail,
  criarUsuario,
  garantirAdminInicial
};
