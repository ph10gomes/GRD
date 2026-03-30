const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const tentativas = new Map();

function limparExpirados(agora) {
  for (const [chave, registro] of tentativas.entries()) {
    if (registro.expiresAt <= agora) {
      tentativas.delete(chave);
    }
  }
}

function loginRateLimit(req, res, next) {
  const agora = Date.now();
  limparExpirados(agora);

  const chave = req.ip || req.headers["x-forwarded-for"] || "desconhecido";
  const registro = tentativas.get(chave);

  if (registro && registro.count >= MAX_ATTEMPTS && registro.expiresAt > agora) {
    return res.status(429).json({
      sucesso: false,
      mensagem: "Muitas tentativas de login. Tente novamente em alguns minutos."
    });
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const statusCode = res.statusCode;

    if (statusCode >= 400) {
      const atual = tentativas.get(chave);

      if (!atual || atual.expiresAt <= agora) {
        tentativas.set(chave, {
          count: 1,
          expiresAt: agora + WINDOW_MS
        });
      } else {
        atual.count += 1;
        tentativas.set(chave, atual);
      }
    } else {
      tentativas.delete(chave);
    }

    return originalJson(body);
  };

  next();
}

module.exports = loginRateLimit;
