import React, { useState } from 'react'
import { Form, Button, Container, Row, Col, InputGroup } from 'react-bootstrap'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '../../utils/apiConfig'

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || sessionStorage.getItem('resetEmail');

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Session Expired',
        text: 'Please start over.',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/forgot-password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Mismatch',
        text: 'Passwords do not match!',
      });
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/drlifeboat/student/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password: newPassword }),
        },
      )

      const result = await response.json()

      if (result.result === true) {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Password successfully reset!',
          timer: 2000,
          showConfirmButton: false
        });
        sessionStorage.removeItem('resetEmail');
        navigate('/login')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: result.message || 'Failed to reset password',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred. Please try again.',
      });
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
