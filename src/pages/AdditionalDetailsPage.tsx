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

  // Prefill from user profile if available
  useEffect(() => {
    const profile = location.state?.profile;
    if (profile) {
      setForm(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
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
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
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
      const data = await response.json();
      setSubmitting(false);
      navigate('/dashboard');
    } catch (err) {
      setSubmitting(false);
      alert('Failed to save details.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl w-full space-y-4 overflow-auto text-sm">
        <h1 className="text-xl font-bold mb-2 text-center text-healthcare-primary">Additional Details</h1>
        <div className={sectionDivider} />
        <section>
          <h2 className={sectionTitle}>Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} className={sleekInput} required />
            <Input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} className={sleekInput} required />
            <Input name="dateOfBirth" type="date" placeholder="Date of birth" value={form.dateOfBirth} onChange={handleChange} className={sleekInput} required />
            <select name="gender" value={form.gender} onChange={handleChange} required className={sleekInput}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <Input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className={sleekInput} required />
            <Input name="email" placeholder="Email address" value={form.email} onChange={handleChange} className={sleekInput} required />
            <Input name="address" placeholder="Address" value={form.address} onChange={handleChange} className={sleekInput} required />
            <Input name="city" placeholder="City" value={form.city} onChange={handleChange} className={sleekInput} required />
            <Input name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange} className={sleekInput} required />
            <Input name="languages" placeholder="Languages spoken (comma separated)" value={form.languages} onChange={handleChange} className={sleekInput} required />
            <div>
              <label className="block mb-1">Upload profile photo:</label>
              <Input name="profilePhoto" type="file" accept="image/*" onChange={handleChange} className={sleekInput} />
            </div>
          </div>
        </section>
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
        <Button type="submit" className="w-full bg-healthcare-primary hover:bg-healthcare-dark mt-2" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save and Continue'}
        </Button>
      </form>
    </div>
  );
};

export default AdditionalDetailsPage; 