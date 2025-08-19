import React, { useState } from 'react'
import { Form, Button, Container, Row, Col, InputGroup } from 'react-bootstrap'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate() // Hook for navigation
  const email = 'jaisonroy700@gmail.com' // Replace with dynamic email if needed

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    setLoading(true)

    const requestBody = {
      email: email,
      password: newPassword,
    }

    try {
      const response = await fetch(
        'https://lunarsenterprises.com:6023/gakstechnologies/change-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      )

      const result = await response.json()

      if (result.result === true) {
        // Fix: Access the correct property
        alert('Password successfully reset!')
        navigate('/') // Ensure navigate is properly initialized
      } else {
        alert(result.message || 'Failed to reset password')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col md={4} className="mx-auto shadow p-4 rounded bg-white">
          <h4 className="text-center mb-4">Reset Password</h4>
          <Form onSubmit={handleSubmit}>
            {/* New Password */}
            <Form.Group controlId="newPassword" className="mb-3">
              <Form.Label>New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group controlId="confirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              style={{ backgroundColor: '#fd5f02', border: 'none' }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default ResetPassword
