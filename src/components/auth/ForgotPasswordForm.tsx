
import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
      setIsEmailSent(true);
    } catch (error) {
      // Error is handled by the auth context
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to <strong>{form.getValues().email}</strong>
          </p>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsEmailSent(false)}
            >
              Try another email
            </Button>
            
            <Link to="/login">
              <Button variant="link" className="w-full text-healthcare-primary">
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
      <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
        Reset Your Password
      </h1>
      <p className="text-gray-600 text-center mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your.email@example.com" 
                    type="email" 
                    autoComplete="email"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-healthcare-primary hover:bg-healthcare-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-6">
        <Link to="/login" className="text-healthcare-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
