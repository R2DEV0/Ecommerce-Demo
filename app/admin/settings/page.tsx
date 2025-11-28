import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import SiteSettingsForm from '@/components/SiteSettingsForm';
import db from '@/lib/db';

export default async function SiteSettingsPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  // Get all site settings
  const settings = db.prepare('SELECT setting_key, setting_value FROM site_settings').all() as Array<{ setting_key: string; setting_value: string | null }>;
  
  // Convert to object for easier access
  const settingsObj: Record<string, string> = {};
  settings.forEach(setting => {
    settingsObj[setting.setting_key] = setting.setting_value || '';
  });

  return (
    <div className="w-full max-w-full">
      <h1 className="text-xl md:text-2xl font-normal mb-3 md:mb-6 text-[#1d2327]">Site Settings</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-3 sm:p-4 md:p-6 w-full max-w-full">
        <SiteSettingsForm settings={settingsObj} />
      </div>
    </div>
  );
}

