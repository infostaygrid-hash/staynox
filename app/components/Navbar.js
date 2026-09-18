'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import AuthModal from './AuthModal';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const pathname = usePathname();

  // Handle theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('staygrid_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('staygrid_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = (e) => {
      setWishlistCount(e.detail.length);
    };
    
    const saved = localStorage.getItem('staygrid_wishlist');
    if (saved) {
      try {
        setWishlistCount(JSON.parse(saved).length);
      } catch (e) {}
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  const darkHeroPages = ['/', '/about', '/listings', '/wishlist'];
  const hasDarkHero = darkHeroPages.includes(pathname);
  const isLightText = !isScrolled && hasDarkHero;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/listings' },
    { name: 'Wishlist', path: '/wishlist', count: wishlistCount },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''} ${isLightText ? styles.lightText : ''}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoStay}>Stay</span>
            <span className={styles.logoGrid}>Nox</span>
          </Link>

          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`${styles.link} ${pathname === item.path ? styles.active : ''}`}
              >
                {item.name} {item.count > 0 && <span className={styles.badge}>{item.count}</span>}
              </Link>
            ))}
          </div>

          <div className={styles.actions}>
            <select className={styles.citySelect} defaultValue="greater-noida">
              <option value="greater-noida">Greater Noida</option>
              <option value="delhi">Delhi</option>
              <option value="gurgaon">Gurgaon</option>
              <option value="noida">Noida</option>
            </select>

            {user ? (
              <div className={styles.userMenu}>
                <span className={styles.userAvatar}>
                  {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </span>
                <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <button className={styles.loginBtn} onClick={() => setIsAuthOpen(true)}>
                Login / Sign Up
              </button>
            )}

            <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Dark Mode">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              className={`${styles.mobileMenuBtn} ${isMobileMenuOpen ? styles.menuOpen : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className={styles.hamburger}></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`${styles.mobileLink} ${pathname === item.path ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.name}
          </Link>
        ))}
        {user ? (
          <button className={styles.mobileLogoutBtn} onClick={handleLogout}>Logout</button>
        ) : (
          <button className={styles.mobileLoginBtn} onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }}>
            Login / Sign Up
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
