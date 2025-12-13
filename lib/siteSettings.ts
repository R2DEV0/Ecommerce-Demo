import db from './db';

export async function getSiteSettings(): Promise<Record<string, string>> {
  const result = await db.execute('SELECT setting_key, setting_value FROM site_settings');
  
  const settingsObj: Record<string, string> = {};
  result.rows.forEach((setting: any) => {
    settingsObj[setting.setting_key] = setting.setting_value || '';
  });
  
  return settingsObj;
}

export async function getSiteSetting(key: string, defaultValue: string = ''): Promise<string> {
  const result = await db.execute({
    sql: 'SELECT setting_value FROM site_settings WHERE setting_key = ?',
    args: [key]
  });
  const setting = result.rows[0] as any;
  return setting?.setting_value || defaultValue;
}
