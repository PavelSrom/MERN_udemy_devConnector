const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
  // get token from request header
  const token = req.header('x-auth-token')
  // check if no token
  if (!token)
    return res.status(401).json({ msg: 'No token provided, auth denied' })
  // verify token and attach it as a 'user' property to request
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'))
    req.user = decoded.user

    next()
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' })
  }
}
