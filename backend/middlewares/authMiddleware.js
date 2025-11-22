const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.get('Authorization')

  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing bearer token' })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: empty token' })
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    if (!payload.userId) {
      return res.status(401).json({ error: 'Unauthorized: invalid token payload' })
    }

    req.user = {
      id: payload.userId,
      role: payload.role || null
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token' })
  }
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles]
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' })
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' })
    }
    next()
  }
}

module.exports = { authMiddleware, requireRole }
