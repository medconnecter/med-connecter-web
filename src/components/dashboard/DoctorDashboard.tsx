
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Mock appointment data for doctor dashboard
const todayAppointments = [
  {
    id: 'appt-101',
    patientName: 'Maria van der Meer',
    time: '09:30',
    status: 'scheduled',
    patientImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    mode: 'video',
  },
  {
    id: 'appt-102',
    patientName: 'Pieter de Jong',
    time: '10:45',
    status: 'in-progress',
    patientImage: 'https://randomuser.me/api/portraits/men/42.jpg',
    mode: 'in-person',
  },
  {
    id: 'appt-103',
    patientName: 'Sofie Dijkstra',
    time: '13:15',
    status: 'scheduled',
    patientImage: 'https://randomuser.me/api/portraits/women/58.jpg',
    mode: 'video',
  },
];

const upcomingAppointments = [
  {
    id: 'appt-104',
    patientName: 'Willem Jansen',
    date: '2025-05-16',
    time: '11:00',
    status: 'scheduled',
    patientImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    mode: 'video',
  },
  {
    id: 'appt-105',
    patientName: 'Lisa Kuijpers',
    date: '2025-05-16',
    time: '14:30',
    status: 'scheduled',
    patientImage: 'https://randomuser.me/api/portraits/women/29.jpg',
    mode: 'in-person',
  },
  {
    id: 'appt-106',
    patientName: 'Thomas Visser',
    date: '2025-05-17',
    time: '09:15',
    status: 'scheduled',
    patientImage: 'https://randomuser.me/api/portraits/men/53.jpg',
    mode: 'video',
  },
];

// Mock statistics
const statistics = {
  todayAppointments: 3,
  pendingAppointments: 12,
  totalPatients: 158,
  completedConsultations: 47,
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [adminComments, setAdminComments] = useState<string | null>(null);
  
  // Schedule state
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'Monday', available: false, slots: [] },
    { day: 'Tuesday', available: false, slots: [] },
    { day: 'Wednesday', available: false, slots: [] },
    { day: 'Thursday', available: false, slots: [] },
    { day: 'Friday', available: false, slots: [] },
    { day: 'Saturday', available: false, slots: [] },
    { day: 'Sunday', available: false, slots: [] }
  ]);
  const [blockDates, setBlockDates] = useState<string[]>([]);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [blockDatesModal, setBlockDatesModal] = useState(false);
  const [selectedBlockDate, setSelectedBlockDate] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || user.role !== 'doctor') return;
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/api/v1/doctors/profile`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setDoctorProfile(data);
        
        // Store doctor profile data in localStorage for Header access
        if (data.success && data.doctor) {
          localStorage.setItem('medconnecter_doctor_profile', JSON.stringify({
            id: data.doctor._id || data.doctor.id,
            name: `${data.doctor.userId?.firstName || ''} ${data.doctor.userId?.lastName || ''}`.trim(),
            email: data.doctor.userId?.email || user.email,
            role: 'doctor'
          }));
        }
        
        setEditProfile({
          ...data.doctor,
          education: data.doctor.education || [],
          training: data.doctor.training || [],
          specializations: data.doctor.specializations || [],
          awards: data.doctor.awards || [],
          publications: data.doctor.publications || [],
          clinicLocation: data.doctor.clinicLocation || { address: '', city: '', postalCode: '', country: '' },
        });
      } catch (err) {
        setDoctorProfile(null);
        setEditProfile(null);
        // Clear stored profile on error
        localStorage.removeItem('medconnecter_doctor_profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    // Cleanup function to clear stored profile when component unmounts or user changes
    return () => {
      if (!user || user.role !== 'doctor') {
        localStorage.removeItem('medconnecter_doctor_profile');
      }
    };
  }, [user]);

  // Check for verification status messages
  useEffect(() => {
    const status = sessionStorage.getItem('doctor_verification_status');
    const comments = sessionStorage.getItem('doctor_verification_comments');
    if (status) {
      setVerificationStatus(status);
      if (status === 'rejected' && comments) {
        setAdminComments(comments);
      } else {
        setAdminComments(null);
      }
      // Clear after showing once
      sessionStorage.removeItem('doctor_verification_status');
      sessionStorage.removeItem('doctor_verification_comments');
    }
  }, []);

  const handleArrayChange = (field: string, index: number, subfield: string, value: string) => {
    setEditProfile((prev: any) => {
      const arr = [...(prev[field] || [])];
      arr[index] = { ...arr[index], [subfield]: value };
      return { ...prev, [field]: arr };
    });
  };

  const handleArrayAdd = (field: string, emptyObj: any) => {
    setEditProfile((prev: any) => ({ ...prev, [field]: [...(prev[field] || []), emptyObj] }));
  };

  const handleArrayRemove = (field: string, index: number) => {
    setEditProfile((prev: any) => {
      const arr = [...(prev[field] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleClinicLocationChange = (subfield: string, value: string) => {
    setEditProfile((prev: any) => ({
      ...prev,
      clinicLocation: { ...prev.clinicLocation, [subfield]: value },
    }));
  };

  // Schedule management functions
  const toggleDayAvailability = (dayIndex: number) => {
    setWeeklySchedule(prev => prev.map((day: any, index: number) => 
      index === dayIndex 
        ? { ...day, available: !day.available, slots: !day.available ? [{ startTime: '09:00', endTime: '17:00' }] : [] }
        : day
    ));
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedule(prev => prev.map((day: any, index: number) => 
      index === dayIndex 
        ? {
            ...day,
            slots: day.slots.map((slot: any, slotIdx: number) => 
              slotIdx === slotIndex 
                ? { ...slot, [field]: value }
                : slot
            )
          }
        : day
    ));
  };

  const addTimeSlot = (dayIndex: number) => {
    setWeeklySchedule(prev => prev.map((day: any, index: number) => 
      index === dayIndex 
        ? {
            ...day,
            slots: [...day.slots, { startTime: '09:00', endTime: '17:00' }]
          }
        : day
    ));
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    setWeeklySchedule(prev => prev.map((day: any, index: number) => 
      index === dayIndex 
        ? {
            ...day,
            slots: day.slots.filter((_, slotIdx) => slotIdx !== slotIndex)
          }
        : day
    ));
  };

  const saveSchedule = async () => {
    setScheduleSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Transform weekly schedule to API format
      const availability = weeklySchedule
        .filter(day => day.available && day.slots.length > 0)
        .map(day => ({
          day: day.day.toLowerCase(),
          slots: day.slots.map((slot: any) => ({
            startTime: slot.startTime,
            endTime: slot.endTime
          }))
        }));

      const payload = {
        availability: availability
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/doctors/availability`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Schedule saved successfully:', data);
        toast.success('Schedule saved successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to save schedule:', errorData);
        toast.error('Failed to save schedule. Please try again.');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setScheduleSaving(false);
    }
  };

  const addBlockDate = (date: string) => {
    setBlockDates(prev => [...prev, date]);
  };

  const removeBlockDate = (date: string) => {
    setBlockDates(prev => prev.filter(d => d !== date));
  };

  const generateTimeOptions = () => {
    const options: Array<{ value: string; label: string }> = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = hour === 0 
          ? `12:${minute.toString().padStart(2, '0')} AM` 
          : hour < 12 
            ? `${hour}:${minute.toString().padStart(2, '0')} AM` 
            : hour === 12 
              ? `12:${minute.toString().padStart(2, '0')} PM` 
              : `${hour - 12}:${minute.toString().padStart(2, '0')} PM`;
        
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...editProfile.doctor,
        // Only send editable fields
        education: editProfile.doctor.education,
        training: editProfile.doctor.training,
        specializations: editProfile.doctor.specializations,
        awards: editProfile.doctor.awards,
        publications: editProfile.doctor.publications,
        clinicLocation: editProfile.doctor.clinicLocation,
      };
      const res = await fetch(`${API_BASE_URL}/api/v1/doctors/profile`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Profile updated successfully!');
        setDoctorProfile(editProfile);
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading profile...</div>;
  }

  if (!doctorProfile) {
    return <div className="flex justify-center items-center min-h-[60vh] text-red-500">Failed to load profile.</div>;
  }

  // Use doctorProfile for all doctor-specific fields
  const profile = doctorProfile.doctor;

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NL', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Get mode icon
  const getModeIcon = (mode: string) => {
    if (mode === 'video') {
      return (
        <svg className="w-5 h-5 text-healthcare-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5 text-healthcare-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Show verification status message if needed */}
      {verificationStatus === 'pending' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          <strong>Your verification is pending.</strong> Please wait for admin approval.
        </div>
      )}
      {verificationStatus === 'rejected' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <strong>Your verification is rejected.</strong> Please review the comments below and contact support if needed.
          {adminComments && (
            <div className="mt-3 bg-white border border-red-300 rounded p-3 text-sm text-gray-800">
              <strong>Admin Comments:</strong>
              <div className="mt-1 whitespace-pre-line">{adminComments}</div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Doctor Dashboard</CardTitle>
              <CardDescription>Manage your practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveTab('overview')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                Overview
              </Button>
              
              <Button 
                variant={activeTab === 'appointments' ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveTab('appointments')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Appointments
              </Button>
              
              <Button 
                variant={activeTab === 'patients' ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveTab('patients')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Patients
              </Button>
              
              <Button 
                variant={activeTab === 'schedule' ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveTab('schedule')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Schedule
              </Button>
              
              <Button 
                variant={activeTab === 'consultations' ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveTab('consultations')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Consultations
              </Button>
              
              <Button 
                variant={activeTab === 'finances' ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveTab('finances')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                Finances
              </Button>
              
              <Button 
                variant={activeTab === 'settings' ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveTab('settings')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Settings
              </Button>
            </CardContent>
          </Card>
          
          {/* Quick Join Video Call Card */}
          <Card className="mt-6 bg-healthcare-light border-healthcare-primary border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-healthcare-primary">Video Consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Your next video consultation is starting soon.
              </p>
              <Button className="w-full bg-healthcare-primary hover:bg-healthcare-dark">
                Join Video Call
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:w-3/4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.photoURL} />
                      <AvatarFallback className="bg-healthcare-primary text-white">
                        {profile.userId.firstName?.charAt(0) || user?.email?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>Welcome, Dr. {profile.userId.firstName} {profile.userId.lastName}</CardTitle>
                      <CardDescription>Your practice dashboard overview</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-3xl text-healthcare-primary">{statistics.todayAppointments}</h3>
                      <p className="text-gray-600">Today's Appointments</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-3xl text-yellow-600">{statistics.pendingAppointments}</h3>
                      <p className="text-gray-600">Pending Appointments</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-3xl text-green-600">{statistics.totalPatients}</h3>
                      <p className="text-gray-600">Total Patients</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-3xl text-purple-600">{statistics.completedConsultations}</h3>
                      <p className="text-gray-600">Consultations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-NL', { 
                      weekday: 'long',
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">You don't have any appointments scheduled for today.</p>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.map((appointment) => (
                        <div key={appointment.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={appointment.patientImage} />
                              <AvatarFallback className="bg-healthcare-primary text-white">
                                {appointment.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{appointment.patientName}</h3>
                              <div className="flex items-center space-x-3 mt-1 text-sm">
                                <span className="flex items-center text-gray-600">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  {appointment.time}
                                </span>
                                <span className="flex items-center text-gray-600">
                                  {getModeIcon(appointment.mode)}
                                  <span className="ml-1 capitalize">{appointment.mode}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </Badge>
                            <div className="space-x-2">
                              <Link to={`/patient/${appointment.id}`}>
                                <Button variant="outline" size="sm">View Profile</Button>
                              </Link>
                              {appointment.mode === 'video' && (
                                <Button size="sm">Start Call</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled appointments for the next days</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">You don't have any upcoming appointments.</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={appointment.patientImage} />
                              <AvatarFallback className="bg-healthcare-primary text-white">
                                {appointment.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{appointment.patientName}</h3>
                              <div className="flex items-center space-x-3 mt-1 text-sm">
                                <span className="flex items-center text-gray-600">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  {formatDate(appointment.date)}
                                </span>
                                <span className="flex items-center text-gray-600">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  {appointment.time}
                                </span>
                                <span className="flex items-center text-gray-600">
                                  {getModeIcon(appointment.mode)}
                                  <span className="ml-1 capitalize">{appointment.mode}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </Badge>
                            <Link to={`/appointment/${appointment.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link to="/schedule" className="w-full">
                    <Button variant="outline" className="w-full">View Full Schedule</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {activeTab === 'appointments' && (
            <Card>
              <CardHeader>
                <Tabs defaultValue="upcoming">
                  <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  </TabsList>
                  
                  <div className="pt-6">
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>Manage all your appointments</CardDescription>
                  </div>
                </Tabs>
              </CardHeader>
              <CardContent>
                <p>Detailed appointments content will go here...</p>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'patients' && (
            <Card>
              <CardHeader>
                <CardTitle>Your Patients</CardTitle>
                <CardDescription>View and manage your patient list</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Patient management content will go here...</p>
              </CardContent>
              <CardFooter>
                <Button>Add New Patient</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Schedule Header */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* <div className="flex space-x-4 border-b">
                    <button className="px-4 py-2 text-sm font-medium text-gray-900 border-b-2 border-black">
                      Schedule
                    </button>
                  </div> */}
                  
                  <div className="mt-6">
                    {/* <div className="flex space-x-4 mb-6">
                      <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-900 rounded">
                        Default
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Exclusive time
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        + New Schedule
                      </button>
                    </div> */}
                    
                    <div className="flex gap-6">
                      {/* Main Schedule Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Default</h3>
                          <Button 
                            className="bg-black text-white hover:bg-gray-800"
                            onClick={saveSchedule}
                            disabled={scheduleSaving}
                          >
                            {scheduleSaving ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {weeklySchedule.map((daySchedule, index) => (
                            <div key={daySchedule.day} className="flex items-center space-x-4 p-4 border rounded-lg">
                              <input
                                type="checkbox"
                                checked={daySchedule.available}
                                onChange={() => toggleDayAvailability(index)}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className="flex-1 font-medium">{daySchedule.day}</span>
                              
                              {daySchedule.available ? (
                                <div className="flex-1 space-y-2">
                                  {daySchedule.slots.map((slot: any, slotIndex: number) => (
                                    <div key={slotIndex} className="flex items-center space-x-2">
                                      <select 
                                        value={slot.startTime}
                                        onChange={e => updateTimeSlot(index, slotIndex, 'startTime', e.target.value)}
                                        className="border rounded px-2 py-1 text-sm"
                                      >
                                        {generateTimeOptions().map(option => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                      <span className="text-gray-500">to</span>
                                      <select 
                                        value={slot.endTime}
                                        onChange={e => updateTimeSlot(index, slotIndex, 'endTime', e.target.value)}
                                        className="border rounded px-2 py-1 text-sm"
                                      >
                                        {generateTimeOptions().map(option => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                      <button 
                                        onClick={() => removeTimeSlot(index, slotIndex)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => addTimeSlot(index)}
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-500">Unavailable</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Block Dates Sidebar */}
                      <div className="w-80">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-lg mb-2">Block dates</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Add dates when you will be unavailable to take calls.
                          </p>
                          <Button variant="outline" className="w-full" onClick={() => setBlockDatesModal(true)}>
                            Add unavailable dates
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Block Dates Modal */}
              <Dialog open={blockDatesModal} onOpenChange={setBlockDatesModal}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Unavailable Dates</DialogTitle>
                    <DialogDescription>
                      Select dates when you will be unavailable for appointments.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={selectedBlockDate}
                        onChange={(e) => setSelectedBlockDate(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    {blockDates.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blocked Dates
                        </label>
                        <div className="space-y-2">
                          {blockDates.map((date, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>{new Date(date).toLocaleDateString()}</span>
                              <button
                                onClick={() => removeBlockDate(date)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setBlockDatesModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedBlockDate) {
                          addBlockDate(selectedBlockDate);
                          setSelectedBlockDate('');
                        }
                      }}
                      disabled={!selectedBlockDate}
                    >
                      Add Date
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          {activeTab === 'consultations' && (
            <Card>
              <CardHeader>
                <CardTitle>Video Consultations</CardTitle>
                <CardDescription>Manage your online consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Video consultation management content will go here...</p>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'finances' && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Track your earnings and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Financial content will go here...</p>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Practice Settings</CardTitle>
                <CardDescription>Manage your profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="education">Education & Training</TabsTrigger>
                    <TabsTrigger value="awards">Awards & Publications</TabsTrigger>
                    <TabsTrigger value="clinic">Clinic Location</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input value={profile.userId.firstName} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input value={profile.userId.lastName} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input value={user?.email} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input value={profile.userId.phone.countryCode+profile.userId.phone.number} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <input value={profile.userId.gender} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                          <input value={profile.userId.dob} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="professional" className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                          <input 
                            value={editProfile.registrationNumber || ''} 
                            onChange={e => handleFieldChange('registrationNumber', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent" 
                            placeholder="Enter registration number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                          <input 
                            type="number"
                            value={editProfile.experience || ''} 
                            onChange={e => handleFieldChange('experience', parseInt(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent" 
                            placeholder="Years of experience"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                          <input 
                            type="number"
                            value={editProfile.consultationFee || ''} 
                            onChange={e => handleFieldChange('consultationFee', parseInt(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent" 
                            placeholder="Fee amount"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                          <select 
                            value={editProfile.currency || 'EUR'} 
                            onChange={e => handleFieldChange('currency', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                          >
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                          <textarea 
                            value={editProfile.about || ''} 
                            onChange={e => handleFieldChange('about', e.target.value)}
                            rows={4}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent" 
                            placeholder="Tell us about your practice and expertise..."
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="education" className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                      <div className="space-y-3">
                        {editProfile.education.map((edu: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                placeholder="Degree"
                                value={edu.degree}
                                onChange={e => handleArrayChange('education', idx, 'degree', e.target.value)}
                              />
                              <input
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                placeholder="Institution"
                                value={edu.institution}
                                onChange={e => handleArrayChange('education', idx, 'institution', e.target.value)}
                              />
                              <div className="flex gap-2">
                                <input
                                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                  placeholder="Year"
                                  value={edu.year}
                                  onChange={e => handleArrayChange('education', idx, 'year', e.target.value)}
                                />
                                <Button type="button" size="sm" variant="outline" onClick={() => handleArrayRemove('education', idx)} className="text-red-600 hover:text-red-700">Remove</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => handleArrayAdd('education', { degree: '', institution: '', year: '' })} className="w-full">
                          + Add Education
                        </Button>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Training</h3>
                      <div className="space-y-3">
                        {editProfile.training.map((tr: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                placeholder="Training Name"
                                value={tr.name}
                                onChange={e => handleArrayChange('training', idx, 'name', e.target.value)}
                              />
                              <input
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                placeholder="Institution"
                                value={tr.institution}
                                onChange={e => handleArrayChange('training', idx, 'institution', e.target.value)}
                              />
                              <div className="flex gap-2">
                                <input
                                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                  placeholder="Year"
                                  value={tr.year}
                                  onChange={e => handleArrayChange('training', idx, 'year', e.target.value)}
                                />
                                <Button type="button" size="sm" variant="outline" onClick={() => handleArrayRemove('training', idx)} className="text-red-600 hover:text-red-700">Remove</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => handleArrayAdd('training', { name: '', institution: '', year: '' })} className="w-full">
                          + Add Training
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h3>
                      <div className="space-y-3">
                        {editProfile.specializations.map((spec: string, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                              placeholder="Specialization"
                              value={spec}
                              onChange={e => handleArrayChange('specializations', idx, '', e.target.value)}
                            />
                            <Button type="button" size="sm" variant="outline" onClick={() => handleArrayRemove('specializations', idx)} className="text-red-600 hover:text-red-700">Remove</Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => handleArrayAdd('specializations', '')} className="w-full">
                          + Add Specialization
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="awards" className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Awards & Recognition</h3>
                      <div className="space-y-3">
                        {editProfile.awards.map((aw: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                placeholder="Award Name"
                                value={aw.name}
                                onChange={e => handleArrayChange('awards', idx, 'name', e.target.value)}
                              />
                              <div className="flex gap-2">
                                <input
                                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                  placeholder="Year"
                                  value={aw.year}
                                  onChange={e => handleArrayChange('awards', idx, 'year', e.target.value)}
                                />
                                <Button type="button" size="sm" variant="outline" onClick={() => handleArrayRemove('awards', idx)} className="text-red-600 hover:text-red-700">Remove</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => handleArrayAdd('awards', { name: '', year: '' })} className="w-full">
                          + Add Award
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Publications</h3>
                      <div className="space-y-3">
                        {editProfile.publications.map((pub: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                            <div className="space-y-3">
                              <input
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                placeholder="Publication Title"
                                value={pub.title}
                                onChange={e => handleArrayChange('publications', idx, 'title', e.target.value)}
                              />
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                  placeholder="Journal"
                                  value={pub.journal}
                                  onChange={e => handleArrayChange('publications', idx, 'journal', e.target.value)}
                                />
                                <input
                                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                  placeholder="Year"
                                  value={pub.year}
                                  onChange={e => handleArrayChange('publications', idx, 'year', e.target.value)}
                                />
                                <Button type="button" size="sm" variant="outline" onClick={() => handleArrayRemove('publications', idx)} className="text-red-600 hover:text-red-700">Remove</Button>
                              </div>
                              <input
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                                placeholder="URL (optional)"
                                value={pub.url}
                                onChange={e => handleArrayChange('publications', idx, 'url', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => handleArrayAdd('publications', { title: '', journal: '', year: '', url: '' })} className="w-full">
                          + Add Publication
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="clinic" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Location</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                            placeholder="Street address"
                            value={editProfile.clinicLocation.address}
                            onChange={e => handleClinicLocationChange('address', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                            placeholder="City"
                            value={editProfile.clinicLocation.city}
                            onChange={e => handleClinicLocationChange('city', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                            placeholder="Postal code"
                            value={editProfile.clinicLocation.postalCode}
                            onChange={e => handleClinicLocationChange('postalCode', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-healthcare-primary focus:border-transparent"
                            placeholder="Country"
                            value={editProfile.clinicLocation.country}
                            onChange={e => handleClinicLocationChange('country', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Save button for all editable fields */}
                <div className="mt-8 pt-6 border-t">
                  <Button className="bg-healthcare-primary hover:bg-healthcare-dark" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save All Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
