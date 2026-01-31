'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleCart, getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState('/media/newlogo.jpg');
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalItems = getTotalItems();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.site_logo) setSiteLogo(data.site_logo);
      })
      .catch(() => {});

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await logout();
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

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Spacer for fixed navbar */}
      <div className="h-16" />
      
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-2' : 'py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-500 ${
            scrolled 
              ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 rounded-2xl px-4 py-2 border border-white/20' 
              : 'bg-transparent'
          }`}>
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 relative group">
              <Image
                src={siteLogo}
                alt="Logo"
                width={140}
                height={36}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Center Navigation - Floating Pill */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center bg-slate-100 rounded-full p-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                      isActive(link.href)
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              {totalItems > 0 && (
                <button
                  onClick={toggleCart}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                  aria-label="Shopping cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-orange-500 rounded-full">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                </button>
              )}

              {/* Desktop Auth */}
              <div className="hidden md:flex items-center gap-2">
                {user && !(user as any).loading ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-indigo-500/30">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </button>
                    
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-scale-in overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href={`/profile/${user.id}`}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            Profile
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <LayoutDashboard className="w-4 h-4 text-slate-400" />
                              Admin
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-slate-100 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : user && (user as any).loading ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-indigo-500/30">
                    U
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Link 
                      href="/login" 
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-20 left-4 right-4 bg-white rounded-3xl shadow-2xl p-6 animate-scale-in">
            {/* Nav Links */}
            <div className="flex flex-col gap-1 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* User Section */}
            {user && !(user as any).loading ? (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium"
                  >
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : user && (user as any).loading ? (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    U
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-4 py-3 text-center text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-4 py-3 text-center text-white bg-slate-900 rounded-xl font-semibold hover:bg-slate-800"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
