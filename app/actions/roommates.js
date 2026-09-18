'use server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function submitRoommateProfile(formData) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data = {
      name: formData.get('name'),
      gender: formData.get('gender'),
      college: formData.get('college'),
      budget_max: parseInt(formData.get('budget_max'), 10),
      bio: formData.get('bio'),
      whatsapp: formData.get('whatsapp'),
      is_active: true
    };

    if (!data.name || !data.gender || !data.college || !data.budget_max || !data.bio || !data.whatsapp) {
      return { success: false, error: 'All fields are required' };
    }

    const { error } = await supabase.from('roommates').insert([data]);
    if (error) throw error;
    
    revalidatePath('/roommates');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function deleteRoommate(id) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('roommates').delete().eq('id', id);
    if (error) throw error;
    
    revalidatePath('/admin');
    revalidatePath('/roommates');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
