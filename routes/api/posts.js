const express = require('express')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const router = express.Router()

const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() })

    try {
      // grab the logged user
      const user = await User.findById(req.user.id).select('-password')
      // create a new post
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      })
      await newPost.save()

      return res.json(newPost)
    } catch (err) {
      console.error(err.message)
      return res.status(500).json(err)
    }
  }
)

// @route   GET /api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }) // newest first

    return res.json(posts)
  } catch (err) {
    return res.status(500).json(err)
  }
})

// @route   GET /api/posts/:id
// @desc    Get a single post
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'No post with such ID' })

    return res.json(post)
  } catch (err) {
    if (err.kind === 'ObjectId')
      return res.status(404).json({ msg: 'No post with such ID' })
    return res.status(500).json(err)
  }
})

// @route   DELETE /api/posts/:id
// @desc    Delete a single post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'No post with such ID' })
    // check if the post is the owner's who is deleting it
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete post' })
    }
    // otherwise, remove the post
    await post.remove()

    return res.json({ msg: 'Post removed successfully' })
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId')
      return res.status(404).json({ msg: 'No post with such ID' })
    return res.status(500).json(err)
  }
})

// @route   PUT /api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    // get the post
    const post = await Post.findById(req.params.id)
    // check if the post has already been liked by this user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'You already liked this post' })
    }
    post.likes.unshift({ user: req.user.id })
    await post.save()

    return res.json(post.likes)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

// @route   PUT /api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    // get the post
    const post = await Post.findById(req.params.id)
    // check if the post has already been liked by this user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: 'You have not liked this post yet' })
    }
    // remove my like from this post
    post.likes = post.likes.filter(like => like.user.toString() !== req.user.id)
    await post.save()

    return res.json(post.likes)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

// @route   POST /api/posts/comment/:id
// @desc    Comment on a specific post
// @access  Private
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() })

    try {
      // grab the logged user and post
      const user = await User.findById(req.user.id).select('-password')
      const post = await Post.findById(req.params.id)
      // create a new comment
      const newComment = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      })
      // add this comment as the newest one
      post.comments.unshift(newComment)
      // save into db
      await post.save()

      return res.json(post.comments)
    } catch (err) {
      console.error(err.message)
      return res.status(500).json(err)
    }
  }
)

// @route   DELETE /api/posts/comment/:id/:comment_id
// @desc    Delete a comment on a specific post
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    // get the post
    const post = await Post.findById(req.params.id)
    // pull out comment
    const comment = post.comments.find(com => com.id === req.params.comment_id)
    if (!comment) return res.status(404).json({ msg: 'Comment not found' })
    // check if the user deletes his own comment
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not allowed to delete comment' })
    // remove the comment from this post
    post.comments = post.comments.filter(com => com.id !== comment.id)
    await post.save()

    return res.json(post.comments)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json(err)
  }
})

module.exports = router
