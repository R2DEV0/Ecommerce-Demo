'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';

interface Webinar {
  id?: number;
  title: string;
  description: string;
  date_time: string;
  duration: number;
  meeting_url: string;
  status: string;
}

interface WebinarFormProps {
  webinar?: Webinar;
}

export default function WebinarForm({ webinar }: WebinarFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Format date for input field (YYYY-MM-DDTHH:mm)
  const formatDateTimeForInput = (dateTime: string) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState<Webinar>({
    title: webinar?.title || '',
    description: webinar?.description || '',
    date_time: webinar ? formatDateTimeForInput(webinar.date_time) : '',
    duration: webinar?.duration || 60,
    meeting_url: webinar?.meeting_url || '',
    status: webinar?.status || 'scheduled',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.date_time) {
      setError('Title and date/time are required');
      return;
    }

    setLoading(true);

    try {
      // Convert local datetime to ISO string
      const dateTimeISO = new Date(formData.date_time).toISOString();

      const url = webinar?.id 
        ? `/api/admin/webinars/${webinar.id}`
        : '/api/admin/webinars';
      
      const method = webinar?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date_time: dateTimeISO,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save webinar');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/webinars');
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
          message={webinar?.id ? 'Webinar updated successfully!' : 'Webinar created successfully!'}
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
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
              Date & Time <span className="text-red-600">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.date_time}
              onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
              required
              className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
              className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Meeting URL
          </label>
          <input
            type="url"
            value={formData.meeting_url}
            onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
            placeholder="https://zoom.us/j/..."
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
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-3 md:pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#2271b1] text-white px-3 py-2 md:px-4 md:py-2 rounded-sm hover:bg-[#135e96] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-normal text-xs md:text-sm"
          >
            {loading ? 'Saving...' : webinar?.id ? 'Update Webinar' : 'Create Webinar'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/webinars')}
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

