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
      <div className="flex-1 ml-64">
        <div className="bg-white border-b border-[#dcdcde] h-16 flex items-center px-8">
          <div className="text-sm text-[#646970]">
            Admin
          </div>
        </div>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

