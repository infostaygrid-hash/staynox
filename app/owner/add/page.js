'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import styles from './add.module.css';

export default function OwnerAddProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', type: 'PG', gender: 'Boys', city: 'Greater Noida', area: '',
    address: '', description: '', video_url: '',
    established: new Date().getFullYear().toString(), commute_times: '',
    prices: { single: '', double: '', triple: '' },
    amenities: '', rules: '', images: ''
  });

  useEffect(() => {
    const fetchOwner = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/owner/login');
        return;
      }
      const { data: ownerData } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
      if (ownerData) setOwnerId(ownerData.id);
    };
    fetchOwner();
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('price_')) {
      const priceType = name.split('_')[1];
      setFormData(prev => ({ ...prev, prices: { ...prev.prices, [priceType]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ownerId) {
      alert("Error: Owner profile not found.");
      return;
    }
    setLoading(true);

    try {
      // Create slug
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 5);

      const propertyPayload = {
        owner_id: ownerId,
        name: formData.name,
        slug,
        type: formData.type,
        gender: formData.gender,
        city: formData.city,
        area: formData.area,
        address: formData.address,
        description: formData.description,
        established: formData.established,
        commute_times: formData.commute_times,
        video_url: formData.video_url,
        featured: false,
        is_active: true // Active immediately for managed marketplace
      };

      const { data: prop, error: propError } = await supabase.from('properties').insert(propertyPayload).select().single();
      if (propError) throw propError;

      // Handle prices
      const priceUpdates = {};
      if (formData.prices.single) priceUpdates.single = parseInt(formData.prices.single);
      if (formData.prices.double) priceUpdates.double = parseInt(formData.prices.double);
      if (formData.prices.triple) priceUpdates.triple = parseInt(formData.prices.triple);
      if (Object.keys(priceUpdates).length > 0) {
        await supabase.from('property_prices').insert({ property_id: prop.id, ...priceUpdates });
      }

      // Handle amenities
      if (formData.amenities) {
        const ams = formData.amenities.split(',').map(s => s.trim()).filter(Boolean);
        const amsPayload = ams.map(a => ({ property_id: prop.id, amenity: a }));
        if (amsPayload.length > 0) await supabase.from('property_amenities').insert(amsPayload);
      }

      // Handle rules
      if (formData.rules) {
        const rules = formData.rules.split(',').map(s => s.trim()).filter(Boolean);
        const rulesPayload = rules.map(r => ({ property_id: prop.id, rule: r }));
        if (rulesPayload.length > 0) await supabase.from('property_rules').insert(rulesPayload);
      }

      // Handle images
      if (formData.images) {
        const imgs = formData.images.split(',').map(s => s.trim()).filter(Boolean);
        const imgsPayload = imgs.map((img, idx) => ({ property_id: prop.id, url: img, sort_order: idx }));
        if (imgsPayload.length > 0) await supabase.from('property_images').insert(imgsPayload);
      }

      alert("Property Added Successfully! Please subscribe to make it live.");
      router.push('/owner/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to save property. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1>Add New Property</h1>
          <button className={styles.backBtn} onClick={() => router.back()}>Cancel</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h3>Basic Details</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Property Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="PG">PG</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Flat">Flat</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Co-ed">Co-ed</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Established Year</label>
                <input type="text" name="established" value={formData.established} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>Area (e.g., Knowledge Park III)</label>
                <input required type="text" name="area" value={formData.area} onChange={handleChange} />
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Full Address</label>
                <textarea required name="address" value={formData.address} onChange={handleChange} rows="2" />
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Pricing (Leave blank if N/A)</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Single Sharing (₹)</label>
                <input type="number" name="price_single" value={formData.prices.single} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>Double Sharing (₹)</label>
                <input type="number" name="price_double" value={formData.prices.double} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <label>Triple Sharing (₹)</label>
                <input type="number" name="price_triple" value={formData.prices.triple} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Features & Media</h3>
            <div className={styles.grid}>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Amenities (Comma separated: WiFi, AC, Food, Laundry)</label>
                <input type="text" name="amenities" value={formData.amenities} onChange={handleChange} />
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Rules (Comma separated: No smoking, No guests after 10 PM)</label>
                <input type="text" name="rules" value={formData.rules} onChange={handleChange} />
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Commute Times (e.g. Sharda University: 5 mins walk)</label>
                <input type="text" name="commute_times" value={formData.commute_times} onChange={handleChange} />
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Images (Comma separated URLs)</label>
                <textarea name="images" value={formData.images} onChange={handleChange} rows="2" placeholder="https://imgur.com/img1.jpg, https://imgur.com/img2.jpg" />
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Video Walkthrough (YouTube URL)</label>
                <input type="url" name="video_url" value={formData.video_url} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitBtn} disabled={loading || !ownerId}>
              {loading ? 'Saving Property...' : 'Save & Continue to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
