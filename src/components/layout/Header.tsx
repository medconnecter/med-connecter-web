import { useState } from 'react';
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

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
            Find Specialists
          </Link>
          <Link to="/how-it-works" className="text-gray-600 hover:text-healthcare-primary transition-colors">
            How it Works
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-healthcare-primary transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-healthcare-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* User Menu or Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
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
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/appointments" className="w-full cursor-pointer">My Appointments</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-healthcare-primary text-healthcare-primary hover:bg-healthcare-light">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-healthcare-primary text-white hover:bg-healthcare-dark">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-500 focus:outline-none"
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
                Find Specialists
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-gray-600 py-2 hover:text-healthcare-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 py-2 hover:text-healthcare-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-600 py-2 hover:text-healthcare-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {user ? (
                <>
                  <div className="border-t pt-2">
                    <Link 
                      to="/dashboard" 
                      className="block py-2 text-gray-600 hover:text-healthcare-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="block py-2 text-gray-600 hover:text-healthcare-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/appointments" 
                      className="block py-2 text-gray-600 hover:text-healthcare-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Appointments
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 text-red-500 hover:text-red-700"
                    >
                      Logout
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
                      Log in
                    </Button>
                  </Link>
                  <Link 
                    to="/register" 
                    className="block w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-healthcare-primary text-white">
                      Register
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
