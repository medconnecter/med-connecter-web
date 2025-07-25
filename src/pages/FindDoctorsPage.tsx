
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DoctorCard from '@/components/doctors/DoctorCard';
import DoctorSearchFilter from '@/components/doctors/DoctorSearchFilter';
import Layout from '@/components/layout/Layout';

// Helper to map backend doctor object to frontend format
const mapBackendDoctorToFrontend = (doc: any) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return {
    id: doc._id,
    name: doc.userId.firstName + " " + doc.userId.lastName,
    specialty: doc.specializations?.join(', ') || "General Specialist",
    hospital: doc.clinicLocation?.address || "Private Clinic",
    rating: doc.rating || 0,
    reviewCount: doc.totalReviews || 0,
    languages: doc.languages?.length ? doc.languages : ["Dutch"], // fallback
    availableToday: (doc.availability || []).some((a: any) => a.day.toLowerCase() === today),
    consultationFee: doc.consultationFee || 0,
    photoUrl: "https://randomuser.me/api/portraits/lego/1.jpg", // Default avatar
    verified: doc.status === "VERIFIED",
    gender: null,
  };
};

// Mock doctor data
const mockDoctors = [
  {
    id: '1',
    name: 'Dr. Anna de Vries',
    specialty: 'Cardiologist',
    hospital: 'Amsterdam University Medical Center',
    rating: 4.8,
    reviewCount: 124,
    languages: ['Dutch', 'English', 'German'],
    availableToday: true,
    consultationFee: 80,
    photoUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
    verified: true,
    gender: 'female',
  },
  {
    id: '2',
    name: 'Dr. Jan van der Berg',
    specialty: 'Neurologist',
    hospital: 'Erasmus Medical Center',
    rating: 4.6,
    reviewCount: 98,
    languages: ['Dutch', 'English'],
    availableToday: false,
    consultationFee: 95,
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    verified: true,
    gender: 'male',
  },
  {
    id: '3',
    name: 'Dr. Sophie Jansen',
    specialty: 'Dermatologist',
    hospital: 'University Medical Center Utrecht',
    rating: 4.9,
    reviewCount: 156,
    languages: ['Dutch', 'English', 'French'],
    availableToday: true,
    consultationFee: 75,
    photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    verified: true,
    gender: 'female',
  },
  {
    id: '4',
    name: 'Dr. Thomas de Groot',
    specialty: 'Orthopedic Surgeon',
    hospital: 'Leiden University Medical Center',
    rating: 4.7,
    reviewCount: 112,
    languages: ['Dutch', 'English'],
    availableToday: false,
    consultationFee: 110,
    photoUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
    verified: true,
    gender: 'male',
  },
  {
    id: '5',
    name: 'Dr. Maria Kuiper',
    specialty: 'Endocrinologist',
    hospital: 'Maastricht University Medical Center',
    rating: 4.5,
    reviewCount: 89,
    languages: ['Dutch', 'English', 'Spanish'],
    availableToday: true,
    consultationFee: 85,
    photoUrl: 'https://randomuser.me/api/portraits/women/26.jpg',
    verified: false,
    gender: 'female',
  },
  {
    id: '6',
    name: 'Dr. Peter van Dijk',
    specialty: 'Psychiatrist',
    hospital: 'Amsterdam University Medical Center',
    rating: 4.4,
    reviewCount: 76,
    languages: ['Dutch', 'English', 'German'],
    availableToday: true,
    consultationFee: 95,
    photoUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
    verified: true,
    gender: 'male',
  },
];

const FindDoctorsPage = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [doctors, setDoctors] = useState(mockDoctors);
  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchDoctorsFromBackend();
  }, []);
  // Effect to filter doctors based on URL search params on page load
  useEffect(() => {
    const specialty = searchParams.get('specialty');
    if (specialty) {
      handleFilterChange({ specialty });
    }
  }, [searchParams]);

  // Handle filter change
  const handleFilterChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    
    let results = [...mockDoctors];
    
    // Apply filters
    if (filters.specialty) {
      results = results.filter(doctor => 
        doctor.specialty.toLowerCase().includes(filters.specialty.toLowerCase())
      );
    }
    
    if (filters.languages && filters.languages.length > 0) {
      results = results.filter(doctor => 
        filters.languages.some((lang: string) => doctor.languages.includes(lang))
      );
    }
    
    if (filters.gender) {
      results = results.filter(doctor => doctor.gender === filters.gender);
    }
    
    if (filters.availability === 'today') {
      results = results.filter(doctor => doctor.availableToday);
    }
    
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      results = results.filter(doctor => doctor.rating >= minRating);
    }
    
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      results = results.filter(doctor => 
        doctor.consultationFee >= min && doctor.consultationFee <= max
      );
    }
    
    if (filters.verifiedOnly) {
      results = results.filter(doctor => doctor.verified);
    }
    
    // Apply search term
    if (searchTerm) {
      results = results.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    results = sortDoctors(results, sortBy);
    
    setFilteredDoctors(results);
  };

  // Handle search
  const handleSearch = () => {
    handleFilterChange(activeFilters);
  };

  // Sort doctors based on selected option
  const sortDoctors = (doctors: typeof mockDoctors, sortMethod: string) => {
    switch (sortMethod) {
      case 'rating':
        return [...doctors].sort((a, b) => b.rating - a.rating);
      case 'price_low':
        return [...doctors].sort((a, b) => a.consultationFee - b.consultationFee);
      case 'price_high':
        return [...doctors].sort((a, b) => b.consultationFee - a.consultationFee);
      case 'relevance':
      default:
        // Relevance prioritizes verified docs, then availability, then rating
        return [...doctors].sort((a, b) => {
          // First by verified status
          if (a.verified !== b.verified) return a.verified ? -1 : 1;
          // Then by availability
          if (a.availableToday !== b.availableToday) return a.availableToday ? -1 : 1;
          // Then by rating
          return b.rating - a.rating;
        });
    }
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setFilteredDoctors(sortDoctors(filteredDoctors, value));
  };

    // Fetch from backend API and append to current list
    const fetchDoctorsFromBackend = async () => {
      try {
        const response = await fetch('http://localhost:8085/api/v1/doctors?page=1&limit=10');
        const data = await response.json();
  
        const newDoctors = data.doctors.map(mapBackendDoctorToFrontend);
        const updatedDoctors = [...doctors, ...newDoctors];
  
        setDoctors(updatedDoctors);
        const updatedFiltered = sortDoctors(updatedDoctors, sortBy);
        setFilteredDoctors(updatedFiltered);
      } catch (error) {
        console.error("Failed to fetch backend doctors:", error);
      }
    };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-healthcare-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Find the Right Specialist</h1>
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                className="bg-white text-gray-800"
                placeholder="Search by doctor name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                onClick={handleSearch}
                className="bg-white text-healthcare-primary hover:bg-gray-100 whitespace-nowrap"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Filter Results</h2>
                <DoctorSearchFilter onFilterChange={handleFilterChange} />
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:w-3/4">
              {/* Results header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-xl font-semibold mb-2 md:mb-0">
                  {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} found
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select
                    className="border rounded-md px-3 py-1 text-sm"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rating</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Doctor Cards */}
              <div className="space-y-6">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <DoctorCard key={doctor.id} {...doctor} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="text-lg font-medium mb-2">No doctors match your search criteria</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      setSortBy('relevance');
                      handleFilterChange({});
                    }}>
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FindDoctorsPage;
