
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientDashboard from '@/components/dashboard/PatientDashboard';
import DoctorDashboard from '@/components/dashboard/DoctorDashboard';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if no user is logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-healthcare-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {user?.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />}
    </Layout>
  );
};

export default DashboardPage;
