'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Settings {
  company_name?: string;
  copyright_text?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
}

export default function ClientFooter() {
  const [settings, setSettings] = useState<Settings>({});
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const companyName = settings.company_name || 'The Center for Depth and Complexity';
  const copyrightText = settings.copyright_text || `© ${currentYear} ${companyName}. All rights reserved.`;

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Shop</h3>
            <ul className="space-y-2.5">
              <li><Link href="/shop" className="text-sm text-slate-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/courses" className="text-sm text-slate-400 hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/webinars" className="text-sm text-slate-400 hover:text-white transition-colors">Webinars</Link></li>
              <li><Link href="/announcements" className="text-sm text-slate-400 hover:text-white transition-colors">News</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Learn</h3>
            <ul className="space-y-2.5">
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Getting Started</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Framework Icons</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Content Imperatives</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Universal Concepts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Professional Dev</h3>
            <ul className="space-y-2.5">
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Workshops</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Training Programs</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Certifications</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Consulting</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <span className="font-semibold text-white">{companyName}</span>
              <span className="hidden md:inline text-slate-600">•</span>
              <span className="text-sm text-slate-500">{copyrightText}</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex gap-4 text-sm">
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">Terms</Link>
              </div>
              
              <div className="flex gap-3">
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                  </a>
                )}
                {settings.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                  </a>
                )}
                {settings.linkedin_url && (
                  <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                )}
                {settings.youtube_url && (
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

