import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import dynamic from 'next/dynamic';

const MediaLibrary = dynamic(
  () => import('@/components/MediaLibrary'),
  { 
    ssr: false,
    loading: () => <div className="text-center py-12 text-gray-500">Loading media library...</div>
  }
);

export default async function AdminMediaPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <h1 className="text-xl md:text-2xl font-normal text-[#1d2327]">Media Library</h1>
      </div>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-3 sm:p-4 md:p-6 w-full max-w-full">
        <MediaLibrary />
      </div>
    </div>
  );
}

