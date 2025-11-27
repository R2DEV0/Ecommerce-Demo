'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EnrollButton({ courseId, price }: { courseId: number; price: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to enroll. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Enrolling...' : price === 0 ? 'Enroll for Free' : `Enroll for $${price.toFixed(2)}`}
    </button>
  );
}

