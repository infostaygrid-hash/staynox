import { createClient } from '@supabase/supabase-js';
import styles from './page.module.css';
import FormClient from './FormClient';

export const revalidate = 0; // Force dynamic to always show new profiles

export default async function RoommatesPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: roommates } = await supabase
    .from('roommates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Find a Roommate 🤝</h1>
        <p>Looking for someone to split a double or triple room with? Find your perfect match here.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.list}>
          {roommates?.length > 0 ? (
            roommates.map(r => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.name}>{r.name}</span>
                  <span className={styles.genderBadge}>{r.gender}</span>
                </div>
                <div className={styles.details}>
                  <span>🎓 {r.college}</span>
                  <span>💰 Max Budget: ₹{r.budget_max}</span>
                </div>
                <p className={styles.bio}>"{r.bio}"</p>
                
                {(() => {
                  const waClean = r.whatsapp.replace(/[^0-9]/g, '');
                  const waNumber = waClean.length === 10 ? '91' + waClean : waClean;
                  return (
                    <a 
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${r.name}! I saw your profile on StayNox and I'm also looking for a roommate in Greater Noida.`)}`}
                      target="_blank" rel="noreferrer" className={styles.contactBtn}
                    >
                      Connect on WhatsApp
                    </a>
                  );
                })()}
              </div>
            ))
          ) : (
            <p>No roommates found. Be the first to post a profile!</p>
          )}
        </div>

        <div>
          <FormClient />
        </div>
      </div>
    </div>
  );
}
