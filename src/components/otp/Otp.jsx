import React, { useState } from 'react'
import axios from 'axios'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { API_BASE_URL } from '../../utils/apiConfig'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await axios.post(
        API_BASE_URL + '/drlifeboat/student/forgot-password',
        { email },
        { headers: { 'Content-Type': 'application/json' } },
      )

      // Check if response is successful
      if (response.data.result === true) {
        setMessage('OTP sent to your email.')
        setTimeout(() => navigate('/otp-verification', { state: { email } }), 2000)
      } else {
        setError(response.data.message || 'Error sending request. Please try again.')
      }
    } catch (err) {
      setError('Error sending request. Please try again.')
    }
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h2 style={{ color: '#1c7c63' }}>Forgot Password</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Button
          type="submit"
          variant="primary"
          className="w-100"
          style={{ backgroundColor: '#1c7c63', border: 'none' }}
        >
          Send OTP
        </Button>
      </Form>
    </Container>
  )
}

export default ForgotPassword
