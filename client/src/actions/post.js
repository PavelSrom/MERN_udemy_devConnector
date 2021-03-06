import axios from 'axios'
import { setAlert } from './alert'
import {
  GET_POSTS,
  POST_ERROR,
  UPDATE_LIKES,
  DELETE_POST,
  ADD_POST,
  GET_POST,
  ADD_COMMENT,
  REMOVE_COMMENT
} from './types'

// get all posts
export const getPosts = () => async dispatch => {
  try {
    const res = await axios.get('/api/posts')
    dispatch({ type: GET_POSTS, payload: res.data })
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

// add like
export const addLike = postID => async dispatch => {
  try {
    const res = await axios.put(`/api/posts/like/${postID}`)
    dispatch({ type: UPDATE_LIKES, payload: { postID, likes: res.data } })
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

// remove like
export const removeLike = postID => async dispatch => {
  try {
    const res = await axios.put(`/api/posts/unlike/${postID}`)
    dispatch({ type: UPDATE_LIKES, payload: { postID, likes: res.data } })
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

// delete a post
export const deletePost = postID => async dispatch => {
  try {
    const res = await axios.delete(`/api/posts/${postID}`)
    dispatch({ type: DELETE_POST, payload: postID })
    dispatch(setAlert('Post removed', 'success'))
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

// add a new post
export const addPost = formData => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  try {
    const res = await axios.post('/api/posts', formData, config)
    dispatch({ type: ADD_POST, payload: res.data })
    dispatch(setAlert('Post created', 'success'))
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

// get a single post
export const getPost = postID => async dispatch => {
  try {
    const res = await axios.get(`/api/posts/${postID}`)
    dispatch({ type: GET_POST, payload: res.data })
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

// add a comment to post
export const addComment = (formData, postID) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  try {
    const res = await axios.post(
      `/api/posts/comment/${postID}`,
      formData,
      config
    )
    dispatch({ type: ADD_COMMENT, payload: res.data })
    dispatch(setAlert('Comment added', 'success'))
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

// delete a comment from post
export const deleteComment = (postID, commentID) => async dispatch => {
  try {
    const res = await axios.delete(`/api/posts/comment/${postID}/${commentID}`)
    dispatch({ type: REMOVE_COMMENT, payload: commentID })
    dispatch(setAlert('Comment removed', 'success'))
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}
