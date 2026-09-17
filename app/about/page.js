'use client';

import Image from 'next/image';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/images/greater_noida_cityscape.jpg"
            alt="Greater Noida Background"
            fill
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <h1>About StayNox</h1>
          <p>Helping students and professionals find their perfect home away from home in Greater Noida</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.story}>
          <div className={styles.storyText}>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>Our Story</h2>
            <p>
              Founded in 2024, StayNox was born out of a simple observation: finding quality PGs and hostels in Greater Noida was unnecessarily complicated. Students arriving for colleges like Galgotias, GL Bajaj, and NIET often faced a chaotic process filled with unreliable middlemen and misleading photos.
            </p>
            <p>
              We decided to change that. StayNox brings transparency, trust, and convenience to the accommodation search. Based right here in Greater Noida, our team personally verifies every listing to ensure what you see is what you get.
            </p>
            <p>
              Whether you are a student embarking on your college journey or a professional starting a new job, we are here to help you find your perfect home away from home.
            </p>
          </div>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/greater_noida_cityscape.jpg"
              alt="Greater Noida Cityscape"
              width={600}
              height={400}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.missionVision}>
          <div className={styles.glassCard}>
            <h3>Our Mission</h3>
            <p>
              To make finding a safe, comfortable, and affordable stay effortless for every student and professional in NCR. We strive to eliminate the hassle and uncertainty of finding reliable accommodation.
            </p>
          </div>
          <div className={styles.glassCard}>
            <h3>Our Vision</h3>
            <p>
              To become the most trusted accommodation platform across Delhi-NCR, redefining the standard of living for students and young professionals through technology and verified listings.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Choose StayNox</h2>
        <div className={styles.whyChooseGrid}>
          <div className={`${styles.glassCard} ${styles.featureCard}`}>
            <div className={styles.icon}>✅</div>
            <h4>Verified Properties</h4>
            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Every listing is personally verified by our team.</p>
          </div>
          <div className={`${styles.glassCard} ${styles.featureCard}`}>
            <div className={styles.icon}>💰</div>
            <h4>Best Prices</h4>
            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Direct connections with owners, no middleman fees.</p>
          </div>
          <div className={`${styles.glassCard} ${styles.featureCard}`}>
            <div className={styles.icon}>📸</div>
            <h4>Real Photos</h4>
            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>What you see on the platform is what you get.</p>
          </div>
          <div className={`${styles.glassCard} ${styles.featureCard}`}>
            <div className={styles.icon}>🤝</div>
            <h4>24/7 Support</h4>
            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Our team is always here to assist you.</p>
          </div>
        </div>
      </section>


    </div>
  );
}
