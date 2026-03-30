const { buscarPorEmail } = require("../models/userModel");
const { verificarSenha } = require("../utils/password");
const { assinar } = require("../utils/token");

function montarUsuarioPublico(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role
  };
}

async function login(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const senha = String(req.body?.password || "");

    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe email e senha."
      });
    }

    const usuario = await buscarPorEmail(email);

    if (!usuario || !usuario.ativo || !verificarSenha(senha, usuario.senha_hash)) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Credenciais invalidas."
      });
    }

    const token = assinar({
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      nome: usuario.nome
    });

    res.json({
      sucesso: true,
      token,
      usuario: montarUsuarioPublico(usuario)
    });
  } catch (erro) {
    console.error("Erro ao realizar login:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao realizar login."
    });
  }
}

function me(req, res) {
  res.json({
    sucesso: true,
    usuario: req.user
  });
}

module.exports = {
  login,
  me
};
