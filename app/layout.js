import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'StayNox | Find PGs & Hostels in Greater Noida',
  description: 'Discover the best PGs and hostels tailored for students and professionals in Greater Noida. Premium stays made simple with StayNox.',
  verification: {
    google: '4DEEgiMMYn2anisoZZZ_Y5fbHiCpq3N7h5NCLaPxfKs',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="4DEEgiMMYn2anisoZZZ_Y5fbHiCpq3N7h5NCLaPxfKs" />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
