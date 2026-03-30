const crypto = require("crypto");

const KEY_LENGTH = 64;

function gerarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

function verificarSenha(senha, hashArmazenado) {
  if (!senha || !hashArmazenado || !hashArmazenado.includes(":")) {
    return false;
  }

  const [salt, hashOriginal] = hashArmazenado.split(":");
  const hashCalculado = crypto.scryptSync(senha, salt, KEY_LENGTH).toString("hex");

  const bufferOriginal = Buffer.from(hashOriginal, "hex");
  const bufferCalculado = Buffer.from(hashCalculado, "hex");

  if (bufferOriginal.length !== bufferCalculado.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferOriginal, bufferCalculado);
}

module.exports = {
  gerarHashSenha,
  verificarSenha
};
