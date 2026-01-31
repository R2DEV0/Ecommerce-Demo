'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
    });
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Sign out"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}

