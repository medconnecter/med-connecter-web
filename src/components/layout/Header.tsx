import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
// import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  // Get doctor profile from localStorage
  useEffect(() => {
    if (user?.role === 'doctor') {
      const storedProfile = localStorage.getItem('medconnecter_doctor_profile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          // Validate that the profile has the required fields
          if (parsedProfile && parsedProfile.id) {
            setDoctorProfile(parsedProfile);
          } else {
            console.warn('Invalid doctor profile data stored');
            setDoctorProfile(null);
          }
        } catch (error) {
          console.error('Error parsing stored doctor profile:', error);
          setDoctorProfile(null);
        }
      } else {
        setDoctorProfile(null);
      }
    } else {
      setDoctorProfile(null);
    }
  }, [user]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/images/med-connector-logo.jpeg" 
            alt="Med Connecter" 
            className="h-12 w-auto object-contain" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/find-doctors" className="text-gray-600 hover:text-healthcare-primary transition-colors">
            {t('findSpecialists')}
          </Link>
          <Link to="/how-it-works" className="text-gray-600 hover:text-healthcare-primary transition-colors">
            {t('howItWorks')}
          </Link>
          <Link to="/why-medconnecter" className="text-gray-600 hover:text-healthcare-primary transition-colors font-semibold">
            Why MedConnecter
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-healthcare-primary transition-colors">
            {t('aboutUs')}
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-healthcare-primary transition-colors">
            {t('contact')}
          </Link>
        </nav>

        {/* User Menu or Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-healthcare-primary text-white">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full cursor-pointer">{t('dashboard')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to={user.role === 'doctor' && doctorProfile ? `/doctor/${doctorProfile.id}` : '/dashboard'} 
                    className="w-full cursor-pointer"
                    title={user.role === 'doctor' && !doctorProfile ? 'Loading profile...' : ''}
                  >
                    {t('profile')}
                    {user.role === 'doctor' && !doctorProfile && (
                      <span className="ml-2 text-xs text-gray-400">(Loading...)</span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/appointments" className="w-full cursor-pointer">{t('myAppointments')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-healthcare-primary text-healthcare-primary hover:bg-healthcare-light">
                  {t('login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-healthcare-primary text-white hover:bg-healthcare-dark">
                  {t('register')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <LanguageSwitcher />
          <button
            className="text-gray-500 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-3 py-3">
              <Link 
                to="/find-doctors" 
                className="text-gray-600 py-2 hover:text-healthcare-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('findSpecialists')}
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-gray-600 py-2 hover:text-healthcare-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('howItWorks')}
              </Link>
              <Link 
                to="/why-medconnecter" 
                className="text-gray-600 py-2 hover:text-healthcare-primary font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Why MedConnecter
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 py-2 hover:text-healthcare-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('aboutUs')}
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-600 py-2 hover:text-healthcare-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('contact')}
              </Link>

              {user ? (
                <>
                  <div className="border-t pt-2">
                    <Link 
                      to="/dashboard" 
                      className="block py-2 text-gray-600 hover:text-healthcare-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('dashboard')}
                    </Link>
                    <Link 
                      to={user.role === 'doctor' && doctorProfile ? `/doctor/${doctorProfile.id}` : '/dashboard'} 
                      className="block py-2 text-gray-600 hover:text-healthcare-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                      title={user.role === 'doctor' && !doctorProfile ? 'Loading profile...' : ''}
                    >
                      {t('profile')}
                      {user.role === 'doctor' && !doctorProfile && (
                        <span className="ml-2 text-xs text-gray-400">(Loading...)</span>
                      )}
                    </Link>
                    <Link 
                      to="/appointments" 
                      className="block py-2 text-gray-600 hover:text-healthcare-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('myAppointments')}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 text-red-500 hover:text-red-700"
                    >
                      {t('logout')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t pt-2 flex flex-col space-y-2">
                  <Link 
                    to="/login" 
                    className="block w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full border-healthcare-primary text-healthcare-primary">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link 
                    to="/register" 
                    className="block w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-healthcare-primary text-white">
                      {t('register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
