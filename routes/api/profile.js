const express = require('express')
const request = require('request')
const config = require('config')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('User', ['name', 'avatar'])
    if (!profile) return res.status(400).json({ msg: 'No profile for this user' })

    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

// @route   POST /api/profile
// @desc    Create / update user's profile
// @access  Private
router.post('/', [auth, [
  check('status', 'Status is required').not().isEmpty(),
  check('skills', 'Skills is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body

  // Build profile object
  const profileFields = {}
  profileFields.user = req.user.id
  if (company) profileFields.company = company
  if (website) profileFields.website = website
  if (location) profileFields.location = location
  if (bio) profileFields.bio = bio
  if (status) profileFields.status = status
  if (githubusername) profileFields.githubusername = githubusername
  if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim())

  // Build social object
  profileFields.social = {}
  if (youtube) profileFields.social.youtube = youtube
  if (twitter) profileFields.social.twitter = twitter
  if (facebook) profileFields.social.facebook = facebook
  if (linkedin) profileFields.social.linkedin = linkedin
  if (instagram) profileFields.social.instagram = instagram

  try {
    let profile = await Profile.findOne({ user: req.user.id })
    if (profile) {
      // update profile
      profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })

      return res.json(profile)
    }

    // Create profile
    profile = new Profile(profileFields)
    await profile.save()

    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

// @route   GET /api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])

    return res.json(profiles)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

// @route   GET /api/profile/user/:id
// @desc    Get profile by id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id })
      // 'User' (uppercase U) doesn't work inside this populate, why it must be lowercase?
      .populate('user', ['name', 'avatar'])
    if (!profile) return res.status(400).json({ msg: 'Profile not found' })

    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    // ObjectId fixes (not valid ObjectId in request etc.)
    if (err.kind == 'ObjectId') return res.status(400).json({ msg: 'Profile not found' })
    return res.status(500).json(err)
  }
})

// @route   DELETE /api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // remove user's posts
    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id })
    // remove user
    await User.findByIdAndRemove({ _id: req.user.id })

    return res.json({ msg: 'User removed successfully' })
  } catch (err) {
    console.error(err.message)
    return res.status(400).json(err)
  }
})

// @route   PUT /api/profile/experience
// @desc    Add experience to our profile
// @access  Private
router.put('/experience', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { title, company, location, from, to, current, description } = req.body

  const newExperience = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try {
    // fetch the profile
    const profile = await Profile.findOne({ user: req.user.id })
    // add a new experience to it (to the beginning of the array)
    profile.experience.unshift(newExperience)
    // save updated profile into our database
    await profile.save()

    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

// @route   DELETE /api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    // fetch the profile
    const profile = await Profile.findOne({ user: req.user.id })
    // update the experience array
    profile.experience = profile.experience.filter(exp => exp._id.toString() !== req.params.exp_id)
    // save your work
    await profile.save()

    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

// @route   PUT /api/profile/education
// @desc    Add education to our profile
// @access  Private
router.put('/education', [auth, [
  check('school', 'School is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty(),
  check('fieldofstudy', 'Field of study is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { school, degree, fieldofstudy, from, to, current, description } = req.body

  const newEducation = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }

  try {
    // fetch the profile
    const profile = await Profile.findOne({ user: req.user.id })
    // add a new education to it (to the beginning of the array)
    profile.education.unshift(newEducation)
    // save updated profile into our database
    await profile.save()

    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

// @route   DELETE /api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    // fetch the profile
    const profile = await Profile.findOne({ user: req.user.id })
    // update the education array
    profile.education = profile.education.filter(edu => edu._id.toString() !== req.params.edu_id)
    // save your work
    await profile.save()

    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

// @route   GET /api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/
      ${req.params.username}/repos?per_page=5&sort=created:asc
      &client_id=${config.get('githubClientId')}
      &client_secret=${config.get('githubClientSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    }
    // making a request to GitHub from node.js
    request(options, (err, resp, body) => {
      if (err) console.log(err)
      console.log(resp)
      if (resp.statusCode !== 200) return res.status(404).json({ msg: 'No github profile found' })

      return res.json(JSON.parse(body))
    })
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

module.exports = router