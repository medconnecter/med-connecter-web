import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ReimbursementAndCostsPage = () => {
  return (
    <Layout>
      <section className="py-16 bg-gray-50 min-h-[60vh]">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Reimbursement and Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-gray-700">
                All consultations booked through Med Connecter are paid securely via our platform. The rates for each consultation are always clearly visible in advance, so you know exactly what to expect—no surprises.
              </p>
              <p className="text-gray-700">
                In some cases, (partial) reimbursement of your consultation costs may be possible. This depends on your health insurance policy and the type of care you receive. We recommend checking with your health insurance provider to see if you are eligible for reimbursement.
              </p>
              <Alert variant="default">
                <AlertTitle>Insurance Tip</AlertTitle>
                <AlertDescription>
                  Always contact your health insurance provider before booking to confirm whether your consultation is eligible for (partial) reimbursement. Med Connecter does not guarantee reimbursement.
                </AlertDescription>
              </Alert>
              <p className="text-gray-700">
                If you have any questions about payments or need an invoice for your insurance, please contact our support team. We are happy to help!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default ReimbursementAndCostsPage; 