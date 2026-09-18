'use client';
import { useState } from 'react';
import { submitReview } from '@/app/actions/reviews';
import styles from '../property/[slug]/page.module.css';

export default function ReviewsSection({ propertyId, reviews }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    const formData = new FormData(e.target);
    const result = await submitReview(propertyId, formData);
    
    if (result.success) {
      setMessage('✅ Review submitted successfully!');
      e.target.reset();
    } else {
      setMessage('❌ Failed to submit review: ' + result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
      <h2>Student Reviews</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        {reviews && reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} style={{ background: 'var(--surface-soft)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>{review.student_name}</strong>
                <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>{'?'.repeat(review.rating)}{'?'.repeat(5 - review.rating)}</span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{review.comment}</p>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                {new Date(review.created_at).toLocaleDateString()}
              </small>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review this property!</p>
        )}
      </div>

      <div style={{ background: 'var(--surface-soft)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Write a Review</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Your Name</label>
            <input name="student_name" type="text" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }} placeholder="John Doe" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Rating</label>
            <select name="rating" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Comment</label>
            <textarea name="comment" required rows="4" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', resize: 'vertical' }} placeholder="How was your stay?"></textarea>
          </div>
          
          <button type="submit" disabled={isSubmitting} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>

          {message && <p style={{ marginTop: '1rem', fontWeight: 500, color: message.includes('?') ? '#ef4444' : 'var(--success)' }}>{message}</p>}
        </form>
      </div>
    </div>
  );
}
