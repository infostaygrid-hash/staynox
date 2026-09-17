'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '../hooks/useWishlist';
import styles from './PropertyCard.module.css';

const amenityIcons = {
  WiFi: '📶',
  AC: '❄️',
  Food: '🍽️',
  Laundry: '🧺',
  Parking: '🅿️',
  Gym: '💪'
};

export default function PropertyCard({ property }) {
  const { slug, id, name, type, gender, area, city, price, rating, reviews, amenities, images, billing_cycle } = property;
  const lowestPrice = price?.triple || price?.double || price?.single || 'N/A';
  const billingSuffix = billing_cycle === 'yearly' ? '/yr' : '/mo';
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };
  
  return (
    <Link href={`/property/${slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <Image src={images[0] || '/images/pg_building_exterior.jpg'} alt={name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className={styles.image} />
        <button 
          className={`${styles.wishlistBtn} ${saved ? styles.inWishlist : ''}`} 
          onClick={handleWishlistClick}
          aria-label="Save to wishlist"
        >
          {saved ? '❤️' : '🤍'}
        </button>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles[`type${type}`]}`}>{type}</span>
          <span className={`${styles.badge} ${styles[`gender${gender}`]}`}>{gender}</span>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.location}>📍 {area}, {city}</p>
        {property.isVerified && (
          <div className={styles.verifiedBadge}>
            ✅ Verified Property
          </div>
        )}
        <div className={styles.priceRow}>
          <span className={styles.price}>From ₹{lowestPrice}{billingSuffix}</span>
          <span className={styles.rating}>⭐ {rating} ({reviews})</span>
        </div>
        <div className={styles.amenities}>
          {amenities.slice(0, 4).map((amenity, i) => (
            <span key={i} className={styles.amenityIcon} title={amenity}>
              {amenityIcons[amenity] || '✨'}
            </span>
          ))}
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.viewDetails}>View Details →</div>
          {property.contact?.whatsapp && (
            (() => {
              const waClean = property.contact.whatsapp.replace(/[^0-9]/g, '');
              const waNumber = waClean.length === 10 ? '91' + waClean : waClean;
              return (
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${name} in ${area}, ${city}. Is it available?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.whatsappMini}
                  onClick={e => e.stopPropagation()}
                  title="Chat on WhatsApp"
                >
                  💬 WhatsApp
                </a>
              );
            })()
          )}
        </div>
      </div>
    </Link>
  );
}
