
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/utils';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  /**
   * Register a new user by calling the backend API.
   * @param email User's email
   * @param password User's password (not sent in payload, but may be needed for local logic)
   * @param role User's role (e.g., 'admin', 'doctor', 'patient')
   * @param phone Phone number as a string (e.g., '+917304656040')
   * @param firstName User's first name
   * @param lastName User's last name
   * @param address Address object with street, city, state, country, postalCode
   */
  const register = async (
    email: string,
    role: string,
    phone: string,
    firstName: string,
    lastName: string,
    dob: string,
    gender: string,
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    },
    languages: string[]
  ) => {
    // Split phone into countryCode and number
    let countryCode = '';
    let number = '';
    const match = phone.match(/^(\+\d{1,4})?(\d{10,})$/);
    if (match) {
      countryCode = match[1] || '';
      number = match[2] || '';
    } else {
      throw new Error('Invalid phone number format');
    }
    const payload = {
      email,
      phone: {
        countryCode: countryCode || '+91',
        number,
      },
      firstName,
      lastName,
      dob,
      gender,
      role,
      address,
      languages,
    };
    console.log('Register payload:', payload);
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    return response.json();
  };
  
  return { ...context, register, setUser: context.setUser };
};
