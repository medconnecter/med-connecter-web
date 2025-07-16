import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import Layout from '@/components/layout/Layout';

// Mock doctor data
const mockDoctors = [
  {
    id: '1',
    name: 'Dr. Anna de Vries',
    specialty: 'Cardiologist',
    hospital: 'Amsterdam University Medical Center',
    consultationFee: 80,
    photoUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
    verified: true,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    timeSlots: {
      'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Tuesday': ['10:00', '11:00', '13:00', '14:00'],
      'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Friday': ['10:00', '11:00', '13:00', '14:00']
    }
  },
  {
    id: '2',
    name: 'Dr. Jan van der Berg',
    specialty: 'Neurologist',
    hospital: 'Erasmus Medical Center',
    consultationFee: 95,
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    verified: true,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    timeSlots: {
      'Monday': ['09:00', '10:00', '11:00', '14:00'],
      'Wednesday': ['10:00', '11:00', '14:00', '15:00'],
      'Friday': ['09:00', '10:00', '14:00', '15:00']
    }
  },
  {
    id: '3',
    name: 'Dr. Sophie Jansen',
    specialty: 'Dermatologist',
    hospital: 'University Medical Center Utrecht',
    consultationFee: 75,
    photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    verified: true,
    availableDays: ['Monday', 'Tuesday', 'Thursday'],
    timeSlots: {
      'Monday': ['09:00', '10:00', '14:00', '15:00'],
      'Tuesday': ['10:00', '11:00', '13:00', '14:00', '15:00'],
      'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00']
    }
  },
  // Add more mock doctors as needed
];

const BookAppointmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get date and time from query params if available
  const initialDate = searchParams.get('date') ? new Date() : undefined;
  const initialTime = searchParams.get('time');
  
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [timeSlot, setTimeSlot] = useState<string | null>(initialTime || null);
  const [consultationType, setConsultationType] = useState<string>("video");
  const [notes, setNotes] = useState<string>("");
  const [secondOpinion, setSecondOpinion] = useState<boolean>(false);
  
  // Find the doctor based on the URL param
  const doctor = mockDoctors.find((doc) => doc.id === id);
  
  // If doctor not found
  if (!doctor) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Doctor Not Found</h2>
          <p className="text-gray-600 mb-6">The doctor you are looking for does not exist or may have been removed.</p>
          <Button onClick={() => navigate('/find-doctors')} className="bg-healthcare-primary hover:bg-healthcare-dark">
            Return to Doctor Search
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Function to get available time slots for the selected date
  const getAvailableTimeSlots = () => {
    if (!date) return [];
    
    const dayName = format(date, 'EEEE');
    if (!doctor.availableDays.includes(dayName)) return [];
    
    return doctor.timeSlots[dayName] || [];
  };
  
  // Get available time slots for the selected date
  const availableTimeSlots = getAvailableTimeSlots();
  
  const handleBookAppointment = () => {
    if (!date || !timeSlot) {
      toast({
        title: "Booking Failed",
        description: "Please select a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would normally make an API call to book the appointment
    toast({
      title: "Appointment Booked!",
      description: `Your appointment with ${doctor.name} is scheduled for ${format(date, 'MMMM d, yyyy')} at ${timeSlot}.`,
    });
    
    // Redirect to confirmation page or dashboard
    navigate('/dashboard');
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Complete the form below to schedule your appointment with {doctor.name}.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor Info */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.photoUrl} />
                  <AvatarFallback className="bg-healthcare-primary text-white">
                    {doctor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{doctor.name}</h2>
                  <p className="text-gray-600">{doctor.specialty}</p>
                  {doctor.verified && (
                    <Badge className="mt-1 bg-healthcare-primary">Verified</Badge>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Hospital</p>
                  <p className="font-medium">{doctor.hospital}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="font-medium">€{doctor.consultationFee}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Booking Form */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => {
                      const dayName = format(date, 'EEEE');
                      return !doctor.availableDays.includes(dayName) || date < new Date();
                    }}
                  />
                </div>
                
                {/* Time Slots */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Select Time</h3>
                  {date ? (
                    availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={timeSlot === time ? "default" : "outline"}
                            className={`${timeSlot === time ? 'bg-healthcare-primary' : ''}`}
                            onClick={() => setTimeSlot(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No available time slots for this date.</p>
                    )
                  ) : (
                    <p className="text-gray-500">Please select a date first.</p>
                  )}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Consultation Type */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Consultation Type</h3>
                <RadioGroup value={consultationType} onValueChange={setConsultationType} className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="cursor-pointer">Video Consultation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <Label htmlFor="in-person" className="cursor-pointer">In-Person Visit</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Second Opinion */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="second-opinion"
                    checked={secondOpinion}
                    onChange={(e) => setSecondOpinion(e.target.checked)}
                    className="rounded border-gray-300 text-healthcare-primary focus:ring-healthcare-primary"
                  />
                  <Label htmlFor="second-opinion" className="cursor-pointer">
                    This is for a second opinion
                  </Label>
                </div>
              </div>
              
              {/* Notes */}
              <div className="mb-6">
                <Label htmlFor="notes" className="block mb-2">
                  Additional Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Please include any information that might be helpful for the doctor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              {/* Booking Summary */}
              {date && timeSlot && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium mb-2">Booking Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span> {format(date, 'MMMM d, yyyy')}
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span> {timeSlot}
                    </div>
                    <div>
                      <span className="text-gray-500">Doctor:</span> {doctor.name}
                    </div>
                    <div>
                      <span className="text-gray-500">Fee:</span> €{doctor.consultationFee}
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span> {consultationType === 'video' ? 'Video Call' : 'In-Person'}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/doctor/${doctor.id}`)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-healthcare-primary hover:bg-healthcare-dark"
                  onClick={handleBookAppointment}
                  disabled={!date || !timeSlot}
                >
                  Confirm Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookAppointmentPage;
