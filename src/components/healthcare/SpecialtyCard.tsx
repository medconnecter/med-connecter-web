
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface SpecialtyCardProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

const SpecialtyCard = ({ name, icon, color, href }: SpecialtyCardProps) => {
  return (
    <Link to={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="p-4 text-center">
          <div 
            className={`mx-auto rounded-full w-16 h-16 flex items-center justify-center mb-3`}
            style={{ backgroundColor: `${color}20` }} // Using opacity for background
          >
            <div className="text-2xl" style={{ color: color }}>
              {icon}
            </div>
          </div>
          <CardTitle className="text-base">{name}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default SpecialtyCard;
