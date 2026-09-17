'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './login.module.css';

export default function OwnerLogin() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate authentication
    setTimeout(() => {
      setLoading(false);
      router.push('/owner/dashboard');
    }, 1500);
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
          {!isLogin && (
            <div className={styles.field}>
              <label>Full Name</label>
              <input type="text" required placeholder="John Doe" />
            </div>
          )}
          <div className={styles.field}>
            <label>Email Address</label>
            <input type="email" required placeholder="owner@example.com" />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" required placeholder="••••••••" />
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
