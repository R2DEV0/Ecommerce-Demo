import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import WebinarForm from '@/components/WebinarForm';

export default async function NewWebinarPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Schedule Webinar</h1>
          <WebinarForm />
        </div>
      </div>
    </>
  );
}

