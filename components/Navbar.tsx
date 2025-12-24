'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, User, Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { toggleCart, getTotalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState('/media/newlogo.jpg');
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalItems = getTotalItems();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.site_logo) {
          setSiteLogo(data.site_logo);
        }
      })
      .catch(() => {});

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/courses', label: 'Courses' },
    { href: '/announcements', label: 'News' },
    { href: '/webinars', label: 'Webinars' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm' 
        : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center h-full py-2 group">
            <Image
              src={siteLogo}
              alt="Logo"
              width={160}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Cart */}
            {totalItems > 0 && (
              <button
                onClick={toggleCart}
                className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-orange-500 rounded-full">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              </button>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 animate-scale-in overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={`/profile/${user.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Your Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-slate-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-all"
                >
                  Sign in
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-1">
            {totalItems > 0 && (
              <button
                onClick={toggleCart}
                className="relative p-2 text-slate-600"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-orange-500 rounded-full">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 animate-fade-in">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg font-medium text-sm"
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="my-2 border-t border-slate-100" />
                  <div className="px-3 py-2">
                    <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg font-medium text-sm"
                  >
                    Your Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg font-medium text-sm"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-slate-100" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg font-medium text-sm"
                  >
                    Sign in
                  </Link>
                  <div className="px-3 pt-1">
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2 text-center text-white font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
