import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear sessionStorage
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('name'); // Clear name as well

        // Clear all exam-related localStorage keys
        localStorage.removeItem('currentExam');
        localStorage.removeItem('currentExamId');
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith('examResponses_') ||
            key.startsWith('lockedQuestions_') ||
            key.startsWith('markedReview_') ||
            key.startsWith('examEndTime_') ||
            key.startsWith('examResults_') ||
            key.startsWith('examAnswerValues_')
          ) {
            localStorage.removeItem(key);
          }
        });

        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        // Navigate to login
        navigate('/login', { replace: true })
      } catch (error) {
        console.error('Logout error:', error)
        navigate('/login', { replace: true })
      }
    }

    handleLogout()
  }, [navigate])

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Logging out...</h2>
    </div>
  )
}

export default Logout
