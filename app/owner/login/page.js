'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase/client';
import styles from './login.module.css';

export default function OwnerLogin() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const form = new FormData(e.target);
    const email = form.get('email');
    const password = form.get('password');
    const fullName = form.get('fullName');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/owner/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName, user_role: 'owner' }
          }
        });
        if (error) throw error;
        
        // Ensure owner record is inserted via frontend if RLS allows or let database trigger handle it.
        // For MVP, we insert it manually
        if (data.user) {
          const { error: insertError } = await supabase.from('owners').insert([
            { user_id: data.user.id, email: email, full_name: fullName }
          ]);
          if (insertError) console.error("Error creating owner profile:", insertError);
        }

        alert("Account created successfully! Please sign in.");
        setIsLogin(true);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.header}>
          <h2>{isLogin ? 'Owner Login' : 'Partner with StayNox'}</h2>
          <p>{isLogin ? 'Manage your listed properties.' : 'Start earning by listing your PG, Hostel, or Flat.'}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMsg && <div style={{ color: '#e74c3c', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}
          {!isLogin && (
            <div className={styles.field}>
              <label>Full Name</label>
              <input type="text" name="fullName" required placeholder="John Doe" />
            </div>
          )}
          <div className={styles.field}>
            <label>Email Address</label>
            <input type="email" name="email" required placeholder="owner@example.com" />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" name="password" required placeholder="••••••••" />
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className={styles.footer}>
          <button className={styles.toggleBtn} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : "Already a partner? Log in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
