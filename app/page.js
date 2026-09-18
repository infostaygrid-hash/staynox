'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import PropertyCard from './components/PropertyCard';
import VibeMatch from './components/VibeMatch';
import { getFeaturedProperties } from '@/app/data/properties';

const AREAS = [
  { name: 'Knowledge Park', icon: '🎓', desc: 'Near GNIOT, Galgotias, Bennett' },
  { name: 'Alpha I & II',   icon: '🏙️', desc: 'Prime residential sectors' },
  { name: 'Beta I & II',    icon: '🌿', desc: 'Quiet, green locality' },
  { name: 'Pari Chowk',    icon: '🚇', desc: 'Metro connected hub' },
  { name: 'Sector 62',      icon: '🏢', desc: 'Corporate & student belt' },
  { name: 'Omicron',        icon: '🏘️', desc: 'Affordable PGs & hostels' },
];

export default function Home() {
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['PG', 'Hostel', 'Stay'];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('All');
  const [showSticky, setShowSticky] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySent, setNotifySent] = useState(false);
  const propertiesRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);

    const loadProperties = async () => {
      const data = await getFeaturedProperties();
      setFeaturedProperties(data);
    };
    loadProperties();

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (searchType !== 'All') params.set('type', searchType);
    router.push(`/listings?${params.toString()}`);
  };

  const handleAreaClick = (area) => {
    router.push(`/listings?area=${encodeURIComponent(area.name)}`);
  };

  const handleNotify = (e) => {
    e.preventDefault();
    setNotifySent(true);
    setNotifyEmail('');
  };

  return (
    <div className={styles.container}>

      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/images/greater_noida_evening.jpg"
            alt="Greater Noida Evening"
            fill
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroPill}>📍 Greater Noida</div>
          <h1 className={styles.headline}>
            Find Your Perfect{' '}
            <span className={styles.animatedWord}>{words[currentWord]}</span>
          </h1>
          <p className={styles.subtitle}>
            Verified PGs & Hostels for students and working professionals
          </p>

          <form className={styles.searchBar} onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by area or property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className={styles.searchSelect}
            >
              <option value="All">All Types</option>
              <option value="PG">PG</option>
              <option value="Hostel">Hostel</option>
              <option value="Flat">Flat</option>
            </select>
            <button type="submit" className={styles.searchButton}>Search</button>
          </form>

          <div className={styles.heroQuickLinks}>
            <span className={styles.heroQuickLabel}>Popular:</span>
            {['Knowledge Park', 'Alpha I', 'Pari Chowk'].map(area => (
              <button
                key={area}
                className={styles.heroQuickChip}
                onClick={() => router.push(`/listings?area=${encodeURIComponent(area)}`)}
              >{area}</button>
            ))}
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollText}>Scroll To Explore</div>
          <div className={styles.bounceArrow}>↓</div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className={styles.trustBar}>
        <div className={styles.trustBarInner}>
          <div className={styles.trustItem}>✅ Verified Listings</div>
          <div className={styles.trustDot} />
          <div className={styles.trustItem}>💬 Direct WhatsApp Contact</div>
          <div className={styles.trustDot} />
          <div className={styles.trustItem}>🔒 No Brokerage</div>
          <div className={styles.trustDot} />
          <div className={styles.trustItem}>📍 Greater Noida</div>
        </div>
      </section>

      {/* ── Vibe Match Section ── */}
      <section className={styles.vibeSection}>
        <div className={styles.centerHeader}>
          <h2 className={styles.sectionTitle}>Find Your Vibe</h2>
          <p className={styles.sectionSubtitle}>Take our quick quiz to find your perfect stay.</p>
        </div>
        <VibeMatch />
      </section>



      {/* ── Popular Areas ── */}
      <section className={styles.areasSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Popular Areas</h2>
          <p className={styles.sectionSubtitle}>Browse PGs & hostels by neighbourhood</p>
        </div>
        <div className={styles.areasGrid}>
          {AREAS.map((area) => (
            <button
              key={area.name}
              className={styles.areaCard}
              onClick={() => handleAreaClick(area)}
            >
              <span className={styles.areaIcon}>{area.icon}</span>
              <div>
                <div className={styles.areaName}>{area.name}</div>
                <div className={styles.areaDesc}>{area.desc}</div>
              </div>
              <span className={styles.areaArrow}>→</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <section className={styles.featuredSection} ref={propertiesRef}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Properties</h2>
          <Link href="/listings" className={styles.viewAllLink}>View All →</Link>
        </div>

        {featuredProperties.length > 0 ? (
          <div className={styles.propertiesGrid}>
            {featuredProperties.slice(0, 6).map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className={styles.noPropertiesYet}>
            <div className={styles.noPropertiesIcon}>🏠</div>
            <h3>New listings coming soon!</h3>
            <p>Be the first to know when new PGs are added in your area.</p>
            {!notifySent ? (
              <form className={styles.notifyForm} onSubmit={handleNotify}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.value)}
                  required
                  className={styles.notifyInput}
                />
                <button type="submit" className={styles.notifyBtn}>Notify Me</button>
              </form>
            ) : (
              <div className={styles.notifySuccess}>🎉 You're on the list! We'll notify you.</div>
            )}
          </div>
        )}
      </section>

      {/* ── How It Works ── */}
      <section className={styles.howItWorksSection}>
        <div className={styles.centerHeader}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>Find your perfect stay in 3 simple steps</p>
        </div>
        <div className={styles.stepsContainer}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepIcon}>🔍</div>
            <h3>Search</h3>
            <p>Browse PGs & hostels by location, budget, and amenities.</p>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepIcon}>🏠</div>
            <h3>Compare</h3>
            <p>Compare prices, facilities, photos, and house rules side by side.</p>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepIcon}>💬</div>
            <h3>Connect</h3>
            <p>Contact owners directly on WhatsApp — no agents, no brokerage.</p>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to find your perfect stay?</h2>
          <p>Browse all verified PGs & Hostels in Greater Noida</p>
          <Link href="/listings" className={styles.ctaButton}>
            Explore All Properties
          </Link>
        </div>
      </section>

      {/* ── Mobile Sticky Search ── */}
      <div className={`${styles.mobileStickySearch} ${showSticky ? styles.showSticky : ''}`}>
        <button className={styles.stickySearchBtn} onClick={() => router.push('/listings')}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          Quick Search PGs
        </button>
      </div>

    </div>
  );
}
