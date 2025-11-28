import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#f0f0f1]">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 w-full min-w-0">
        <div className="bg-white border-b border-[#dcdcde] h-16 flex items-center px-4 lg:px-8">
          <div className="text-sm text-[#646970]">
            Admin
          </div>
        </div>
        <main className="p-2 sm:p-4 md:p-6 lg:p-8 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

