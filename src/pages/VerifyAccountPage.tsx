import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/utils';

const VerifyAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Accept email/phone from navigation state or query params
  const state = location.state as { email?: string; phone?: string } | undefined;
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [method, setMethod] = useState<'email' | 'phone'>(state?.email ? 'email' : 'phone');

  const email = state?.email || '';
  const phone = state?.phone || '';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    if (method === 'email' && email) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: code })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setSuccess(data.message || 'Email verified successfully!');
          setTimeout(() => {
            navigate('/account-created');
          }, 1500);
        } else {
          setError(data.message || 'Verification failed.');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else if (method === 'phone' && phone) {
      // TODO: Implement phone verification API call
      setError('Phone verification is not implemented yet.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Verify Your Account</h1>
        {(email && phone) && (
          <div className="flex justify-center mb-4 space-x-2">
            <Button
              variant={method === 'email' ? 'default' : 'outline'}
              onClick={() => setMethod('email')}
              disabled={method === 'email'}
            >
              Verify via Email
            </Button>
            <Button
              variant={method === 'phone' ? 'default' : 'outline'}
              onClick={() => setMethod('phone')}
              disabled={method === 'phone'}
            >
              Verify via Phone
            </Button>
          </div>
        )}
        <p className="mb-4 text-center text-gray-600">
          {method === 'email' && email && (
            <>A verification code has been sent to <span className="font-semibold">{email}</span>.</>
          )}
          {method === 'phone' && phone && (
            <>A verification code has been sent to <span className="font-semibold">{phone}</span>.</>
          )}
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            disabled={submitting}
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center font-semibold">{success}</div>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccountPage; 