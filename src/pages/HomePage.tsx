import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import SpecialtyCard from '@/components/healthcare/SpecialtyCard';
import { 
  Heart, 
  Brain, 
  Bone, 
  Flower, 
  Eye, 
  Ear 
} from 'lucide-react';

const HomePage = () => {
  // Define our specialties with colorful icons
  const specialties = [
    {
      name: "Cardiology",
      icon: <Heart />,
      color: "#e74c3c", // Red
      href: "/find-doctors?specialty=cardiology"
    },
    {
      name: "Neurology",
      icon: <Brain />,
      color: "#3498db", // Blue
      href: "/find-doctors?specialty=neurology"
    },
    {
      name: "Orthopedics",
      icon: <Bone />,
      color: "#9b59b6", // Purple
      href: "/find-doctors?specialty=orthopedics"
    },
    {
      name: "Dermatology",
      icon: <Flower />,
      color: "#f39c12", // Orange
      href: "/find-doctors?specialty=dermatology"
    },
    {
      name: "Ophthalmology",
      icon: <Eye />,
      color: "#2ecc71", // Green
      href: "/find-doctors?specialty=ophthalmology"
    },
    {
      name: "ENT",
      icon: <Ear />,
      color: "#1abc9c", // Teal
      href: "/find-doctors?specialty=ent"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-healthcare-primary to-healthcare-secondary text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-12 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Book a consultation with a medical specialist without waiting time - online or on location
              </h1>
              <p className="text-xl mb-8 opacity-90">
                With or without referral. Fast, safe and reliable. 
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/find-doctors">
                  <Button className="bg-white text-healthcare-primary hover:bg-gray-100 font-medium text-lg px-8 py-6">
                    Find Specialists
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-healthcare-primary font-medium text-lg px-8 py-6">
                    Join as Patient
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/images/doctor-consultation-illustration.jpg" 
                alt="Doctor consultation illustration" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How Med Connecter Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center card-hover">
              <div className="bg-healthcare-light w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6">
                <svg className="w-8 h-8 text-healthcare-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Find the Right Specialist</h3>
              <p className="text-gray-600 mb-4">
                Search for specialists by specialty, location, language, or availability. Read reviews and compare doctors to find your perfect match.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center card-hover">
              <div className="bg-healthcare-light w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6">
                <svg className="w-8 h-8 text-healthcare-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Book an Appointment</h3>
              <p className="text-gray-600 mb-4">
                Choose a convenient time slot for either a video consultation or in-person visit. Secure your appointment with easy online payment.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center card-hover">
              <div className="bg-healthcare-light w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6">
                <svg className="w-8 h-8 text-healthcare-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect with the Doctor</h3>
              <p className="text-gray-600 mb-4">
                Attend your video consultation through our secure platform or visit the doctor's office. Receive follow-ups and prescriptions digitally.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/how-it-works">
              <Button variant="outline" className="border-healthcare-primary text-healthcare-primary hover:bg-healthcare-light">
                Learn More About Our Process
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Our Medical Specialties</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Connect with specialists across all medical fields to address your specific healthcare needs
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((specialty) => (
              <SpecialtyCard
                key={specialty.name}
                name={specialty.name}
                icon={specialty.icon}
                color={specialty.color}
                href={specialty.href}
              />
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/find-doctors">
              <Button className="bg-healthcare-primary text-white hover:bg-healthcare-dark">
                View All Specialties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="italic mb-4 text-gray-600">
                  "I was able to get a second opinion from a top cardiologist within 48 hours. The video consultation was clear and professional, and I received my report the same day."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <h4 className="font-semibold">Marieke van der Berg</h4>
                    <p className="text-sm text-gray-600">Amsterdam</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 2 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="italic mb-4 text-gray-600">
                  "As an expat, finding English-speaking specialists was always a challenge. Med Connecter made it easy to find doctors who speak my language and accept my insurance."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <h4 className="font-semibold">David Johnson</h4>
                    <p className="text-sm text-gray-600">Utrecht</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 3 */}
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="italic mb-4 text-gray-600">
                  "As a healthcare provider, this platform has helped me reach more patients and efficiently manage my calendar. The video consultation tools are secure and reliable."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <h4 className="font-semibold">Dr. Loes de Vries</h4>
                    <p className="text-sm text-gray-600">Dermatologist, Rotterdam</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-healthcare-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Connect with Top Specialists?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of patients across the Netherlands who are taking control of their healthcare journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/find-doctors">
              <Button className="bg-white text-healthcare-primary hover:bg-gray-100 font-medium text-lg px-8 py-6">
                Find Specialists
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-healthcare-primary font-medium text-lg px-8 py-6">
                Create Your Account
              </Button>

            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
