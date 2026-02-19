import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import './register.css'
import { API_BASE_URL } from '../../utils/apiConfig'

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
    state: '',
    district: '',
    location: '',
  })
  const [load, setLoad] = useState('')
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNext = () => {
    setError('')
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Please fill in all fields')
        return
      }
    } else if (currentStep === 2) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please fill in all password fields')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handlePrev = () => {
    setError('')
    setCurrentStep((prev) => prev - 1)
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

    setIsLoading(true)

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      country: formData.country,
      state: formData.state,
      district: formData.district,
      location: formData.location,
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/drlifeboat/student/register`,
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
        state: '',
        district: '',
        location: '',
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
    } finally {
      setIsLoading(false)
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
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <>
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
              </>
            )}

            {/* Step 2: Password Details */}
            {currentStep === 2 && (
              <>
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
              </>
            )}

            {/* Step 3: Location Details */}
            {currentStep === 3 && (
              <>
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="Enter your country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />

                <label>State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Enter your state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />

                <label>District</label>
                <input
                  type="text"
                  name="district"
                  placeholder="Enter your district"
                  value={formData.district}
                  onChange={handleChange}
                />

                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </>
            )}

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="button-group" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px' }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  className="register-btn"
                  style={{ backgroundColor: '#6c757d', color: 'white' }}
                  onClick={handlePrev}
                >
                  Previous
                </button>
              )}

              {currentStep < 3 && (
                <button
                  type="button"
                  className="register-btn"
                  onClick={handleNext}
                >
                  Next
                </button>
              )}


              {currentStep === 3 && (
                <button
                  className="register-btn"
                  type="submit"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              )}
            </div>
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
