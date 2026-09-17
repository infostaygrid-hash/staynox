'use client';

import { useState, useEffect } from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { supabase } from '@/utils/supabase/client';
import PropertyCard from '../components/PropertyCard';
import styles from '../listings/page.module.css';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistedProperties = async () => {
      setIsLoading(true);
      
      if (wishlist.length === 0) {
        setProperties([]);
        setIsLoading(false);
        return;
      }

      // Fetch only the properties that are in the wishlist
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_prices (*),
          property_amenities (amenity),
          property_images (url, sort_order),
          property_rules (rule)
        `)
        .in('id', wishlist);

      if (error) {
        console.error('Error fetching wishlist:', error);
      } else {
        // Format the data similarly to how we do in properties.js
        const formatted = data.map(p => ({
          ...p,
          price: p.property_prices?.[0] ? {
            single: p.property_prices[0].single_price,
            double: p.property_prices[0].double_price,
            triple: p.property_prices[0].triple_price,
          } : {},
          amenities: p.property_amenities?.map(a => a.amenity) || [],
          images: p.property_images?.sort((a, b) => a.sort_order - b.sort_order).map(i => i.url) || [],
          rules: p.property_rules?.map(r => r.rule) || [],
          reviews: p.reviews || 0
        }));
        setProperties(formatted);
      }
      
      setIsLoading(false);
    };

    fetchWishlistedProperties();
  }, [wishlist]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>Your Wishlist</h1>
          <p className={styles.subtitle}>
            {wishlist.length === 0 
              ? "You haven't saved any properties yet." 
              : `You have saved ${wishlist.length} properties.`}
          </p>
        </div>
      </div>

      <div className={styles.resultsSection}>
        <div className={styles.container}>
          {isLoading ? (
            <div className={styles.loading}>Loading your saved properties...</div>
          ) : properties.length === 0 ? (
            <div className={styles.noResults}>
              <h3>No properties saved yet!</h3>
              <p>Go to the properties page and click the heart icon on properties you like to save them here.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
