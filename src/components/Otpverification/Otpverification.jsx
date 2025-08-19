import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'

const OTPVerification = () => {
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

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
      const response = await axios.post(
        import.meta.env.VITE_BASE_URL + '/drlifeboat/student/verify-otp',
        {
          email,
          otp: parseInt(otpCode, 10),
          reset: 'false',
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )

      if (response.data.result === true) {
        setMessage('OTP verified. Registration successful.')
        setTimeout(() => navigate('/', { state: { email } }), 2000)
      } else {
        setError(response.data.message || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.')
    }
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h2 style={{ color: '#1c7c63' }}>Verify OTP</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleVerifyOTP} className="w-75 text-center">
        <Form.Label>Enter 6-digit OTP</Form.Label>
        <Row className="justify-content-center mb-3" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <Col xs={2} sm={1} key={index} className="px-1">
              <Form.Control
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                className="text-center fs-4"
                style={{
                  height: '50px',
                  border: '2px solid #1c7c63',
                  borderRadius: '8px',
                }}
              />
            </Col>
          ))}
        </Row>
        <Button
          type="submit"
          variant="primary"
          className="w-100"
          style={{ backgroundColor: '#1c7c63', border: 'none' }}
        >
          Verify OTP
        </Button>
      </Form>
    </Container>
  )
}

export default OTPVerification
