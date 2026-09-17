'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import styles from '../admin/login/page.module.css'; // Reusing the login CSS for consistency

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user actually has a valid session to reset password
    // Supabase automatically parses the token from the URL and logs them in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage({ text: 'Invalid or expired reset link. Please request a new one.', type: 'error' });
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const { error } = await supabase.auth.updateUser({ password });

    setIsLoading(false);
    
    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Password successfully updated! Redirecting to home...', type: 'success' });
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1>Set New Password</h1>
        <p>Please enter your new password below.</p>
        
        {message.text && (
          <div className={styles.error} style={{ 
            background: message.type === 'success' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255, 71, 87, 0.1)',
            borderColor: message.type === 'success' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(255, 71, 87, 0.3)',
            color: message.type === 'success' ? '#14b8a6' : '#ff4757' 
          }}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleReset} className={styles.form}>
          <input 
            type="password" 
            placeholder="New password (min 6 characters)" 
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            minLength={6}
          />
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
