import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import WebinarForm from '@/components/WebinarForm';

export default async function EditWebinarPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  const webinar = db.prepare('SELECT * FROM webinars WHERE id = ?').get(parseInt(params.id)) as any;
  
  if (!webinar) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Webinar</h1>
          <WebinarForm webinar={webinar} />
        </div>
      </div>
    </>
  );
}

