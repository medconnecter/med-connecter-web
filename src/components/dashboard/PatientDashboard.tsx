
import { useState } from 'react';
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
import { useAuth } from '@/hooks/useAuth';

// Mock data for upcoming appointments
const upcomingAppointments = [
  {
    id: 'appt-1',
    doctorName: 'Dr. Anne de Vries',
    specialty: 'Cardiologist',
    date: '2025-05-20T10:30:00',
    mode: 'video',
    status: 'confirmed',
    doctorImage: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    id: 'appt-2',
    doctorName: 'Dr. Jan Bakker',
    specialty: 'Dermatologist',
    date: '2025-05-25T14:00:00',
    mode: 'in-person',
    status: 'pending',
    doctorImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
];

// Mock data for recent consultations
const recentConsultations = [
  {
    id: 'consult-1',
    doctorName: 'Dr. Sophie Jansen',
    specialty: 'Neurologist',
    date: '2025-05-01T11:00:00',
    mode: 'video',
    status: 'completed',
    doctorImage: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NL', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };
  
  // Format time display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-NL', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
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
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Patient Dashboard</CardTitle>
              <CardDescription>Manage your healthcare</CardDescription>
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
                variant={activeTab === 'medical-records' ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveTab('medical-records')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Medical Records
              </Button>
              
              <Button 
                variant={activeTab === 'payments' ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveTab('payments')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                Payments
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
          
          {/* Quick Book Card */}
          <Card className="mt-6 bg-healthcare-light border-healthcare-primary border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-healthcare-primary">Need a Consultation?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Book a consultation with a specialist in minutes.
              </p>
              <Link to="/find-doctors">
                <Button className="w-full bg-healthcare-primary hover:bg-healthcare-dark">
                  Find Specialists
                </Button>
              </Link>
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
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>Welcome, {user?.displayName || 'Patient'}</CardTitle>
                      <CardDescription>Your health dashboard overview</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-3xl text-healthcare-primary">{upcomingAppointments.length}</h3>
                      <p className="text-gray-600">Upcoming Appointments</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-3xl text-green-600">{recentConsultations.length}</h3>
                      <p className="text-gray-600">Past Consultations</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-3xl text-purple-600">0</h3>
                      <p className="text-gray-600">New Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Upcoming Appointments</span>
                    <Link to="/appointments">
                      <Button variant="link" className="text-healthcare-primary p-0 h-auto">
                        View All
                      </Button>
                    </Link>
                  </CardTitle>
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
                              <AvatarImage src={appointment.doctorImage} />
                              <AvatarFallback className="bg-healthcare-primary text-white">
                                {appointment.doctorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{appointment.doctorName}</h3>
                              <p className="text-sm text-gray-600">{appointment.specialty}</p>
                              <div className="flex items-center space-x-2 mt-1 text-sm">
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
                                  {formatTime(appointment.date)}
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
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                            <Link to={`/appointment/${appointment.id}`}>
                              <Button size="sm">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Consultations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Recent Consultations</span>
                    <Link to="/consultations">
                      <Button variant="link" className="text-healthcare-primary p-0 h-auto">
                        View All
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentConsultations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">You don't have any past consultations.</p>
                  ) : (
                    <div className="space-y-4">
                      {recentConsultations.map((consultation) => (
                        <div key={consultation.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={consultation.doctorImage} />
                              <AvatarFallback className="bg-healthcare-primary text-white">
                                {consultation.doctorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{consultation.doctorName}</h3>
                              <p className="text-sm text-gray-600">{consultation.specialty}</p>
                              <div className="flex items-center space-x-2 mt-1 text-sm">
                                <span className="flex items-center text-gray-600">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  {formatDate(consultation.date)}
                                </span>
                                <span className="flex items-center text-gray-600">
                                  {getModeIcon(consultation.mode)}
                                  <span className="ml-1 capitalize">{consultation.mode}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(consultation.status)}>
                              {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                            </Badge>
                            <div className="space-x-2">
                              <Link to={`/consultation/${consultation.id}`}>
                                <Button variant="outline" size="sm">View Summary</Button>
                              </Link>
                              <Button variant="secondary" size="sm">Book Follow-up</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'appointments' && (
            <Card>
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
                <CardDescription>Manage all your upcoming and past appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Appointment management content will go here...</p>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'consultations' && (
            <Card>
              <CardHeader>
                <CardTitle>Consultations</CardTitle>
                <CardDescription>View your video consultation history</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Consultations content will go here...</p>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'medical-records' && (
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>Access and manage your health records</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Medical records content will go here...</p>
              </CardContent>
              <CardFooter>
                <Button>Upload New Document</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'payments' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your payment history and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Payments content will go here...</p>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Settings content will go here...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
