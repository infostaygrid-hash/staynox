'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/', icon: '??' },
    { name: 'Search', path: '/listings', icon: '??' },
    { name: 'Saved', path: '/wishlist', icon: '??' },
    { name: 'Admin', path: '/admin', icon: '??' },
  ];

  // Do not render bottom nav on admin pages to keep admin UI clean
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link 
            key={item.name} 
            href={item.path} 
            className={${styles.navItem} }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
