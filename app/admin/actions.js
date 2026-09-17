'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData) {
  const password = formData.get('password');
  
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', password, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
    return { success: true };
  }
  
  return { success: false, error: 'Invalid password' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin/login');
}

import { createClient } from '@supabase/supabase-js';

export async function saveProperty(formData) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_token')?.value !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use Service Role Key if available to bypass RLS for admin tasks. Fallback to ANON (which will fail RLS).
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Parse arrays
  const parseCommaList = (str) => (str ? str.split(',').map(s => s.trim()).filter(Boolean) : []);
  const amenitiesList = parseCommaList(formData.amenities);
  const rulesList = parseCommaList(formData.rules);
  const imagesList = parseCommaList(formData.images);

  // 1. Insert/Update Property
  let propertyId;
  const propData = {
    name: formData.name,
    type: formData.type,
    gender: formData.gender,
    city: formData.city,
    area: formData.area,
    address: formData.address,
    description: formData.description,
    established: formData.established,
    video_url: formData.video_url || null,
    commute_times: formData.commute_times || null,
    featured: formData.featured
  };

  if (formData.id) {
    propertyId = formData.id;
    const { error } = await supabase.from('properties').update(propData).eq('id', propertyId);
    if (error) return { success: false, error: error.message };
  } else {
    // Generate slug from name
    propData.slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await supabase.from('properties').insert([propData]).select().single();
    if (error) return { success: false, error: error.message };
    propertyId = data.id;
  }

  // 2. Upsert Prices
  if (formData.prices) {
    await supabase.from('property_prices').delete().eq('property_id', propertyId);
    const { single, double, triple } = formData.prices;
    if (single || double || triple) {
      await supabase.from('property_prices').insert([{
        property_id: propertyId,
        single: single ? Number(single) : null,
        double: double ? Number(double) : null,
        triple: triple ? Number(triple) : null,
      }]);
    }
  }

  // 3. Upsert Amenities
  await supabase.from('property_amenities').delete().eq('property_id', propertyId);
  if (amenitiesList.length > 0) {
    await supabase.from('property_amenities').insert(
      amenitiesList.map(amenity => ({ property_id: propertyId, amenity }))
    );
  }

  // 4. Upsert Rules
  await supabase.from('property_rules').delete().eq('property_id', propertyId);
  if (rulesList.length > 0) {
    await supabase.from('property_rules').insert(
      rulesList.map(rule => ({ property_id: propertyId, rule }))
    );
  }

  // 5. Upsert Images
  await supabase.from('property_images').delete().eq('property_id', propertyId);
  if (imagesList.length > 0) {
    await supabase.from('property_images').insert(
      imagesList.map((url, index) => ({ property_id: propertyId, url, sort_order: index }))
    );
  }

  return { success: true, id: propertyId };
}

export async function approvePayment(ownerId) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_token')?.value !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use Service Role Key if available to bypass RLS for admin tasks.
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Set owner subscription to active
  const { error: ownerErr } = await supabase
    .from('owners')
    .update({ subscription_status: 'active' })
    .eq('id', ownerId);

  if (ownerErr) return { success: false, error: ownerErr.message };

  // Set owner's properties to active
  const { error: propErr } = await supabase
    .from('properties')
    .update({ is_active: true })
    .eq('owner_id', ownerId);

  if (propErr) return { success: false, error: propErr.message };

  return { success: true };
}
