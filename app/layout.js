import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'StayNox | Find PGs & Hostels in Greater Noida',
  description: 'Discover the best PGs and hostels tailored for students and professionals in Greater Noida. Premium stays made simple with StayNox.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StayNox',
  },
  verification: {
    google: '4DEEgiMMYn2anisoZZZ_Y5fbHiCpq3N7h5NCLaPxfKs',
  },
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="4DEEgiMMYn2anisoZZZ_Y5fbHiCpq3N7h5NCLaPxfKs" />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main style={{ paddingBottom: '65px' }}>{children}</main>
        <BottomNav />
        <Footer />
        <AIChatbot />
        <Analytics />
      </body>
    </html>
  );
}
