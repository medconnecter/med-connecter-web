
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  hospital?: string;
  rating: number;
  reviewCount: number;
  languages: string[];
  availableToday: boolean;
  consultationFee: number;
  photoUrl?: string;
  verified: boolean;
}

const DoctorCard = ({
  id,
  name,
  specialty,
  hospital,
  rating,
  reviewCount,
  languages,
  availableToday,
  consultationFee,
  photoUrl,
  verified,
}: DoctorCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          {/* Doctor Photo & Name */}
          <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
            <Avatar className="h-24 w-24 border-2 border-gray-100">
              <AvatarImage src={photoUrl} />
              <AvatarFallback className="bg-healthcare-primary text-white text-xl">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {verified && (
              <Badge className="mt-2 bg-healthcare-primary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Verified
              </Badge>
            )}
          </div>
          
          {/* Doctor Info */}
          <div className="flex-grow space-y-2">
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="text-gray-600">{specialty}</p>
              {hospital && <p className="text-gray-500 text-sm">{hospital}</p>}
            </div>
            
            {/* Ratings */}
            <div className="flex items-center">
              <div className="flex">
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
              <span className="ml-2 text-sm text-gray-600">({reviewCount} reviews)</span>
            </div>
            
            {/* Languages */}
            <div className="flex flex-wrap gap-1">
              {languages.map((language) => (
                <Badge key={language} variant="outline" className="bg-gray-100">
                  {language}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Fee & Actions */}
          <div className="flex flex-col items-center sm:items-end space-y-3 mt-4 sm:mt-0">
            <div className="text-right">
              <p className="text-sm text-gray-500">Consultation Fee</p>
              <p className="font-semibold text-lg">€{consultationFee}</p>
            </div>
            
            <div className="space-y-2 w-full sm:w-auto">
              {availableToday && (
                <Badge className="bg-green-100 text-green-800 mb-2 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Available Today
                </Badge>
              )}
              
              <Link to={`/doctor/${id}`} className="block w-full sm:w-auto">
                <Button className="w-full bg-healthcare-primary hover:bg-healthcare-dark">
                  View Profile
                </Button>
              </Link>
              
              <Link to={`/book-appointment/${id}`} className="block w-full sm:w-auto">
                <Button variant="outline" className="w-full border-healthcare-primary text-healthcare-primary hover:bg-healthcare-light">
                  Book Appointment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
