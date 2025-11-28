import db from './db';

export function getSiteSettings(): Record<string, string> {
  const settings = db.prepare('SELECT setting_key, setting_value FROM site_settings').all() as Array<{ setting_key: string; setting_value: string | null }>;
  
  const settingsObj: Record<string, string> = {};
  settings.forEach(setting => {
    settingsObj[setting.setting_key] = setting.setting_value || '';
  });
  
  return settingsObj;
}

export function getSiteSetting(key: string, defaultValue: string = ''): string {
  const setting = db.prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?').get(key) as { setting_value: string | null } | undefined;
  return setting?.setting_value || defaultValue;
}

