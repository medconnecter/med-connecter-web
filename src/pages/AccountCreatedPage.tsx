import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AccountCreatedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Account Created!</h1>
        <p className="mb-4 text-gray-700">
          Your account has been successfully created and verified.<br />
          Please log in using your email or phone number to continue.
        </p>
        <Button className="w-full" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default AccountCreatedPage; 