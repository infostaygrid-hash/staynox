'use client';
import { useState } from 'react';
import { submitRoommateProfile } from '@/app/actions/roommates';
import styles from './page.module.css';

export default function FormClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    const formData = new FormData(e.target);
    const result = await submitRoommateProfile(formData);
    
    if (result.success) {
      setMessage('✅ Profile posted successfully!');
      e.target.reset();
    } else {
      setMessage('❌ Failed: ' + result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.formCard}>
      <h3>Post a Profile</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label>Name</label>
          <input name="name" type="text" required placeholder="John Doe" />
        </div>
        <div className={styles.field}>
          <label>Gender</label>
          <select name="gender" required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className={styles.field}>
          <label>College / University</label>
          <input name="college" type="text" required placeholder="e.g. Sharda University" />
        </div>
        <div className={styles.field}>
          <label>Max Budget (per month ₹)</label>
          <input name="budget_max" type="number" required placeholder="12000" />
        </div>
        <div className={styles.field}>
          <label>Bio & Preferences</label>
          <textarea name="bio" required rows="3" placeholder="I'm a quiet CS student looking for a double sharing room. Non-smoker." />
        </div>
        <div className={styles.field}>
          <label>WhatsApp Number</label>
          <input name="whatsapp" type="tel" required placeholder="9876543210" />
        </div>
        
        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Profile'}
        </button>

        {message && <p style={{ marginTop: '1rem', fontWeight: 500, color: message.includes('❌') ? '#ef4444' : 'var(--success)' }}>{message}</p>}
      </form>
    </div>
  );
}
