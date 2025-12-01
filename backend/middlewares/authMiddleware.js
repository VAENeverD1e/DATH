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

    const userId = payload.userId || payload.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: invalid token payload' })
    }

    req.user = {
      id: userId,
      role: payload.role || null
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token' })
  }
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles]
  
  // Map common aliases (admin <-> administrator, doctor <-> physician)
  const expandedRoles = new Set()
  allowed.forEach(r => {
    expandedRoles.add(r)
    if (r === 'admin') expandedRoles.add('administrator')
    if (r === 'administrator') expandedRoles.add('admin')
    if (r === 'doctor') expandedRoles.add('physician')
    if (r === 'physician') expandedRoles.add('doctor')
  })
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' })
    }
    if (!expandedRoles.has(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' })
    }
    next()
  }
}

module.exports = { authMiddleware, requireRole }

// const jwt = require('jsonwebtoken')

// function authMiddleware(req, res, next) {
//   // #TODO: Get Authorization header from req.headers
//   const authHeader = req.headers.authorization || req.headers.Authorization
//   if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Missing or invalid authorization header' })
//   }
//   // #TODO: Extract token from "Bearer <token>"
//   const token = authHeader.split(' ')[1]
//   // #TODO: If no token, return 401 Unauthorized
//   if (!token) {
//     return res.status(401).json({ error: 'Missing token' })
//   }
//   // #TODO: Verify token using jwt.verify with process.env.JWT_SECRET
//   if (!process.env.JWT_SECRET) {
//     return res.status(500).json({ error: 'Server configuration error: missing JWT secret' })
//   }
//   // #TODO: Decode token to get userId and role
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET)
//     // #TODO: Set req.user = { id: userId, role: role }
//     req.user = {
//       id: payload.id,
//       role: payload.role
//     }
//     // #TODO: Call next() to proceed to route handler
//     return next()
//     // #TODO: If invalid, return 401
//   } catch (error) {
//     return res.status(401).json({ error: 'Invalid or expired token' })
//   }
// }

// function requireRole(role) {
//   return (req, res, next) => {
//     // #TODO: Check if req.user.role === role
//     if (!req.user || !req.user.role) {
//       return res.status(401).json({ error: 'Unauthorized' })
//     }
//     // #TODO: If not, return 403 Forbidden
//     if (req.user.role !== role) {
//       return res.status(403).json({ error: 'Forbidden' })
//     }
//     // #TODO: Otherwise call next()
//     return next()
//   }
// }

// module.exports = { authMiddleware, requireRole }