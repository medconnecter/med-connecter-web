
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Log in to Med Connecter
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Password</FormLabel>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-healthcare-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    autoComplete="current-password"
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
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-6">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-healthcare-primary hover:underline">
            Register
          </Link>
        </p>
      </div>

      <div className="mt-8 border-t pt-6">
        <p className="text-gray-500 text-sm text-center mb-4">For demo purposes:</p>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="text-xs"
            onClick={() => {
              form.setValue('email', 'patient@example.com');
              form.setValue('password', 'password123');
            }}
          >
            Use Patient Demo
          </Button>
          <Button 
            variant="outline" 
            className="text-xs"
            onClick={() => {
              form.setValue('email', 'doctor@example.com');
              form.setValue('password', 'password123');
            }}
          >
            Use Doctor Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
