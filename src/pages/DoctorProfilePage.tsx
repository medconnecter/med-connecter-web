
import { useState, useEffect} from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from '@/components/layout/Layout';
import { API_BASE_URL } from '@/lib/utils';


const mapBackendDoctorToProfile = (doc: any) => {
  return {
    id: doc._id || doc.id,
    name: `${doc.userId?.firstName || doc.firstName} ${doc.userId?.lastName || doc.lastName}`,
    specialty: doc.specializations?.join(', ') || "General Specialist",
    hospital: doc.clinicLocation?.address || "Private Clinic",
    education: doc.education || [],
    experience: doc.experience || 0,
    bio: doc.about || 'No bio available',
    rating: doc.rating || 0,
    reviewCount: doc.totalReviews || 0,
    languages: doc.languages?.length ? doc.languages : ["Dutch"],
    availableToday: true, // This would need to be calculated based on current day
    consultationFee: doc.consultationFee || 0,
    photoUrl: doc.profilePhoto || "https://randomuser.me/api/portraits/lego/1.jpg",
    verified: doc.status === "VERIFIED",
    gender: doc.userId?.gender || doc.gender || null,
    location: doc.clinicLocation || {
      address: 'Address not available',
      city: 'City not available',
      postcode: 'Postcode not available'
    },
    specializations: doc.specializations || [],
    services: doc.services || [],
    awards: doc.awards || [],
    publications: doc.publications || [],
    availableDays: doc.availability?.map((a: any) => a.day) || [],
    timeSlots: doc.availability?.reduce((acc: any, a: any) => {
      acc[a.day] = a.slots?.map((slot: any) => slot.startTime) || [];
      return acc;
    }, {}) || {},
    reviews: [], // Reviews would need to be fetched separately
  };
};

// Mock doctor data
const mockDoctors = [
  {
    id: '1',
    name: 'Dr. Anna de Vries',
    specialty: 'Cardiologist',
    hospital: 'Amsterdam University Medical Center',
    education: [
      { degree: 'MD', institution: 'University of Amsterdam', year: '2005' },
      { degree: 'PhD in Cardiology', institution: 'Erasmus University Rotterdam', year: '2009' }
    ],
    experience: '15+ years',
    bio: 'Dr. Anna de Vries is a senior cardiologist with over 15 years of experience in treating complex heart conditions. She specializes in preventive cardiology, heart failure management, and cardiac rehabilitation. Dr. de Vries is known for her compassionate patient care and has received multiple awards for her contribution to cardiovascular research.',
    rating: 4.8,
    reviewCount: 124,
    languages: ['Dutch', 'English', 'German'],
    availableToday: true,
    consultationFee: 80,
    photoUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
    verified: true,
    gender: 'female',
    location: {
      address: 'Meibergdreef 9',
      city: 'Amsterdam',
      postcode: '1105 AZ',
      coordinates: { lat: 52.3080, lng: 4.8974 }
    },
    specializations: [
      'Coronary Artery Disease',
      'Heart Failure',
      'Cardiac Rehabilitation',
      'Preventive Cardiology',
      'Echocardiography'
    ],
    services: [
      'Cardiac Consultation',
      'ECG Analysis',
      'Exercise Stress Test',
      'Heart Monitoring',
      'Cholesterol Management'
    ],
    awards: [
      { title: 'Excellence in Cardiology Research', year: '2018' },
      { title: 'Best Medical Professional', organization: 'Amsterdam Medical Society', year: '2016' }
    ],
    publications: [
      { title: 'New Approaches to Heart Failure Management', journal: 'European Heart Journal', year: '2019' },
      { title: 'Long-term Effects of Cardiovascular Rehabilitation', journal: 'Journal of Cardiology', year: '2017' }
    ],
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    timeSlots: {
      'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Tuesday': ['10:00', '11:00', '13:00', '14:00'],
      'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Friday': ['10:00', '11:00', '13:00', '14:00']
    },
    reviews: [
      { id: '1', patientName: 'Joost Bakker', rating: 5, date: '2025-04-25', comment: 'Dr. de Vries was incredibly thorough in explaining my condition and treatment options. She made me feel comfortable and heard. Highly recommend!' },
      { id: '2', patientName: 'Marieke van Dam', rating: 5, date: '2025-04-15', comment: 'Excellent doctor who takes time to answer all questions. Very knowledgeable and compassionate.' },
      { id: '3', patientName: 'Thomas Visser', rating: 4, date: '2025-03-28', comment: 'Professional and thorough examination. Office was busy but the care was excellent.' }
    ]
  },
  // Add more mock doctors here
];

const DoctorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  // Find the doctor based on the URL param
  // const doctor = mockDoctors.find((doc) => doc.id === id);
  
  // If doctor not found
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctor data from localStorage or API
  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // First try to get from localStorage (from FindDoctorsPage)
        const storedDoctors = localStorage.getItem('medconnecter_doctors');
        
        if (storedDoctors) {
          const doctors = JSON.parse(storedDoctors);
          const foundDoctor = doctors.find((doc: any) => doc.id === id);
          
          if (foundDoctor && foundDoctor.backendData) {
            // Use the stored backend data to create profile
            const doctorData = mapBackendDoctorToProfile(foundDoctor.backendData);
            setDoctor(doctorData);
            setLoading(false);
            return;
          }
        }
        
        // If not found in localStorage, try to fetch from API
        const response = await fetch(`${API_BASE_URL}/api/v1/doctors/getById?id=${id}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            const doctorData = mapBackendDoctorToProfile(data.doctor);
            setDoctor(doctorData);
          } else {
            throw new Error(data.message || 'Failed to fetch doctor data');
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
        setError('Failed to load doctor profile. Please try again later.');
        
        // Fallback to mock data if server fails
        const mockDoctor = mockDoctors.find(doc => doc.id === id);
        if (mockDoctor) {
          setDoctor(mockDoctor);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <p>Loading doctor profile...</p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error && !doctor) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/find-doctors">
            <Button className="bg-healthcare-primary hover:bg-healthcare-dark">
              Return to Doctor Search
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Doctor not found
  if (!doctor) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Doctor Not Found</h2>
          <p className="text-gray-600 mb-6">The doctor you are looking for does not exist or may have been removed.</p>
          <Link to="/find-doctors">
            <Button className="bg-healthcare-primary hover:bg-healthcare-dark">
              Return to Doctor Search
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  // Function to get available days with dates
  const getAvailableDays = () => {
    const days = doctor.availableDays || [];
    const today = new Date();
    const availableDaysWithDates: { name: string; date: Date; formattedDate: string }[] = [];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (days.includes(dayName)) {
        availableDaysWithDates.push({
          name: dayName,
          date,
          formattedDate: date.toLocaleDateString('en-NL', { day: 'numeric', month: 'short' })
        });
      }
    }
    
    return availableDaysWithDates;
  };
  
  const availableDaysWithDates = getAvailableDays();

  return (
    <Layout>
      {/* Doctor Profile Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            {/* Doctor Photo & Basic Info */}
            <div className="md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-start mb-6 md:mb-0">
              <Avatar className="h-36 w-36 border-4 border-gray-100">
                <AvatarImage src={doctor.photoUrl} />
                <AvatarFallback className="bg-healthcare-primary text-white text-4xl">
                  {doctor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {doctor.verified && (
                <Badge className="mt-4 bg-healthcare-primary">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Verified
                </Badge>
              )}
              
              <div className="flex items-center mt-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">{doctor.rating} ({doctor.reviewCount} reviews)</span>
              </div>
            </div>
            
            {/* Doctor Info */}
            <div className="md:w-2/3 lg:w-2/4 md:px-6">
              <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
              <p className="text-xl text-gray-600 mb-3">{doctor.specialty}</p>
              
              <p className="text-gray-600 mb-4">
                <svg className="w-5 h-5 inline-block mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                {doctor.hospital}
              </p>
              
              <div className="mb-4">
                <p className="font-medium mb-2">Languages:</p>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((language: string) => (
                    <Badge key={language} variant="outline" className="bg-gray-100">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-bold">{doctor.experience}</p>
                </div>
                <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                  <p className="font-bold">€{doctor.consultationFee}</p>
                </div>
                {doctor.availableToday && (
                  <div className="text-center px-4 py-2 bg-green-100 rounded-lg">
                    <p className="font-medium text-green-800">Available Today</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Book Appointment */}
            <div className="md:w-1/3 lg:w-1/4 mt-6 md:mt-0">
              <div className="bg-gray-50 p-6 rounded-lg border shadow-sm">
                <h3 className="font-bold text-lg mb-4">Book Appointment</h3>
                
                {/* Visit Type */}
                <div className="mb-4">
                  <p className="font-medium text-sm mb-2">Visit Type:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      Video Call
                    </Button>
                    <Button variant="outline" className="w-full justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      In-Person
                    </Button>
                  </div>
                </div>
                
                <Link to={`/book-appointment/${doctor.id}`}>
                  <Button className="w-full bg-healthcare-primary hover:bg-healthcare-dark">
                    Book Appointment
                  </Button>
                </Link>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  Same-day appointments usually available
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Profile Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="about">
            <TabsList className="mb-8 bg-white">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="expertise">Expertise</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">About {doctor.name}</h2>
                <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Education & Training</h2>
                <div className="space-y-4">
                  {doctor.education.map((edu: any, index: number) => (
                    <div key={index} className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-healthcare-light flex items-center justify-center">
                          <svg className="w-5 h-5 text-healthcare-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}, {edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {doctor.awards && doctor.awards.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Awards & Recognition</h2>
                  <div className="space-y-4">
                    {doctor.awards.map((award: any, index: number) => (
                      <div key={index} className="flex">
                        <div className="mr-4 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{award.title}</h3>
                          <p className="text-gray-600">
                            {award.organization ? `${award.organization}, ` : ''}{award.year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {doctor.publications && doctor.publications.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Publications</h2>
                  <div className="space-y-4">
                    {doctor.publications.map((pub: any, index: number) => (
                      <div key={index} className="flex">
                        <div className="mr-4 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-healthcare-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{pub.title}</h3>
                          <p className="text-gray-600">{pub.journal}, {pub.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="expertise" className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Specializations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {doctor.specializations?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {doctor.services?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-healthcare-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Patient Reviews</h2>
                
                <div className="mb-8">
                  <div className="flex items-center mb-2">
                    <div className="flex mr-4">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-8 h-8 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-xl">{doctor.rating} out of 5</p>
                      <p className="text-gray-600">{doctor.reviewCount} patient reviews</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {doctor.reviews?.map((review: any) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">{review.patientName}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(review.date).toLocaleDateString('en-NL', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button variant="outline">Load More Reviews</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="availability" className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Book an Appointment</h2>
                
                <div className="mb-8">
                  <h3 className="font-medium mb-4">Select Date</h3>
                  <div className="flex flex-wrap gap-3">
                    {availableDaysWithDates.slice(0, 7).map((day, index) => (
                      <Button
                        key={index}
                        variant={selectedDate === day.formattedDate ? "default" : "outline"}
                        className={`min-w-[100px] ${selectedDate === day.formattedDate ? 'bg-healthcare-primary' : ''}`}
                        onClick={() => setSelectedDate(day.formattedDate)}
                      >
                        <div className="text-center">
                          <div className="text-xs">{day.name.substring(0, 3)}</div>
                          <div className="text-lg font-semibold">{day.formattedDate}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
                
                {selectedDate && (
                  <div className="mb-8">
                    <h3 className="font-medium mb-4">Select Time Slot</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {doctor.availableDays.map((day: any) => {
                        const dayName = day;
                        return (doctor.timeSlots as any)[dayName]?.map((time: string, index: number) => (
                          <Button
                            key={index}
                            variant={selectedTimeSlot === time ? "default" : "outline"}
                            className={selectedTimeSlot === time ? 'bg-healthcare-primary' : ''}
                            onClick={() => setSelectedTimeSlot(time)}
                          >
                            {time}
                          </Button>
                        ));
                      })[0]}
                    </div>
                  </div>
                )}
                
                {selectedDate && selectedTimeSlot && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Appointment Summary</h3>
                      <div className="space-y-1">
                        <p className="text-gray-600">
                          <span className="font-medium">Doctor:</span> {doctor.name}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Date:</span> {selectedDate}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Time:</span> {selectedTimeSlot}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Fee:</span> €{doctor.consultationFee}
                        </p>
                      </div>
                    </div>
                    
                    <Link to={`/book-appointment/${doctor.id}?date=${selectedDate}&time=${selectedTimeSlot}`}>
                      <Button className="w-full bg-healthcare-primary hover:bg-healthcare-dark">
                        Confirm Appointment
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* <TabsContent value="location" className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Practice Location</h2>
                
                <div className="mb-6">
                  <div className="flex items-start mb-4">
                    <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <div>
                      <p className="font-medium">{doctor.hospital}</p>
                      <p className="text-gray-600">{doctor.location?.address}</p>
                      <p className="text-gray-600">{doctor.location?.postcode} {doctor.location?.city}</p>
                    </div>
                  </div>
                </div>
                
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${doctor.location?.coordinates.lng},${doctor.location?.coordinates.lat},13,0/600x400?access_token=pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsOTh0cmR0MTBzcXkzdnA1eDJtcjZ2eXkifQ.AuR12gRUTS14UQvxPzFFPQ`}
                    alt="Map showing the location of the doctor's practice"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">
                    Click for navigation options
                  </p>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.location?.coordinates.lat},${doctor.location?.coordinates.lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-healthcare-primary hover:text-healthcare-dark text-sm flex items-center"
                  >
                    Get Directions
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </TabsContent> */}
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-healthcare-light py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Book Your Appointment?</h2>
          <div className="flex justify-center space-x-4">
            <Link to={`/book-appointment/${doctor.id}`}>
              <Button className="bg-healthcare-primary hover:bg-healthcare-dark text-lg px-8">
                Book Now
              </Button>
            </Link>
            <Button variant="outline" className="border-healthcare-primary text-healthcare-primary hover:bg-healthcare-light text-lg px-8">
              Contact Office
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DoctorProfilePage;
