import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const WhyMedConnecterPage = () => {
  return (
    <Layout>
      <section className="py-16 bg-gray-50 min-h-[60vh]">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Who is MedConnecter for?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="list-disc pl-5 space-y-3 text-gray-700 text-lg">
                <li>Individuals with a referral who are facing extended waiting times to see a medical specialist.</li>
                <li>Patients seeking direct access to healthcare providers without the need for a referral letter.</li>
                <li>Expats and internationals requiring timely access to general practitioners or specialists, often within days.</li>
                <li>Anyone wishing to take proactive control of their healthcare journey with transparent options and flexible access.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default WhyMedConnecterPage; 