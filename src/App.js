import React, { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './scss/style.scss'
import TestInstructions from './components/Exam/TestInstructions'
import ExamQuestion from './components/Exam/ExamQuestion'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Otp = React.lazy(() => import('./components/otp/Otp'))
const Otpverification = React.lazy(() => import('./components/Otpverification/Otpverification'))
const Forget = React.lazy(() => import('./components/otp/Otp'))
const ResetPassword = React.lazy(() => import('./components/ResetPassword/Reset'))
// Pages
const Register = React.lazy(() => import('./components/Register/Register'))
const Login = React.lazy(() => import('./components/Login/Login'))
// const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const AppContent = () => {
  const location = useLocation() // Get current path

  const isAuthPage = location.pathname === '/login' // Check if the current page is login

  return (
    <Suspense
      fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/otp-verification" element={<Otpverification />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/500" element={<Page500 />} />
        <Route path="*" element={<DefaultLayout />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forget-password" element={<Forget />} />
        <Route path="/exam-view" element={<ExamQuestion />} />
      </Routes>
    </Suspense>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
