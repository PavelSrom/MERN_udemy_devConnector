const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')

// @route   GET /api/auth
// @desc    test route
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    return res.json(user)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server error')
  }
})

// @route   POST /api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body

    try {
      // see if user has valid credentials (email and password)

      // checking email
      let user = await User.findOne({ email })
      if (!user)
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] })
      // checking password
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch)
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] })

      // return JWT
      const JWTpayload = {
        user: {
          id: user.id
        }
      }
      // sign the token and return it as a response
      jwt.sign(
        JWTpayload,
        config.get('jwtSecret'),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw new Error(err)
          return res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server error')
    }
  }
)

module.exports = router
