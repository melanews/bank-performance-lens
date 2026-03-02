import { supabase } from './supabase';
import { format } from 'date-fns';

export interface KPIEntry {
  id: string;
  date: string;
  kpi: string;
  achieved: number;
  created_at: string;
  user_id: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  company_name: string;
  phone_number: string;
}

export interface Target {
  id: string;
  kpi: string;
  month: string; // 'YYYY-MM'
  target_value: number;
  user_id: string;
}

export const getEntries = async (userId: string): Promise<KPIEntry[]> => {
  const { data, error } = await supabase
    .from('pms_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    return [];
  }
  return data || [];
};

export const saveEntry = async (entry: Omit<KPIEntry, 'id' | 'created_at' | 'user_id'>, userId: string): Promise<KPIEntry | null> => {
  const { data, error } = await supabase
    .from('pms_entries')
    .insert([{ ...entry, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error saving entry:', error);
    return null;
  }
  return data;
};

export const deleteEntry = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pms_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting entry:', error);
    return false;
  }
  return true;
};

export const getTargets = async (userId: string): Promise<Target[]> => {
  const { data, error } = await supabase
    .from('pms_targets')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching targets:', error);
    return [];
  }
  return data || [];
};

export const saveTarget = async (target: Omit<Target, 'id'>): Promise<Target | null> => {
  const { data, error } = await supabase
    .from('pms_targets')
    .upsert([target], { onConflict: 'kpi,month,user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving target:', error);
    return null;
  }
  return data;
};

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const downloadBackup = async (userId: string) => {
  try {
    const entries = await getEntries(userId);
    const targets = await getTargets(userId);
    
    const backupData = {
      entries,
      targets,
      timestamp: Date.now(),
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pms-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Backup failed:', error);
    return null;
  }
};

export const autoBackup = async (userId: string) => {
  // Implementation for automated cloud backup or similar
};