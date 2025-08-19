import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import './register.css'

export default function Register() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: '',
  })
  const [load, setLoad] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json')
        const data = await response.json()
        setFormData((prev) => ({ ...prev, country: data.country_name }))
      } catch (error) {
        console.error('Failed to fetch country:', error)
      }
    }

    fetchCountry()
  }, [load])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      country: formData.country,
    }

    try {
      const response = await axios.post(
        import.meta.env.VITE_BASE_URL + '/drlifeboat/student/register',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      console.log('Registration successful:', response.data)
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        country: '',
      })

      if (response.data.result === true) {
        Swal.fire({
          icon: 'success',
          title: 'OTP send Successfully',
          text: 'Your OTP has been send to your mail.',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/otp-verification', { state: { email: formData.email } })
          }
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: response.data.message || 'Please try again.',
          confirmButtonText: 'OK',
        })
        setLoad(load + 1)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Registration failed')
      } else {
        setError('Network error. Please try again.')
      }
      console.error('Registration error:', err)
    }
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-left">
          <img src="/logo.png" alt="Logo" className="register-logo" />
          <h2>Create an Account</h2>
          <p>
            Already have an account?{' '}
            <a style={{ color: '#1c7c63' }} href="/">
              Sign In
            </a>
          </p>
        </div>

        <div className="register-right">
          <form className="register-form" onSubmit={handleRegister}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
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

            <label>Confirm Password</label>
            <div className="password-field">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label>Country</label>
            <input
              type="text"
              name="country"
              placeholder="Enter your country"
              value={formData.country}
              onChange={handleChange}
              readOnly
            />

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button className="register-btn" type="submit">
              Register
            </button>
          </form>

          {/* <div className="footer-links">
            <a style={{ color: '#1c7c63' }} href="#">
              Privacy
            </a>
            <a style={{ color: '#1c7c63' }} href="#">
              Terms
            </a>
          </div> */}
        </div>
      </div>
    </div>
  )
}
