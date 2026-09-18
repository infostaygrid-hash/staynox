'use server';

import { createClient } from '@supabase/supabase-js';

export async function submitReview(propertyId, formData) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const student_name = formData.get('student_name');
    const rating = parseInt(formData.get('rating'), 10);
    const comment = formData.get('comment');

    if (!student_name || !rating || !comment) {
      return { success: false, error: 'All fields are required' };
    }

    const { error } = await supabase.from('property_reviews').insert({
      property_id: propertyId,
      student_name,
      rating,
      comment,
      is_approved: false
    });

    if (error) throw error;
    
    const { revalidatePath } = require('next/cache');
    revalidatePath('/property/[slug]', 'page');
    
    return { success: true };
  } catch (err) {
    console.error('Error submitting review:', err);
    return { success: false, error: err.message };
  }
}
