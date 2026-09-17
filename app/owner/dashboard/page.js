'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase/client';
import styles from './dashboard.module.css';

export default function OwnerDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/owner/login');
        return;
      }

      // Fetch owner profile
      const { data: ownerData } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (ownerData) {
        setOwner(ownerData);
        // Fetch properties for this owner
        const { data: propsData } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', ownerData.id);
        
        if (propsData) setProperties(propsData);
      }
      setLoading(false);
    };

    fetchDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/owner/login');
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  }
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Owner Dashboard</h1>
          <div className={styles.headerActions}>
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Views</h3>
            <p className={styles.statValue}>342</p>
          </div>
          <div className={styles.statCard}>
            <h3>WhatsApp Leads</h3>
            <p className={styles.statValue}>12</p>
          </div>
          <div className={styles.statCard}>
            <h3>Active Listings</h3>
            <p className={styles.statValue}>1</p>
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <h2>My Properties</h2>
          <button className={styles.addBtn}>+ Add Property</button>
        </div>

        <div className={styles.propertyList}>
          {properties.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't listed any properties yet.</p>
              <button className={styles.addBtn}>List your first property</button>
            </div>
          ) : (
            properties.map(prop => (
              <motion.div 
                key={prop.id} 
                className={styles.propertyCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={styles.propInfo}>
                  <div className={styles.propTitle}>
                    <h3>{prop.name}</h3>
                    <span className={styles.badge}>{prop.type}</span>
                    <span className={`${styles.statusBadge} ${prop.status === 'active' ? styles.active : ''}`}>
                      {prop.status === 'active' ? 'Live' : 'Hidden'}
                    </span>
                  </div>
                  <div className={styles.propMeta}>
                    <span>👀 {prop.views} views</span>
                    <span>💬 {prop.leads} leads</span>
                  </div>
                </div>

                <div className={styles.propActions}>
                  <div className={styles.subInfo}>
                    <p>Subscription ends: <strong>{prop.subscription_end}</strong></p>
                    <Link href="/owner/paywall" className={styles.renewLink}>Renew Plan</Link>
                  </div>
                  <button className={styles.editBtn}>Edit</button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
