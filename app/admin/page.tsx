import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default async function AdminPage() {
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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/products" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Products</h2>
              <p className="text-gray-600">Manage shop products</p>
            </Link>
            <Link href="/admin/courses" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Courses</h2>
              <p className="text-gray-600">Manage courses and lessons</p>
            </Link>
            <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Users</h2>
              <p className="text-gray-600">Manage users and permissions</p>
            </Link>
            <Link href="/admin/announcements" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Announcements</h2>
              <p className="text-gray-600">Create and manage announcements</p>
            </Link>
            <Link href="/admin/webinars" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Webinars</h2>
              <p className="text-gray-600">Schedule and manage webinars</p>
            </Link>
            <Link href="/admin/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Orders</h2>
              <p className="text-gray-600">View and manage orders</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

