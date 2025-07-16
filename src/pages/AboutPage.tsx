
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

const teamMembers = [
  {
    id: 1,
    name: "Dr. Emma van der Berg",
    role: "Founder & Chief Medical Officer",
    bio: "Dr. Emma founded Med Connecter with a vision to make quality healthcare accessible to everyone in the Netherlands. With over 15 years of experience in healthcare administration and as a practicing physician, she brings both clinical expertise and leadership to the organization.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=300"
  },
  {
    id: 2,
    name: "Joost Bakker",
    role: "Chief Technology Officer",
    bio: "Joost leads our technical development with over a decade of experience building healthcare technology platforms. His focus is on creating intuitive, secure systems that connect patients with the right care providers efficiently.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300"
  },
  {
    id: 3,
    name: "Lisa de Vries",
    role: "Head of Patient Relations",
    bio: "Lisa ensures that the patient experience remains at the heart of everything we do. With a background in patient advocacy and healthcare management, she works to continually improve our services based on user feedback.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&h=300"
  }
];

const AboutPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-healthcare-primary">About Med Connecter</h1>
          
          <Card className="mb-10">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>Connecting patients with quality healthcare professionals across the Netherlands</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Founded in 2023, Med Connecter is dedicated to transforming how healthcare is accessed in the Netherlands. We believe that quality healthcare should be accessible to everyone, regardless of where they live or their personal circumstances.
              </p>
              <p className="text-gray-700">
                Our platform connects patients with specialist doctors throughout the country, making it easy to find the right healthcare professional, book appointments, and manage your healthcare journey in one convenient place.
              </p>
            </CardContent>
          </Card>
          
          <h2 className="text-3xl font-semibold mb-6 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {teamMembers.map((member) => (
              <Card key={member.id} className="h-full">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="rounded-full w-32 h-32 object-cover"
                    />
                  </div>
                  <CardTitle className="text-center">{member.name}</CardTitle>
                  <CardDescription className="text-center">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><span className="font-semibold">Accessibility:</span> Making healthcare accessible to everyone.</li>
                <li><span className="font-semibold">Quality:</span> Connecting patients with the best specialists.</li>
                <li><span className="font-semibold">Innovation:</span> Using technology to improve the healthcare experience.</li>
                <li><span className="font-semibold">Trust:</span> Building relationships based on reliability and transparency.</li>
                <li><span className="font-semibold">Patient-centered:</span> Keeping patients' needs at the core of our service.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
