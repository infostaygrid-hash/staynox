'use client';
import { useState } from 'react';
import styles from './PropertyForm.module.css';

export default function PropertyForm({ onClose, onSave, initialData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    name: '', type: 'PG', gender: 'Boys', city: 'Greater Noida', area: '',
    address: '', description: '', featured: false, video_url: '', vertical_video_url: '',
    established: new Date().getFullYear().toString(), commute_times: '',
    prices: { single: '', double: '', triple: '' },
    amenities: '', rules: '', images: ''
  });

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
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{initialData ? 'Edit Property' : 'Add New Property'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
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
              <div className={`${styles.field} ${styles.checkboxField}`} style={{ gridColumn: '1 / -1' }}>
                <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} />
                <label htmlFor="featured">Featured Property (Shows on Homepage Carousel)</label>
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
                <label>Commute Times (e.g. Sharda University: 5 mins walk, Metro: 10 mins drive)</label>
                <input type="text" name="commute_times" value={formData.commute_times} onChange={handleChange} />
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Images (Comma separated URLs)</label>
                <textarea name="images" value={formData.images} onChange={handleChange} rows="2" placeholder="https://imgur.com/image1.jpg, https://imgur.com/image2.jpg" />
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Video Walkthrough (YouTube URL)</label>
                <input type="url" name="video_url" value={formData.video_url} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Vertical Video Tours (YouTube Shorts, IG Reels, or MP4 - Comma Separated)</label>
                <input type="text" name="vertical_video_url" value={formData.vertical_video_url} onChange={handleChange} placeholder="e.g. https://youtube.com/shorts/..., https://instagram.com/reel/..." />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
