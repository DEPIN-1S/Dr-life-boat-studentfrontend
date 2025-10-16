import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CSpinner } from '@coreui/react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './scss/style.scss';
import TestInstructions from './components/Exam/TestInstructions';
import ProtectedExamQuestion from './components/Exam/ProtectedExamQuestion'; // Import protected route
import Results from './components/Exam/Results';
// const Analysis = React.lazy(() => import('./components/Exam/Analysis'));
import SubmittedExams from './components/Exam/SubmittedExams';
import Exam from './components/Exam/Exam';
import Analysis from './components/Exam/Analysis';
import Logout from './components/Login/Logout';
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const Otp = React.lazy(() => import('./components/otp/Otp'));
const Otpverification = React.lazy(() => import('./components/Otpverification/Otpverification'));
const Forget = React.lazy(() => import('./components/otp/Otp'));
const ResetPassword = React.lazy(() => import('./components/ResetPassword/Reset'));
const Register = React.lazy(() => import('./components/Register/Register'));
const Login = React.lazy(() => import('./components/Login/Login'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

const AppContent = () => {
  const location = useLocation();

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/otp-verification" element={<Otpverification />} />
        <Route path="/forget-password" element={<Forget />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/instructions" element={<TestInstructions />} />
        <Route path="/exam-view" element={<ProtectedExamQuestion />} /> {/* Use protected route */}
        <Route path="/exam/result/:seExamId" element={<Results />} />
        {/* <Route path="/exam/analysis" element={<Analysis />} /> */}
        <Route path="/submitted-exams" element={<SubmittedExams />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/500" element={<Page500 />} />
        <Route path="*" element={<DefaultLayout />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
