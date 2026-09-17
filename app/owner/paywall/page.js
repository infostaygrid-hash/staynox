'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase/client';
import styles from './paywall.module.css';

export default function Paywall() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [utr, setUtr] = useState('');
  const [ownerId, setOwnerId] = useState(null);

  const UPI_ID = '9518416021@ybl';
  const AMOUNT = '499';
  const UPI_URI = `upi://pay?pa=${UPI_ID}&pn=StayNox&am=${AMOUNT}&cu=INR`;
  const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(UPI_URI)}`;

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

  const handleSubmitUTR = async (e) => {
    e.preventDefault();
    if (!ownerId) {
      alert("Error: Owner profile not found.");
      return;
    }
    if (utr.length < 12) {
      alert("Please enter a valid 12-digit UTR / Reference Number.");
      return;
    }
    
    setLoading(true);
    try {
      // Store UTR in subscription_status to avoid requiring a DB schema migration for MVP
      const { error } = await supabase
        .from('owners')
        .update({ subscription_status: `pending_${utr}` })
        .eq('id', ownerId);

      if (error) throw error;
      
      alert("Payment Details Submitted!\nStayNox Admin will verify and activate your property shortly.");
      router.push('/owner/dashboard');
    } catch (err) {
      alert("Error submitting payment details. Please contact support.");
    } finally {
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
          <h2>Go Premium 🚀</h2>
          <p>Scan the QR code with any UPI app (GPay, PhonePe, Paytm) to activate your listing.</p>
        </div>

        <div className={styles.pricing}>
          <img src={QR_URL} alt="UPI QR Code" className={styles.qrCode} />
          <div className={styles.priceAmount}>₹{AMOUNT}<span className={styles.month}>/mo</span></div>
          <p className={styles.priceDesc}>Scan to pay <strong>{UPI_ID}</strong></p>
        </div>

        <form onSubmit={handleSubmitUTR} className={styles.utrForm}>
          <label>Enter 12-Digit UTR / Reference No.</label>
          <input 
            type="text" 
            value={utr} 
            onChange={(e) => setUtr(e.target.value)} 
            placeholder="e.g. 312345678901"
            required
            className={styles.utrInput}
          />
          <button 
            type="submit"
            className={styles.payBtn} 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'I have paid! Verify Payment'}
          </button>
        </form>

        <button className={styles.backBtn} onClick={() => router.back()}>
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}
