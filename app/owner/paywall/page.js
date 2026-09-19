'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase/client';
import styles from './paywall.module.css';

export default function Paywall() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const AMOUNT = 499;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
        if (data) setOwnerId(data.id);
      }
    };
    fetchUser();
  }, []);

  const handlePhonePeCheckout = async () => {
    if (!ownerId) {
      alert("Error: Owner profile not found.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/phonepe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: AMOUNT, ownerId: ownerId, propertyId: 'premium_listing' })
      });
      
      const data = await res.json();
      
      if (data.success && data.redirectUrl) {
        // Redirect to PhonePe payment page
        window.location.href = data.redirectUrl;
      } else {
        alert("Could not initiate payment. " + (data.message || ''));
        setLoading(false);
      }
    } catch (err) {
      alert("Error connecting to payment gateway.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className={styles.header}>
          <h2>Go Premium ??</h2>
          <p>Upgrade your account to list properties on StayNox and get verified leads instantly.</p>
        </div>

        <div className={styles.pricing}>
          <div className={styles.priceAmount}>?{AMOUNT}<span className={styles.month}>/mo</span></div>
          <p className={styles.priceDesc}>Secure payment via <strong>PhonePe</strong></p>
        </div>

        <button 
          onClick={handlePhonePeCheckout}
          className={styles.payBtn} 
          disabled={loading}
          style={{ width: '100%', padding: '16px', background: '#5f259f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
        >
          {loading ? 'Connecting to PhonePe...' : 'Pay via PhonePe'}
        </button>

        <button className={styles.backBtn} onClick={() => router.back()} style={{ width: '100%', background: 'none', border: 'none', marginTop: '15px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}
