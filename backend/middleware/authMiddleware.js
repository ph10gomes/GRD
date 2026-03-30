const { verificar } = require("../utils/token");

function extrairToken(req) {
  const authorization = req.headers.authorization || "";
  const [tipo, token] = authorization.split(" ");

  if (tipo !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function requireAuth(req, res, next) {
  try {
    const token = extrairToken(req);

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Acesso nao autorizado."
      });
    }

    req.user = verificar(token);
    next();
  } catch (erro) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Sessao invalida ou expirada."
    });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Acesso nao autorizado."
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Permissao insuficiente para esta operacao."
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
