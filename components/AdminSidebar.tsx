'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  BookOpen, 
  Users, 
  Megaphone, 
  Video, 
  ShoppingCart,
  Home
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/webinars', label: 'Webinars', icon: Video },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#23282d] text-white flex flex-col z-50">
      {/* Logo/Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#32373c]">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#2271b1] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-lg">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname?.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-[#2271b1] text-white'
                      : 'text-[#b4b9be] hover:bg-[#32373c] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="h-16 border-t border-[#32373c] flex items-center px-4">
        <Link
          href="/"
          className="flex items-center space-x-2 text-[#b4b9be] hover:text-white transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          <span>Visit Site</span>
        </Link>
      </div>
    </div>
  );
}

