const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  // #TODO: Get Authorization header from req.headers
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }
  // #TODO: Extract token from "Bearer <token>"
  const token = authHeader.split(' ')[1]
  // #TODO: If no token, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ error: 'Missing token' })
  }
  // #TODO: Verify token using jwt.verify with process.env.JWT_SECRET
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server configuration error: missing JWT secret' })
  }
  // #TODO: Decode token to get userId and role
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // #TODO: Set req.user = { id: userId, role: role }
    req.user = {
      id: payload.id,
      role: payload.role
    }
    // #TODO: Call next() to proceed to route handler
    return next()
    // #TODO: If invalid, return 401
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function requireRole(role) {
  return (req, res, next) => {
    // #TODO: Check if req.user.role === role
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // #TODO: If not, return 403 Forbidden
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    // #TODO: Otherwise call next()
    return next()
  }
}

module.exports = { authMiddleware, requireRole }