import axios from 'axios'
import { setAlert } from './alert'
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE
} from '../actions/types'
import setAuthToken from '../utils/setAuthToken'

// load user
export const loadUser = () => async dispatch => {
  if (localStorage.token) {
    // localStorage.token ???
    setAuthToken(localStorage.token)
  }

  try {
    const response = await axios.get('/api/auth')
    console.log(response.data)
    dispatch({ type: USER_LOADED, payload: response.data })
  } catch (err) {
    dispatch({ type: AUTH_ERROR })
  }
}

// register user
export const register = ({ name, email, password }) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const body = JSON.stringify({ name, email, password })

  try {
    const response = await axios.post('/api/users', body, config)
    dispatch({ type: REGISTER_SUCCESS, payload: response.data })
    dispatch(loadUser())
  } catch (err) {
    console.log(err.response.data.errors)
    // just visual alert from the back-end
    const errors = err.response.data.errors
    if (errors) errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))

    dispatch({ type: REGISTER_FAIL })
  }
}

// login user
export const login = (email, password) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const body = JSON.stringify({ email, password })

  try {
    const response = await axios.post('/api/auth', body, config)
    dispatch({ type: LOGIN_SUCCESS, payload: response.data })
    dispatch(loadUser())
  } catch (err) {
    console.log(err.response.data.errors)
    // just visual alert from the back-end
    const errors = err.response.data.errors
    if (errors) errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))

    dispatch({ type: LOGIN_FAIL })
  }
}

// logout / clear profile
export const logout = () => dispatch => {
  dispatch({ type: CLEAR_PROFILE })
  dispatch({ type: LOGOUT })
}
