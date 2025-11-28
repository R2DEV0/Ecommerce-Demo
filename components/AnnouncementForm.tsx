'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';

interface Announcement {
  id?: number;
  title: string;
  content: string;
  status: string;
}

interface AnnouncementFormProps {
  announcement?: Announcement;
}

export default function AnnouncementForm({ announcement }: AnnouncementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Announcement>({
    title: announcement?.title || '',
    content: announcement?.content || '',
    status: announcement?.status || 'published',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = announcement?.id 
        ? `/api/admin/announcements/${announcement.id}`
        : '/api/admin/announcements';
      
      const method = announcement?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save announcement');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/announcements');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {success && (
        <Toast
          message={announcement?.id ? 'Announcement updated successfully!' : 'Announcement created successfully!'}
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
        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Content <span className="text-red-600">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            required
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-3 md:pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#2271b1] text-white px-3 py-2 md:px-4 md:py-2 rounded-sm hover:bg-[#135e96] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-normal text-xs md:text-sm"
          >
            {loading ? 'Saving...' : announcement?.id ? 'Update Announcement' : 'Create Announcement'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/announcements')}
            className="px-3 py-2 md:px-4 md:py-2 border border-[#c3c4c7] rounded-sm hover:bg-[#f6f7f7] transition-colors text-xs md:text-sm text-[#1d2327]"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
    </>
  );
}

