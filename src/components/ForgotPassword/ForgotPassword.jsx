
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Login/login.css'; // Reusing Login styles
import Swal from 'sweetalert2';

import { API_BASE_URL } from '../../utils/apiConfig';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                API_BASE_URL + '/drlifeboat/student/forgot-password',
                { email },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.result) {
                // Success
                await Swal.fire({
                    icon: 'success',
                    title: 'OTP Sent',
                    text: response.data.message || 'Please check your email for the verification code.',
                    timer: 2000,
                    showConfirmButton: false
                });
                // Store email for OTP verification step if needed, or just navigate
                sessionStorage.setItem('resetEmail', email);
                navigate('/otp-verification', { state: { email, isReset: true } });
            } else {
                setError(response.data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || 'Request failed');
            } else {
                setError('Network error. Please try again.');
            }
            console.error('Forgot Password error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-left">
                    <img src="/logo.png" alt="Logo" className="login-logo" />
                    <h2>Forgot Password</h2>
                    <p>
                        Remember your password?{' '}
                        <a style={{ color: '#1c7c63' }} href="/login">
                            Sign In
                        </a>
                    </p>
                </div>

                <div className="login-right">
                    <form className="login-form" onSubmit={handleForgotPassword}>
                        <h3 style={{ marginBottom: '20px', color: '#333' }}>Reset Your Password</h3>
                        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                            Enter the email address associated with your account and we will send you a code to reset your password.
                        </p>

                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

                        <button
                            className="signin-btn"
                            type="submit"
                            disabled={loading}
                            style={{ marginTop: '20px' }}
                        >
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
