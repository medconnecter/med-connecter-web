import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const AdditionalDetailsMessagePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const userData = location.state?.userData;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Navigate to additional details page with user data
          navigate('/additional-details', { 
            state: { 
              profile: userData,
              fromMessage: true 
            } 
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, userData]);

  const handleProceedNow = () => {
    navigate('/additional-details', { 
      state: { 
        profile: userData,
        fromMessage: true 
      } 
    });
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Additional Information Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <p className="text-gray-600">
                  Thank you for registering as a doctor! To complete your verification process, 
                  we need some additional information from you.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">What we need:</h3>
                  <ul className="text-sm text-blue-800 space-y-1 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                      Professional qualifications
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                      Work experience details
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                      Specializations and services
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                      Insurance and certification documents
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500">
                  This information helps us verify your credentials and provide better service to patients.
                </p>
              </div>
              
              <div className="flex flex-col space-y-3 pt-4">
                <Button 
                  onClick={handleProceedNow}
                  className="w-full bg-healthcare-primary hover:bg-healthcare-dark text-white"
                >
                  Proceed Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  Auto-redirecting in {countdown} seconds...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdditionalDetailsMessagePage; 