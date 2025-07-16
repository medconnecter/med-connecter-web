
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/lib/utils';

const identifierSchema = z.object({
  identifier: z.string().min(3, { message: 'Please enter your email or phone' }),
});
const otpSchema = z.object({
  otp: z.string().min(4, { message: 'Please enter the OTP sent to you' }),
});

type IdentifierFormValues = z.infer<typeof identifierSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

const LoginForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [type, setType] = useState<'email' | 'phone'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { setUser } = useAuth();

  const identifierForm = useForm<IdentifierFormValues>({
    resolver: zodResolver(identifierSchema),
    defaultValues: { identifier: '' },
  });
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // Step 1: Initiate login
  const onIdentifierSubmit = async (data: IdentifierFormValues) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: data.identifier })
      });
      const res = await response.json();
      if (response.ok) {
        setIdentifier(data.identifier);
        setType(data.identifier.includes('@') ? 'email' : 'phone');
        setStep('otp');
        setSuccess('OTP sent! Please check your ' + (data.identifier.includes('@') ? 'email' : 'phone'));
      } else {
        setError(res.message || 'Login initiation failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const onOtpSubmit = async (data: OtpFormValues) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          otp: data.otp,
          type,
          deviceInfo: {
            deviceId: 'web',
            deviceType: 'browser',
          },
        })
      });
      const res = await response.json();
      if (response.ok && res.success) {
        setSuccess(res.message || 'Login successful! Redirecting...');
        // Update AuthContext and localStorage with latest user info
        if (res.user) {
          try {
            setUser(res.user);
            localStorage.setItem('healthconnect_user', JSON.stringify(res.user));
            window.dispatchEvent(new Event('storage'));
          } catch (e) { /* ignore */ }
        }
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setError(res.message || 'OTP verification failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Log in to Med Connecter
      </h1>
      {step === 'identifier' && (
        <Form {...identifierForm}>
          <form onSubmit={identifierForm.handleSubmit(onIdentifierSubmit)} className="space-y-6">
            <FormField
              control={identifierForm.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com or phone"
                      type="text"
                      autoComplete="username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center font-semibold">{success}</div>}
            <Button
              type="submit"
              className="w-full bg-healthcare-primary hover:bg-healthcare-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        </Form>
      )}
      {step === 'otp' && (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter OTP"
                      type="text"
                      autoComplete="one-time-code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center font-semibold">{success}</div>}
            <Button
              type="submit"
              className="w-full bg-healthcare-primary hover:bg-healthcare-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setStep('identifier');
                setError('');
                setSuccess('');
                otpForm.reset();
              }}
              disabled={isSubmitting}
            >
              Back
            </Button>
          </form>
        </Form>
      )}
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-healthcare-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;



