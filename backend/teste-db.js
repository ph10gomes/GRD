const db = require("./config/db");

async function testar() {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    console.log("Conexão OK:", rows);
    process.exit();
  } catch (erro) {
    console.error("Erro na conexão:", erro.message);
    process.exit(1);
  }
}

testar();