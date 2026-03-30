const crypto = require("crypto");

const DEFAULT_EXPIRATION_SECONDS = 60 * 60 * 8;

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  return Buffer.from(normalized, "base64").toString("utf8");
}

function obterSegredo() {
  return process.env.AUTH_TOKEN_SECRET || "troque-este-segredo-em-producao";
}

function assinar(payload, expiresInSeconds = DEFAULT_EXPIRATION_SECONDS) {
  const agora = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: agora,
    exp: agora + expiresInSeconds
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const bodyEncoded = base64UrlEncode(JSON.stringify(body));
  const content = `${headerEncoded}.${bodyEncoded}`;
  const signature = crypto
    .createHmac("sha256", obterSegredo())
    .update(content)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${content}.${signature}`;
}

function verificar(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Token ausente");
  }

  const partes = token.split(".");
  if (partes.length !== 3) {
    throw new Error("Token invalido");
  }

  const [headerEncoded, bodyEncoded, signature] = partes;
  const content = `${headerEncoded}.${bodyEncoded}`;
  const expectedSignature = crypto
    .createHmac("sha256", obterSegredo())
    .update(content)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error("Assinatura invalida");
  }

  const payload = JSON.parse(base64UrlDecode(bodyEncoded));

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expirado");
  }

  return payload;
}

module.exports = {
  assinar,
  verificar
};
