const crypto = require('crypto');

function setCorsHeaders(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', `${methods.join(', ')}, OPTIONS`);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
}

function safeEquals(a, b) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  if (first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(first, second);
}

function requireAuth(req, res) {
  const expectedToken = process.env.API_SECRET_TOKEN;

  if (!expectedToken) {
    console.error('API_SECRET_TOKEN is not configured');
    res.status(500).json({ error: 'Autenticacion no configurada' });
    return false;
  }

  const token = extractBearerToken(req);

  if (!token || !safeEquals(token, expectedToken)) {
    res.status(401).json({ error: 'No autorizado' });
    return false;
  }

  return true;
}

module.exports = {
  requireAuth,
  setCorsHeaders,
};
