import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PropertyManager from './components/PropertyManager';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  // 1. Auth Check
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || token !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login');
  }

  // Admin Client (Bypasses RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminSupabase = createClient(supabaseUrl, supabaseKey);

  // 2. Fetch Data
  const { data: properties, error: propsError } = await adminSupabase
    .from('properties')
    .select(`
      *,
      property_prices (*),
      property_amenities (amenity),
      property_images (url, sort_order),
      property_rules (rule)
    `)
    .order('created_at', { ascending: false });

  const { data: enquiries, error: enqError } = await adminSupabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: pendingOwners, error: pendingError } = await adminSupabase
    .from('owners')
    .select('*')
    .like('subscription_status', 'pending_%');

  const { data: allOwners, error: allOwnersError } = await adminSupabase
    .from('owners')
    .select('*')
    .order('created_at', { ascending: false });

  if (propsError) console.error(propsError);
  if (enqError) console.error(enqError);
  if (pendingError) console.error(pendingError);
  if (allOwnersError) console.error(allOwnersError);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here is what's happening today.</p>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <h3>Total Properties</h3>
          <div className={styles.statValue}>{properties?.length || 0}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Leads (Enquiries)</h3>
          <div className={styles.statValue}>{enquiries?.length || 0}</div>
        </div>
        <div className={styles.statCard} style={{ borderColor: 'var(--primary)', background: '#E5F3E7' }}>
          <h3>Pending Payments</h3>
          <div className={styles.statValue} style={{ color: 'var(--primary)' }}>{pendingOwners?.length || 0}</div>
        </div>
      </div>

      {pendingOwners?.length > 0 && (
        <section className={styles.card} style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
          <h2>Action Required: Pending Payments</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Owner Name</th>
                  <th>Email</th>
                  <th>Submitted UTR</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingOwners.map(owner => (
                  <tr key={owner.id}>
                    <td>{owner.full_name}</td>
                    <td>{owner.email}</td>
                    <td><strong style={{ background: '#FFF3CD', padding: '4px 8px', borderRadius: '4px' }}>{owner.subscription_status.replace('pending_', '')}</strong></td>
                    <td>
                      <form action={async () => {
                        'use server';
                        const { approvePayment } = await import('./actions.js');
                        await approvePayment(owner.id);
                      }}>
                        <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Approve Payment
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Recent Enquiries</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Subject</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {enquiries?.length === 0 ? (
                  <tr><td colSpan="5" className={styles.empty}>No enquiries yet.</td></tr>
                ) : (
                  enquiries?.slice(0, 10).map((enq) => (
                    <tr key={enq.id}>
                      <td>{new Date(enq.created_at).toLocaleDateString()}</td>
                      <td>{enq.name}</td>
                      <td>
                        <a href={`tel:${enq.phone}`}>{enq.phone}</a><br/>
                        <a href={`mailto:${enq.email}`}>{enq.email}</a>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${
                          enq.subject?.toLowerCase().includes('booking') ? styles.badgeSuccess : 
                          enq.subject?.toLowerCase().includes('support') ? styles.badgeWarning : ''
                        }`}>
                          {enq.subject || 'General'}
                        </span>
                      </td>
                      <td className={styles.messageCell}>{enq.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <PropertyManager initialProperties={properties} />
      </div>

      {/* All Registered Owners */}
      <section className={styles.card} style={{ marginTop: '2rem' }}>
        <h2>All Registered Owners ({allOwners?.length || 0})</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Properties</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(!allOwners || allOwners.length === 0) ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No owners registered yet.</td></tr>
              ) : (
                allOwners.map(owner => {
                  const ownerProps = properties?.filter(p => p.owner_id === owner.id) || [];
                  const status = owner.subscription_status?.startsWith('pending_') ? 'Pending'
                    : owner.subscription_status === 'active' ? 'Active' : 'Inactive';
                  const statusColor = status === 'Active' ? '#1A5E28' : status === 'Pending' ? '#856404' : '#e74c3c';
                  const statusBg = status === 'Active' ? '#E5F3E7' : status === 'Pending' ? '#FFF3CD' : '#fdf1f0';
                  return (
                    <tr key={owner.id}>
                      <td><strong>{owner.full_name}</strong></td>
                      <td>{owner.email}</td>
                      <td>{owner.phone || '—'}</td>
                      <td><span style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>{status}</span></td>
                      <td>{ownerProps.length}</td>
                      <td>{new Date(owner.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
