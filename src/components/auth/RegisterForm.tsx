
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long',
  }),
  confirmPassword: z.string(),
  role: z.enum(['patient', 'doctor'], {
    required_error: 'Please select an account type',
  }),
  agreeToTerms: z.boolean({
    required_error: 'You must agree to the terms and conditions',
  }).refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  })
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await register(data.email, data.password, data.role);
      navigate('/onboarding');
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
        Create your HealthConnect<span className="text-healthcare-primary">NL</span> Account
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    autoComplete="new-password"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    autoComplete="new-password"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Account Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="patient" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        I'm a Patient
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="doctor" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        I'm a Doctor
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to the{' '}
                    <Link to="/terms" className="text-healthcare-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-healthcare-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </FormLabel>
                  <FormDescription>
                    We comply with GDPR regulations for healthcare data.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-healthcare-primary hover:bg-healthcare-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-6">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-healthcare-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
