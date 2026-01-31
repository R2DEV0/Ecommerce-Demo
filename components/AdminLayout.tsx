import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import AdminSidebar from './AdminSidebar';
import AdminLogoutButton from './AdminLogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let currentUser;
  try {
    currentUser = await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-72 w-full min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 h-16 flex items-center justify-between px-4 lg:px-8">
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
          
          {/* User Profile */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${currentUser.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </Link>
              <AdminLogoutButton />
            </div>
          )}
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
