import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

/**
 * Email Verification Page
 */
const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, loading, error } = useAuth();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [status, setStatus] = useState(token ? 'verifying' : 'missing_token');

  const handleVerify = async () => {
    if (!token) {
      setStatus('missing_token');
      return;
    }

    setStatus('verifying');
    const result = await verifyEmail(token);

    if (result.success) {
      setStatus('success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setStatus('error');
    }
  };

  const handleResend = async () => {
    // In production, call API to resend verification email
    alert('Verification email resent! (Demo)');
  };

  if (status === 'missing_token') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verification Link Missing</h2>
          <p className="mt-2 text-gray-600">
            The verification link appears to be invalid or missing.
          </p>
          <Button onClick={handleResend} className="mt-6">
            Resend Verification Email
          </Button>
          <p className="mt-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Return to Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
          <p className="mt-2 text-gray-600">
            Your email has been successfully verified. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
          <p className="mt-2 text-gray-600">
            {error || 'The verification link is invalid or has expired.'}
          </p>
          <Button onClick={handleResend} className="mt-6">
            Resend Verification Email
          </Button>
          <p className="mt-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Return to Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmail;
