'use client';

import { useState, useEffect } from 'react';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from local storage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('staygrid_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist from local storage', e);
      }
    }
  }, []);

  const toggleWishlist = (propertyId) => {
    setWishlist((prev) => {
      const isSaved = prev.includes(propertyId);
      const newWishlist = isSaved
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];
      
      localStorage.setItem('staygrid_wishlist', JSON.stringify(newWishlist));
      
      // Dispatch a custom event so other components (like Navbar) can update immediately
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: newWishlist }));
      
      return newWishlist;
    });
  };

  const isInWishlist = (propertyId) => wishlist.includes(propertyId);

  return { wishlist, toggleWishlist, isInWishlist };
}
