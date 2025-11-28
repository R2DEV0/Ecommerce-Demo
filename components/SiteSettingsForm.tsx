'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';
import MediaSelector from './MediaSelector';

interface SiteSettingsFormProps {
  settings: Record<string, string>;
}

export default function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    site_logo: settings.site_logo || '/media/newlogo.jpg',
    site_favicon: settings.site_favicon || '/favicon.ico',
    company_name: settings.company_name || '',
    company_description: settings.company_description || '',
    meta_title: settings.meta_title || '',
    meta_description: settings.meta_description || '',
    meta_keywords: settings.meta_keywords || '',
    site_email: settings.site_email || '',
    site_phone: settings.site_phone || '',
    site_address: settings.site_address || '',
    facebook_url: settings.facebook_url || '',
    twitter_url: settings.twitter_url || '',
    linkedin_url: settings.linkedin_url || '',
    youtube_url: settings.youtube_url || '',
    copyright_text: settings.copyright_text || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save settings');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {success && (
        <Toast
          message="Settings saved successfully!"
          type="success"
          onClose={() => setSuccess(false)}
        />
      )}
      
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError('')}
        />
      )}
      
      <form onSubmit={handleSubmit} className="w-full">

      <div className="space-y-3 md:space-y-4 lg:space-y-6">
        {/* Branding Section */}
        <div className="border-b border-[#c3c4c7] pb-4 md:pb-6">
          <h2 className="text-base md:text-lg font-semibold text-[#1d2327] mb-3 md:mb-4">Branding</h2>
          
          <div className="space-y-3 md:space-y-4">
            <MediaSelector
              label="Site Logo"
              value={formData.site_logo}
              onChange={(value) => setFormData({ ...formData, site_logo: value })}
              type="image"
              accept="image/*"
            />

            <MediaSelector
              label="Site Favicon"
              value={formData.site_favicon}
              onChange={(value) => setFormData({ ...formData, site_favicon: value })}
              type="image"
              accept="image/*"
            />
          </div>
        </div>

        {/* Company Information Section */}
        <div className="border-b border-[#c3c4c7] pb-4 md:pb-6">
          <h2 className="text-base md:text-lg font-semibold text-[#1d2327] mb-3 md:mb-4">Company Information</h2>
          
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                Company Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
              <p className="text-xs text-[#646970] mt-1">Used in footer copyright text</p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                Company Description
              </label>
              <textarea
                value={formData.company_description}
                onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                rows={4}
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
              <p className="text-xs text-[#646970] mt-1">Company description used in footer</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.site_email}
                  onChange={(e) => setFormData({ ...formData, site_email: e.target.value })}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.site_phone}
                  onChange={(e) => setFormData({ ...formData, site_phone: e.target.value })}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                Address
              </label>
              <textarea
                value={formData.site_address}
                onChange={(e) => setFormData({ ...formData, site_address: e.target.value })}
                rows={2}
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="border-b border-[#c3c4c7] pb-4 md:pb-6">
          <h2 className="text-base md:text-lg font-semibold text-[#1d2327] mb-3 md:mb-4">SEO Settings</h2>
          
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
              <p className="text-xs text-[#646970] mt-1">Page title for search engines</p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={3}
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
              <p className="text-xs text-[#646970] mt-1">Description for search engines (recommended: 150-160 characters)</p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                value={formData.meta_keywords}
                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
              <p className="text-xs text-[#646970] mt-1">Comma-separated keywords for SEO</p>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="border-b border-[#c3c4c7] pb-4 md:pb-6">
          <h2 className="text-base md:text-lg font-semibold text-[#1d2327] mb-3 md:mb-4">Social Media</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                Twitter/X URL
              </label>
              <input
                type="url"
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/..."
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://youtube.com/..."
                className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-[#1d2327] mb-3 md:mb-4">Footer</h2>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              value={formData.copyright_text}
              onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
              placeholder="© 2024 Company Name. All rights reserved."
              className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            />
            <p className="text-xs text-[#646970] mt-1">Leave empty to use default: &quot;© {`{year}`} {`{Company Name}`}. All rights reserved.&quot;</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-3 md:pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#2271b1] text-white px-3 py-2 md:px-4 md:py-2 rounded-sm hover:bg-[#135e96] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-normal text-xs md:text-sm"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </form>
    </>
  );
}
