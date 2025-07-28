
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  phone: z.string().min(10, { message: 'Phone number is required' }).regex(/^\+?[0-9]{10,15}$/, {
    message: 'Please enter a valid phone number',
  }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  dob: z.string().min(1, { message: 'Date of birth is required' }),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender' }),
  address: z.object({
    street: z.string().min(1, { message: 'Street is required' }),
    city: z.string().min(1, { message: 'City is required' }),
    state: z.string().min(1, { message: 'State is required' }),
    country: z.string().min(1, { message: 'Country is required' }),
    postalCode: z.string().min(1, { message: 'Postal code is required' }),
  }),
  languages: z.array(z.string().min(1, { message: 'Language cannot be empty' })).min(1, { message: 'Please enter at least one language' }),
  role: z.enum(['patient', 'doctor'], {
    required_error: 'Please select an account type',
  }),
  agreeToTerms: z.boolean({
    required_error: 'You must agree to the terms and conditions',
  }).refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  })
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    error: string;
    code: string;
    details: any;
  }>({
    isOpen: false,
    error: '',
    code: '',
    details: {}
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      dob: '',
      gender: 'male',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      languages: [],
      role: 'patient',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await register(
        data.email,
        data.role,
        data.phone,
        data.firstName,
        data.lastName,
        data.dob,
        data.gender,
        data.address,
        data.languages
      );
      
      if (result.success === false) {
        // Show error modal
        setErrorModal({
          isOpen: true,
          error: result.error,
          code: result.code,
          details: result.details
        });
      } else {
        // Success - navigate to verification
        navigate('/verify-account', { state: { email: data.email, phone: data.phone } });
      }
    } catch (error) {
      // Handle unexpected errors
      setErrorModal({
        isOpen: true,
        error: 'An unexpected error occurred. Please try again.',
        code: 'UNEXPECTED_ERROR',
        details: {}
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create your Med Connecter Account
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. +1234567890"
                      type="tel"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Select date of birth"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border rounded px-3 py-2">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Postal Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Languages Spoken</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. English, Dutch, Hindi"
                      value={field.value.join(', ')}
                      onChange={e => field.onChange(e.target.value.split(',').map(lang => lang.trim()).filter(Boolean))}
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

      {/* Error Modal */}
      <Dialog open={errorModal.isOpen} onOpenChange={(open) => setErrorModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Registration Failed</DialogTitle>
            <DialogDescription>
              {errorModal.error}
            </DialogDescription>
          </DialogHeader>
          
          {errorModal.details && Object.keys(errorModal.details).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Details:</h4>
              <div className="space-y-1">
                {Object.entries(errorModal.details).map(([field, message]) => (
                  <div key={field} className="text-sm text-red-600">
                    <span className="font-medium capitalize">{field}:</span> {message as string}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegisterForm;
