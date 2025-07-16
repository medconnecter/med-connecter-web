
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from '@/contexts/LanguageContext';

interface DoctorSearchFilterProps {
  onFilterChange: (filters: Record<string, any>) => void;
}

// Extended translations for doctor filter
const filterTranslations = {
  en: {
    specialty: "Specialty",
    allSpecialties: "All Specialties",
    consultationType: "Consultation Type",
    videoConsultation: "Video Consultation",
    inPersonVisit: "In-Person Visit",
    availability: "Availability",
    anyTime: "Any time",
    availableToday: "Available today",
    thisWeek: "This week",
    gender: "Gender",
    any: "Any",
    male: "Male",
    female: "Female",
    languages: "Languages",
    priceRange: "Price Range (€)",
    rating: "Rating",
    anyRating: "Any rating",
    verifiedDoctorsOnly: "Verified Doctors Only",
    showFilters: "Show Filters",
    hideFilters: "Hide Filters",
    resetAllFilters: "Reset All Filters"
  },
  nl: {
    specialty: "Specialisme",
    allSpecialties: "Alle Specialismen",
    consultationType: "Soort Consult",
    videoConsultation: "Video Consult",
    inPersonVisit: "Persoonlijk Bezoek",
    availability: "Beschikbaarheid",
    anyTime: "Alle tijden",
    availableToday: "Vandaag beschikbaar",
    thisWeek: "Deze week",
    gender: "Geslacht",
    any: "Alle",
    male: "Man",
    female: "Vrouw",
    languages: "Talen",
    priceRange: "Prijsbereik (€)",
    rating: "Beoordeling",
    anyRating: "Elke beoordeling",
    verifiedDoctorsOnly: "Alleen Geverifieerde Artsen",
    showFilters: "Toon Filters",
    hideFilters: "Verberg Filters",
    resetAllFilters: "Reset Alle Filters"
  }
};

// Mock specialties
const specialties = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology"
];

// Mock languages
const languages = [
  "Dutch",
  "English",
  "German",
  "French",
  "Spanish",
  "Arabic",
  "Turkish"
];

const DoctorSearchFilter = ({ onFilterChange }: DoctorSearchFilterProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { language } = useLanguage();
  
  // Get translations based on current language
  const t = filterTranslations[language as keyof typeof filterTranslations];
  
  // Set initial filter values from URL search params or defaults
  const [filters, setFilters] = useState({
    specialty: searchParams.get('specialty') || '',
    languages: searchParams.getAll('language') || [],
    gender: searchParams.get('gender') || 'any',
    availability: searchParams.get('availability') || 'any',
    priceRange: [0, 150],
    rating: searchParams.get('rating') || 'any',
    consultationType: searchParams.getAll('consultationType') || ['video', 'in-person'],
    verifiedOnly: searchParams.get('verified') === 'true',
  });

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Update URL search params
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (key === 'languages') {
      newSearchParams.delete('language');
      value.forEach((lang: string) => newSearchParams.append('language', lang));
    } else if (key === 'consultationType') {
      newSearchParams.delete('consultationType');
      value.forEach((type: string) => newSearchParams.append('consultationType', type));
    } else if (key === 'priceRange') {
      newSearchParams.set('minPrice', value[0].toString());
      newSearchParams.set('maxPrice', value[1].toString());
    } else if (value === '') {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, value.toString());
    }
    
    setSearchParams(newSearchParams);
  };

  // Toggle language selection
  const toggleLanguage = (language: string) => {
    const currentLanguages = [...filters.languages];
    if (currentLanguages.includes(language)) {
      handleFilterChange('languages', currentLanguages.filter(l => l !== language));
    } else {
      handleFilterChange('languages', [...currentLanguages, language]);
    }
  };

  // Toggle consultation type
  const toggleConsultationType = (type: string) => {
    const currentTypes = [...filters.consultationType];
    if (currentTypes.includes(type)) {
      if (currentTypes.length > 1) { // Don't allow removing all options
        handleFilterChange('consultationType', currentTypes.filter(t => t !== type));
      }
    } else {
      handleFilterChange('consultationType', [...currentTypes, type]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      specialty: '',
      languages: [],
      gender: 'any',
      availability: 'any',
      priceRange: [0, 150],
      rating: 'any',
      consultationType: ['video', 'in-person'],
      verifiedOnly: false,
    });
    setSearchParams({});
    onFilterChange({});
  };

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden mb-4">
        <Button 
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          variant="outline"
          className="w-full"
        >
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {mobileFiltersOpen ? t.hideFilters : t.showFilters}
        </Button>
      </div>

      {/* Filters section */}
      <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block space-y-8`}>
        {/* Reset filters button */}
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters} 
            className="text-healthcare-primary hover:text-healthcare-dark hover:bg-healthcare-light"
          >
            {t.resetAllFilters}
          </Button>
        </div>

        {/* Specialty Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">{t.specialty}</Label>
          <Select 
            value={filters.specialty} 
            onValueChange={(value) => handleFilterChange('specialty', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.specialty} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-specialties">{t.allSpecialties}</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty.toLowerCase()}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Consultation Type */}
        <div>
          <Label className="text-base font-medium mb-3 block">{t.consultationType}</Label>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="consultationType-video" 
                checked={filters.consultationType.includes('video')} 
                onCheckedChange={() => toggleConsultationType('video')}
              />
              <Label htmlFor="consultationType-video" className="ml-2 text-sm font-normal">
                {t.videoConsultation}
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="consultationType-in-person" 
                checked={filters.consultationType.includes('in-person')} 
                onCheckedChange={() => toggleConsultationType('in-person')}
              />
              <Label htmlFor="consultationType-in-person" className="ml-2 text-sm font-normal">
                {t.inPersonVisit}
              </Label>
            </div>
          </div>
        </div>

        {/* Availability Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">{t.availability}</Label>
          <RadioGroup 
            value={filters.availability} 
            onValueChange={(value) => handleFilterChange('availability', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="availability-any" />
              <Label htmlFor="availability-any" className="text-sm font-normal">{t.anyTime}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="today" id="availability-today" />
              <Label htmlFor="availability-today" className="text-sm font-normal">{t.availableToday}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="this-week" id="availability-week" />
              <Label htmlFor="availability-week" className="text-sm font-normal">{t.thisWeek}</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Gender Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">{t.gender}</Label>
          <RadioGroup 
            value={filters.gender} 
            onValueChange={(value) => handleFilterChange('gender', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="gender-any" />
              <Label htmlFor="gender-any" className="text-sm font-normal">{t.any}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <Label htmlFor="gender-male" className="text-sm font-normal">{t.male}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <Label htmlFor="gender-female" className="text-sm font-normal">{t.female}</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Language Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">{t.languages}</Label>
          <div className="space-y-2">
            {languages.map((lang) => (
              <div key={lang} className="flex items-center">
                <Checkbox 
                  id={`language-${lang}`}
                  checked={filters.languages.includes(lang)}
                  onCheckedChange={() => toggleLanguage(lang)}
                />
                <Label htmlFor={`language-${lang}`} className="ml-2 text-sm font-normal">
                  {lang}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="text-base font-medium">{t.priceRange}</Label>
            <div className="text-sm">
              €{filters.priceRange[0]} - €{filters.priceRange[1]}
            </div>
          </div>
          <Slider
            defaultValue={[0, 150]}
            min={0}
            max={300}
            step={10}
            value={filters.priceRange}
            onValueChange={(value) => handleFilterChange('priceRange', value)}
            className="py-4"
          />
        </div>

        {/* Rating Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">{t.rating}</Label>
          <RadioGroup 
            value={filters.rating} 
            onValueChange={(value) => handleFilterChange('rating', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="rating-any" />
              <Label htmlFor="rating-any" className="text-sm font-normal">{t.anyRating}</Label>
            </div>
            {[4, 3].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`} className="text-sm font-normal flex items-center">
                  {rating}+ 
                  <div className="flex ml-1">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Verified Filter */}
        <div>
          <div className="flex items-center">
            <Checkbox 
              id="verified-only"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => handleFilterChange('verifiedOnly', checked)}
            />
            <Label htmlFor="verified-only" className="ml-2 text-sm font-normal">
              {t.verifiedDoctorsOnly}
            </Label>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorSearchFilter;
