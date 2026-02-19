import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Container, Form } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, X } from 'lucide-react'
import { API_BASE_URL } from '../../utils/apiConfig'
import './otpVerification.css'

const OTPVerification = () => {
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isVerified, setIsVerified] = useState(false) // State to toggle success view
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  useEffect(() => {
    if (!isVerified) {
      inputsRef.current[0]?.focus()
    }
  }, [isVerified])

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }

    if (!value && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(pastedData)) return

    const newOtp = pastedData?.split('')
    setOtp(newOtp)

    inputsRef.current[5]?.focus()
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit OTP.')
      return
    }

    try {
      // Determine if this is a reset flow
      const isReset = location.state?.isReset || false;

      const response = await axios.post(
        API_BASE_URL + '/drlifeboat/student/verify-otp',
        {
          email,
          otp: parseInt(otpCode, 10),
          reset: isReset, // Dynamic reset flag
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )

      if (response.data.result === true) {
        if (isReset) {
          // For reset flow, we might want to navigate directly or show a slightly different message
          // But based on user request, let's show the success view for now or navigate
          // Design seems specific to registration, so let's stick to old flow for reset if needed?
          // "and verify that second image design" implies registration success
          // Let's assume this design is for registration success primarily.
          // For reset, we just navigate to reset password page usually.
          setMessage('OTP verified successfully.')
          setTimeout(() => {
            navigate('/reset-password', { state: { email } });
          }, 1500)
        } else {
          setIsVerified(true) // Show success view
        }
      } else {
        setError(response.data.message || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.')
    }
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  if (isVerified) {
    return (
      <div className="success-container">
        {/* Top Success Banner */}
        <div className="success-banner">
          <div className="success-banner-content">
            <CheckCircle size={24} color="white" fill="white" stroke="#28a745" /> {/* Filled white check with green stroke */}
            <span>Email verified successfully!</span>
          </div>
          {/* Close button mostly for decoration here as it's a dedicated page */}
          <button className="close-banner" onClick={() => { }}><X size={24} /></button>
        </div>

        <div className="success-card">
          <div className="success-card-header">
            <div className="success-icon-large">
              <CheckCircle size={50} color="#8bc34a" /> {/* Check icon inside circle */}
            </div>
            <h3 className="success-card-title">Registration completed successfully.</h3>
          </div>
          <div className="success-card-body">
            <p className="success-card-message">
              You may now log in and begin your<br />
              journey with <span className="brand-text">Dr Life Boat.</span>
            </p>

            <div className="note-box">
              <strong>Note :</strong> Please check your spam folder as well as the inbox of the registered mail for login credentials.
            </div>

            <button className="login-btn-success" onClick={handleLoginClick}>
              Click here to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="otp-container">
      {/* Under Process Icon */}
      <CheckCircle className="under-process-icon" size={80} strokeWidth={1.5} /> {/* Using CheckCircle as placeholder for custom icon */}

      <h2 className="under-process-heading">Under Process</h2>

      <h3 className="sub-heading">You're almost there!</h3>
      <p className="description-text">Your registration has been successfully initiated.</p>

      <div className="info-box">
        <p className="info-box-text">
          A one-time verification code has been sent to your registered email address.<br />
          <span>Please enter the code to verify your email and complete your registration with </span>
          <span className="highlight-red">Dr Life Boat.</span>
        </p>
      </div>

      {error && <div className="alert alert-danger w-100 max-w-md text-center mb-3" style={{ maxWidth: '400px' }}>{error}</div>}
      {message && <div className="alert alert-success w-100 max-w-md text-center mb-3" style={{ maxWidth: '400px' }}>{message}</div>}

      <Form onSubmit={handleVerifyOTP} className="w-100 d-flex flex-column align-items-center">
        <div className="otp-inputs-row" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              ref={(el) => (inputsRef.current[index] = el)}
              className="otp-input"
            />
          ))}
        </div>

        <button type="submit" className="verify-btn">
          Verify OTP
        </button>
      </Form>
    </div>
  )
}

export default OTPVerification
