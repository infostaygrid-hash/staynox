'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './paywall.module.css';

export default function Paywall() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSimulatePayment = () => {
    setLoading(true);
    // Simulate Razorpay popup delay
    setTimeout(() => {
      alert("✅ Payment Successful! (Simulated)\nYour property is now live on StayNox.");
      setLoading(false);
      router.push('/owner/dashboard');
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className={styles.header}>
          <h2>Go Premium 🚀</h2>
          <p>Get your property in front of thousands of students looking for a place to stay.</p>
        </div>

        <div className={styles.pricing}>
          <div className={styles.priceAmount}>₹499<span className={styles.month}>/mo</span></div>
          <p className={styles.priceDesc}>Billed monthly per property</p>
        </div>

        <ul className={styles.features}>
          <li>✅ Instant listing on StayNox search</li>
          <li>✅ Direct WhatsApp leads (Zero Brokerage)</li>
          <li>✅ Dashboard analytics & view counts</li>
          <li>✅ Priority support</li>
        </ul>

        <button 
          className={styles.payBtn} 
          onClick={handleSimulatePayment}
          disabled={loading}
        >
          {loading ? 'Processing Payment...' : 'Pay via Razorpay (Simulated)'}
        </button>

        <button className={styles.backBtn} onClick={() => router.back()}>
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}
