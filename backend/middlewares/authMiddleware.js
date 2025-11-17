const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  // #TODO: Get Authorization header from req.headers
  // #TODO: Extract token from "Bearer <token>"
  // #TODO: If no token, return 401 Unauthorized
  // #TODO: Verify token using jwt.verify with process.env.JWT_SECRET
  // #TODO: If invalid, return 401
  // #TODO: Decode token to get userId and role
  // #TODO: Set req.user = { id: userId, role: role }
  // #TODO: Call next() to proceed to route handler
}

function requireRole(role) {
  return (req, res, next) => {
    // #TODO: Check if req.user.role === role
    // #TODO: If not, return 403 Forbidden
    // #TODO: Otherwise call next()
  }
}

module.exports = { authMiddleware, requireRole }