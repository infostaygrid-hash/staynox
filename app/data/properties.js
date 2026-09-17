import { supabase } from '@/utils/supabase/client';

const formatProperty = (p) => {
  if (!p) return null;
  return {
    ...p,
    price: p.property_prices?.[0] ? {
      single: p.property_prices[0].single,
      double: p.property_prices[0].double,
      triple: p.property_prices[0].triple,
    } : { single: null, double: null, triple: null },
    amenities: p.property_amenities ? p.property_amenities.map(a => a.amenity) : [],
    images: p.property_images ? p.property_images.sort((a, b) => a.sort_order - b.sort_order).map(i => i.url) : [],
    rules: p.property_rules ? p.property_rules.map(r => r.rule) : [],
    contact: { phone: p.phone, whatsapp: p.whatsapp },
    isVerified: p.is_verified !== undefined ? p.is_verified : (p.rating >= 4.5)
  };
};

export async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_prices (*),
      property_amenities (amenity),
      property_images (url, sort_order),
      property_rules (rule)
    `);
  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  return data.map(formatProperty);
}

export async function getPropertyById(id) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_prices (*),
      property_amenities (amenity),
      property_images (url, sort_order),
      property_rules (rule)
    `)
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching property by id:', error);
    return null;
  }
  return formatProperty(data);
}

export async function getPropertyBySlug(slug) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_prices (*),
      property_amenities (amenity),
      property_images (url, sort_order),
      property_rules (rule)
    `)
    .eq('slug', slug)
    .single();
  if (error) {
    console.error('Error fetching property by slug:', error);
    return null;
  }
  return formatProperty(data);
}

export async function getFeaturedProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_prices (*),
      property_amenities (amenity),
      property_images (url, sort_order),
      property_rules (rule)
    `)
    .eq('featured', true);
  if (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
  return data.map(formatProperty);
}

export async function filterProperties(filters = {}) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      property_prices (*),
      property_amenities!inner (amenity),
      property_images (url, sort_order),
      property_rules (rule)
    `);

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }
  if (filters.gender && filters.gender !== 'all') {
    query = query.eq('gender', filters.gender);
  }
  if (filters.billing && filters.billing !== 'all') {
    query = query.eq('billing_cycle', filters.billing);
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,area.ilike.%${filters.search}%`);
  }

  // Handle amenities filtering (requires all selected amenities to match)
  // This is a simplified approach; complex relational filtering might require a different query structure
  if (filters.amenities && filters.amenities.length > 0) {
    // We fetch all matching base filters, then filter in memory for amenities since
    // filtering by multiple child rows in Supabase can be complex.
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error filtering properties:', error);
    return [];
  }

  let results = data.map(formatProperty);

  // In-memory filter for amenities
  if (filters.amenities && filters.amenities.length > 0) {
    results = results.filter(p => 
      filters.amenities.every(amenity => p.amenities.includes(amenity))
    );
  }

  // In-memory filter for price range
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice || 0;
    const max = filters.maxPrice || Infinity;
    results = results.filter(p => {
      const minPropertyPrice = Math.min(
        p.price.triple || Infinity,
        p.price.double || Infinity,
        p.price.single || Infinity
      );
      return minPropertyPrice >= min && minPropertyPrice <= max;
    });
  }

  return results;
}

export async function getCities() {
  const { data, error } = await supabase.from('properties').select('city');
  if (error) return [];
  const uniqueCities = [...new Set(data.map(item => item.city))];
  return uniqueCities;
}

export async function getAreas() {
  const { data, error } = await supabase.from('properties').select('area');
  if (error) return [];
  const uniqueAreas = [...new Set(data.map(item => item.area))];
  return uniqueAreas;
}

export async function getTestimonials() {
  const { data, error } = await supabase.from('testimonials').select('*');
  if (error) return [];
  return data;
}

export async function submitEnquiry(enquiryData) {
  const { data, error } = await supabase.from('enquiries').insert([enquiryData]);
  if (error) {
    console.error('Error submitting enquiry:', error);
    return { success: false, error };
  }
  return { success: true, data };
}
