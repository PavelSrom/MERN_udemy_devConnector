const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')


// @route   POST /api/users
// @desc    Register user in the system
// @access  Public
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { name, email, password } = req.body

  try {
    // see if user with that email exists, if they do, throw error
    let user = await User.findOne({ email })
    if (user) return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
    // get users gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })
    user = new User({ name, email, avatar, password })
    // hash the password and save user into DB
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    await user.save()
    // return JWT
    const JWTpayload = {
      user: {
        id: user.id // I don't have to do '_id', mongoose does it automatically
      }
    }
    // sign the token and return it as a response
    jwt.sign(
      JWTpayload,
      config.get('jwtSecret'),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw new Error(err)
        return res.json({ token })
      }
    )
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server error')
  }
})

module.exports = router