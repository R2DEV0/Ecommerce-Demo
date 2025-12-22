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
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-72 w-full min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 h-16 flex items-center px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
            <nav className="flex items-center text-sm">
              <span className="text-slate-400">Admin</span>
              <svg className="w-4 h-4 text-slate-300 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-slate-700 font-medium">Dashboard</span>
            </nav>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-4 md:p-6 lg:p-8 max-w-full">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
