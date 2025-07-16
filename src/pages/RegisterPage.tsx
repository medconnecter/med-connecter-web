
import { Link } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import Layout from '@/components/layout/Layout';

const RegisterPage = () => {
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <RegisterForm />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Need help?{' '}
              <Link to="/contact" className="text-healthcare-primary hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
