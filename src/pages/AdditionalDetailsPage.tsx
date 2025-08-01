import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/utils';

const sleekInput = 'border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-healthcare-primary';
const sectionTitle = 'text-base font-semibold mb-1 mt-4 text-healthcare-primary';
const sectionDivider = 'border-b border-gray-200 my-2';

const defaultForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  languages: '',
  profilePhoto: null as File | null,
  profession: '',
  bigNumber: '',
  registry: '',
  workExperience: '',
  chamberOfCommerce: '',
  iban: '',
  vat: '',
  availabilityDay: '',
  availabilityStart: '',
  availabilityEnd: '',
  consultationRate: '',
  educationDegree: '',
  educationInstitution: '',
  educationYear: '',
  trainingName: '',
  trainingInstitution: '',
  trainingYear: '',
  awardName: '',
  awardYear: '',
  publicationTitle: '',
  publicationJournal: '',
  publicationYear: '',
  publicationUrl: '',
  serviceName: '',
  serviceDescription: '',
  servicePrice: '',
  hasInsurance: '',
  insurancePolicy: '',
  insuranceInsurer: '',
  insuranceFile: null as File | null,
  vogAvailable: '',
  vogFile: null as File | null,
  consentInfoCorrect: false,
  consentTerms: false,
  consentProfileVisible: false,
  placeAndDate: '',
  about: '',
};

const AdditionalDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Prefill from user profile if available
  useEffect(() => {
    const profile = location.state?.profile;
    if (profile) {
      setForm(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone?.number || profile.phone || '',
        gender: profile.gender || '',
        dateOfBirth: profile.dob || profile.dateOfBirth || '',
        address: profile.address?.street || profile.address || '',
        city: profile.address?.city || profile.city || '',
        postalCode: profile.address?.postalCode || profile.postalCode || '',
        languages: Array.isArray(profile.languages) ? profile.languages.join(', ') : (profile.languages || ''),
        about: profile.about || '',
        // Add more mappings as needed
      }));
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked, files } = e.target as any;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file (PNG, JPG, GIF)');
          return;
        }
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert('File size must be less than 10MB');
          return;
        }
        setForm(prev => ({ ...prev, [name]: file }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that profile photo is uploaded
    if (!form.profilePhoto) {
      alert('Please upload a profile picture. This is required to complete your registration.');
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Upload profile photo (mandatory)
      // setUploadingPhoto(true);
      // const photoFormData = new FormData();
      // photoFormData.append('picture', form.profilePhoto, form.profilePhoto.name);
      
      // const photoResponse = await fetch(`${API_BASE_URL}/api/v1/users/profile/picture`, {
      //   method: 'POST',
      //   headers: {
      //     'accept': '*/*',
      //     'Authorization': `Bearer ${token}`,
      //     // Don't set Content-Type for FormData, let browser set it with boundary
      //   },
      //   body: photoFormData,
      // });
      
      // if (!photoResponse.ok) {
      //   const photoError = await photoResponse.json();
      //   console.error('Failed to upload profile photo:', photoError);
      //   alert('Failed to upload profile photo. Please try again.');
      //   setSubmitting(false);
      //   setUploadingPhoto(false);
      //   return;
      // }
      
      // console.log('Profile photo uploaded successfully');
      // setUploadingPhoto(false);
      
      // Transform form data to API structure
      const payload = {
        registrationNumber: form.bigNumber,
        specializations: form.profession ? [form.profession] : [],
        experience: Number(form.workExperience) || 0,
        consultationFee: Number(form.consultationRate) || 0,
        currency: 'EUR',
        about: form.about,
        education: form.educationDegree ? [{
          degree: form.educationDegree,
          institution: form.educationInstitution,
          year: Number(form.educationYear) || 0,
        }] : [],
        training: form.trainingName ? [{
          name: form.trainingName,
          institution: form.trainingInstitution,
          year: Number(form.trainingYear) || 0,
        }] : [],
        awards: form.awardName ? [{
          name: form.awardName,
          year: Number(form.awardYear) || 0,
        }] : [],
        publications: form.publicationTitle ? [{
          title: form.publicationTitle,
          journal: form.publicationJournal,
          year: Number(form.publicationYear) || 0,
          url: form.publicationUrl,
        }] : [],
        services: form.serviceName ? [{
          name: form.serviceName,
          description: form.serviceDescription,
          price: Number(form.servicePrice) || 0,
        }] : [],
        clinicLocation: {
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: 'Netherlands',
        },
        availability: (form.availabilityDay && form.availabilityStart && form.availabilityEnd) ? [{
          day: form.availabilityDay,
          slots: [{
            startTime: form.availabilityStart,
            endTime: form.availabilityEnd,
          }],
        }] : [],
        professionalRegistry: form.registry,
        chamberOfCommerceNumber: form.chamberOfCommerce,
        iban: form.iban,
        vatNumber: form.vat,
        hasLiabilityInsurance: form.hasInsurance === 'yes',
        liabilityInsurancePolicyNumber: form.insurancePolicy,
        liabilityInsuranceInsurer: form.insuranceInsurer,
        liabilityInsuranceDocument: '',
        hasCertificateOfConduct: form.vogAvailable === 'yes',
        certificateOfConductDocument: '',
      };
      
      const response = await fetch(`${API_BASE_URL}/api/v1/doctors/profile`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile updated successfully:', data);
        setSubmitting(false);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        console.error('Failed to update profile:', errorData);
        alert('Failed to save details. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      setSubmitting(false);
      alert('Failed to save details.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Additional Details</h1>
          <p className="text-gray-600 mb-6">Please provide additional information to complete your doctor profile.</p>
          
          {/* Prefilled data indicator */}
          {location.state?.fromMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-blue-800 font-medium">
                  Some fields have been prefilled from your registration data. You can modify them if needed.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className={sectionTitle}>Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                    {location.state?.fromMessage && form.firstName && (
                      <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className={sleekInput}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                    {location.state?.fromMessage && form.lastName && (
                      <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className={sleekInput}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                    {location.state?.fromMessage && form.email && (
                      <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                    )}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={sleekInput}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                    {location.state?.fromMessage && form.phone && (
                      <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                    )}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={sleekInput}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                    {location.state?.fromMessage && form.dateOfBirth && (
                      <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className={sleekInput}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                    {location.state?.fromMessage && form.gender && (
                      <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                    )}
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={sleekInput}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div>
              <h2 className={sectionTitle}>Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                    {location.state?.fromMessage && form.address && (
                      <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={sleekInput}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                    {location.state?.fromMessage && form.city && (
                      <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={sleekInput}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                    {location.state?.fromMessage && form.postalCode && (
                      <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    className={sleekInput}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className={sectionTitle}>Languages Spoken</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages (comma separated)
                  {location.state?.fromMessage && form.languages && (
                    <span className="ml-1 text-xs text-blue-600">(prefilled)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="languages"
                  value={form.languages}
                  onChange={handleChange}
                  placeholder="e.g., Dutch, English, German"
                  className={sleekInput}
                  required
                />
              </div>
            </div>

            {/* Profile Picture Upload */}
            {/* <div>
              <h2 className={sectionTitle}>Profile Picture <span className="text-red-500">*</span></h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Profile Picture <span className="text-red-500">(Required)</span>
                </label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                    !form.profilePhoto 
                      ? 'border-red-300 bg-red-50 hover:border-red-400' 
                      : 'border-gray-300 hover:border-healthcare-primary'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-healthcare-primary', 'bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-healthcare-primary', 'bg-blue-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-healthcare-primary', 'bg-blue-50');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const file = files[0];
                      if (file.type.startsWith('image/')) {
                        if (file.size <= 10 * 1024 * 1024) {
                          setForm(prev => ({ ...prev, profilePhoto: file }));
                        } else {
                          alert('File size must be less than 10MB');
                        }
                      } else {
                        alert('Please select an image file (PNG, JPG, GIF)');
                      }
                    }
                  }}
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className={`mx-auto h-12 w-12 ${!form.profilePhoto ? 'text-red-400' : 'text-gray-400'}`}
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="profilePhoto"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-healthcare-primary hover:text-healthcare-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-healthcare-primary"
                      >
                        <span>Upload a file</span>
                        <input
                          id="profilePhoto"
                          name="profilePhoto"
                          type="file"
                          accept="image/*"
                          onChange={handleChange}
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    {!form.profilePhoto && (
                      <p className="text-xs text-red-500 font-medium">Profile picture is required</p>
                    )}
                  </div>
                </div>
                {form.profilePhoto && (
                  <div className="mt-3 flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={URL.createObjectURL(form.profilePhoto)}
                        alt="Profile preview"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {form.profilePhoto.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(form.profilePhoto.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadingPhoto && (
                        <p className="text-xs text-blue-600">Uploading...</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, profilePhoto: null }))}
                      className="flex-shrink-0 text-red-500 hover:text-red-700"
                      disabled={uploadingPhoto}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div> */}

            <div className={sectionDivider} />
            <section>
              <h2 className={sectionTitle}>Professional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input name="profession" placeholder="Profession / Specialization" value={form.profession} onChange={handleChange} className={sleekInput} required />
                <Input name="bigNumber" placeholder="BIG registration number" value={form.bigNumber} onChange={handleChange} className={sleekInput} />
                <Input name="registry" placeholder="Professional registry or association" value={form.registry} onChange={handleChange} className={sleekInput} />
                <Input name="workExperience" placeholder="Work experience (years)" value={form.workExperience} onChange={handleChange} className={sleekInput} />
              </div>
            </section>
            <div className={sectionDivider} />
            <section>
              <h2 className={sectionTitle}>Registration Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input name="chamberOfCommerce" placeholder="Chamber of Commerce number" value={form.chamberOfCommerce} onChange={handleChange} className={sleekInput} />
                <Input name="iban" placeholder="IBAN for payments" value={form.iban} onChange={handleChange} className={sleekInput} required />
                <Input name="vat" placeholder="VAT number" value={form.vat} onChange={handleChange} className={sleekInput} />
                <Input name="availabilityDay" placeholder="Availability Day" value={form.availabilityDay} onChange={handleChange} className={sleekInput} required />
                <Input name="availabilityStart" placeholder="Availability Start (HH:MM)" value={form.availabilityStart} onChange={handleChange} className={sleekInput} required />
                <Input name="availabilityEnd" placeholder="Availability End (HH:MM)" value={form.availabilityEnd} onChange={handleChange} className={sleekInput} required />
                <Input name="consultationRate" placeholder="Consultation rate (per 15/30/60 min)" value={form.consultationRate} onChange={handleChange} className={sleekInput} />
              </div>
            </section>
            <div className={sectionDivider} />
            <section>
              <h2 className={sectionTitle}>Education and Training</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input name="educationDegree" placeholder="Degree" value={form.educationDegree} onChange={handleChange} className={sleekInput} />
                <Input name="educationInstitution" placeholder="Institution" value={form.educationInstitution} onChange={handleChange} className={sleekInput} />
                <Input name="educationYear" placeholder="Year" value={form.educationYear} onChange={handleChange} className={sleekInput} />
                <Input name="trainingName" placeholder="Training Name" value={form.trainingName} onChange={handleChange} className={sleekInput} />
                <Input name="trainingInstitution" placeholder="Institution" value={form.trainingInstitution} onChange={handleChange} className={sleekInput} />
                <Input name="trainingYear" placeholder="Year" value={form.trainingYear} onChange={handleChange} className={sleekInput} />
              </div>
            </section>
            <div className={sectionDivider} />
            <section>
              <h2 className={sectionTitle}>Awards and Publications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input name="awardName" placeholder="Award Name" value={form.awardName} onChange={handleChange} className={sleekInput} />
                <Input name="awardYear" placeholder="Year" value={form.awardYear} onChange={handleChange} className={sleekInput} />
                <Input name="publicationTitle" placeholder="Publication Title" value={form.publicationTitle} onChange={handleChange} className={sleekInput} />
                <Input name="publicationJournal" placeholder="Journal" value={form.publicationJournal} onChange={handleChange} className={sleekInput} />
                <Input name="publicationYear" placeholder="Year" value={form.publicationYear} onChange={handleChange} className={sleekInput} />
                <Input name="publicationUrl" placeholder="Publication URL" value={form.publicationUrl} onChange={handleChange} className={sleekInput} />
              </div>
            </section>
            <div className={sectionDivider} />
            <section>
              <h2 className={sectionTitle}>Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input name="serviceName" placeholder="Service Name" value={form.serviceName} onChange={handleChange} className={sleekInput} />
                <Input name="serviceDescription" placeholder="Service Description" value={form.serviceDescription} onChange={handleChange} className={sleekInput} />
                <Input name="servicePrice" placeholder="Service Price" value={form.servicePrice} onChange={handleChange} className={sleekInput} />
              </div>
            </section>
            <div className={sectionDivider} />
            <section>
              <h2 className={sectionTitle}>Insurance and Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Do you have valid professional liability insurance?</label>
                  <select name="hasInsurance" value={form.hasInsurance} onChange={handleChange} required className={sleekInput}>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <Input name="insurancePolicy" placeholder="Policy number and insurer" value={form.insurancePolicy} onChange={handleChange} className={sleekInput} />
                <div>
                  <label className="block mb-1">Upload copy of liability insurance:</label>
                  <Input name="insuranceFile" type="file" accept="application/pdf,image/*" onChange={handleChange} className={sleekInput} />
                </div>
                <div>
                  <label className="block mb-1">Certificate of conduct (VOG) available?</label>
                  <select name="vogAvailable" value={form.vogAvailable} onChange={handleChange} required className={sleekInput}>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Upload copy of VOG document:</label>
                  <Input name="vogFile" type="file" accept="application/pdf,image/*" onChange={handleChange} className={sleekInput} />
                </div>
              </div>
            </section>
            <div className={sectionDivider} />
            <section>
              <h2 className={sectionTitle}>Consent and Agreement</h2>
              <div className="space-y-2">
                <Input name="placeAndDate" placeholder="Place and date" value={form.placeAndDate} onChange={handleChange} className={sleekInput} required />
                <div className="flex items-center">
                  <input type="checkbox" name="consentInfoCorrect" checked={form.consentInfoCorrect} onChange={handleChange} className="mr-2" required />
                  <span>I declare that the above information is correct and up to date.</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="consentTerms" checked={form.consentTerms} onChange={handleChange} className="mr-2" required />
                  <span>I agree to the terms and conditions, privacy policy, processor agreement, and collaboration agreement of MedConnecter.</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="consentProfileVisible" checked={form.consentProfileVisible} onChange={handleChange} className="mr-2" />
                  <span>I give permission for my profile to be visible on the MedConnecter platform.</span>
                </div>
              </div>
            </section>
            <div className={sectionDivider} />
            <section>
              <h2 className={sectionTitle}>About</h2>
              <textarea
                name="about"
                placeholder="Summary about yourself, your approach, and your experience..."
                value={form.about}
                onChange={handleChange}
                className={sleekInput + ' min-h-[80px] w-full'}
                required
              />
            </section>
            {/* <Button 
              type="submit" 
              className="w-full bg-healthcare-primary hover:bg-healthcare-dark mt-2" 
              disabled={submitting || uploadingPhoto || !form.profilePhoto}
            >
              {
              !form.profilePhoto 
                ? 'Please upload a profile picture to continue' 
                : (submitting || uploadingPhoto) 
                  ? 'Saving...' 
                  : 'Save and Continue'
              }
            </Button> */}

          <Button type="submit" className="w-full bg-healthcare-primary hover:bg-healthcare-dark mt-2" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save and Continue'}
          </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdditionalDetailsPage; 