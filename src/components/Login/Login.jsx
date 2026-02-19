import React, { useState } from 'react'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import './login.css'
import { useNavigate } from 'react-router-dom'

import { API_BASE_URL } from '../../utils/apiConfig'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Email validation regex
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    // Validation before API call
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      const response = await axios.post(
        API_BASE_URL + '/drlifeboat/student/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } },
      )

      if (response.data.result) {
        sessionStorage.setItem('token', response.data.data.token)
        sessionStorage.setItem('name', response.data.data.name)
        navigate('/dashboard')
      } else {
        setError(response.data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed')
      } else {
        setError('Network error. Please try again.')
      }
      console.error('Login error:', err)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left">
          <img src="/logo.png" alt="Logo" className="login-logo" />
          <h2>Sign In</h2>
          <p>
            Are you a new user?{' '}
            <a style={{ color: '#1c7c63' }} href="/register">
              Create an Account
            </a>
          </p>
        </div>

        <div className="login-right">
          <form className="login-form" onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="login-options">
              <span
                style={{ color: '#1c7c63', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>

            <button className="signin-btn" type="submit">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
