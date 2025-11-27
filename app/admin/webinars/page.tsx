import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default async function AdminWebinarsPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  const webinars = db.prepare(`
    SELECT w.*,
           COUNT(wr.id) as registration_count
    FROM webinars w
    LEFT JOIN webinar_registrations wr ON w.id = wr.webinar_id
    GROUP BY w.id
    ORDER BY w.date_time DESC
  `).all() as any[];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Manage Webinars</h1>
            <Link
              href="/admin/webinars/new"
              className="bg-action-500 text-white px-4 py-2 rounded-lg hover:bg-action-600 transition-colors font-semibold"
            >
              Schedule Webinar
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {webinars.map((webinar) => {
                  const webinarDate = new Date(webinar.date_time);
                  return (
                    <tr key={webinar.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{webinar.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {webinarDate.toLocaleDateString()} {webinarDate.toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          webinar.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {webinar.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{webinar.registration_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/webinars/${webinar.id}`} className="text-primary-600 hover:text-primary-700">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

