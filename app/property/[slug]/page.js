'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPropertyBySlug, getProperties } from '@/app/data/properties';
import PropertyCard from '@/app/components/PropertyCard';
import ReviewsSection from '@/app/components/ReviewsSection';
import VerticalVideoPlayer from '@/app/components/VerticalVideoPlayer';
import { incrementView, incrementWhatsAppClick } from '@/app/admin/actions';
import styles from './page.module.css';

const allAmenities = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'ac', label: 'AC', icon: '❄️' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'laundry', label: 'Laundry', icon: '🧺' },
  { id: 'cleaning', label: 'Daily Cleaning', icon: '🧹' }
];

export default function PropertyPage({ params }) {
  const { slug } = use(params);
  
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [similarProperties, setSimilarProperties] = useState([]);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const prop = await getPropertyBySlug(slug);
      setProperty(prop);
      
      if (prop) {
        // Track the view
        incrementView(prop.id).catch(console.error);

        // Fetch some properties for 'similar properties' section
        const allProps = await getProperties();
        const similar = allProps.filter(p => p.type === prop.type && p.id !== prop.id).slice(0, 3);
        setSimilarProperties(similar);
      }
      
      setIsLoading(false);
    };
    loadData();
  }, [slug]);

  if (isLoading) {
    return <div className={styles.notFound}><h1>Loading...</h1></div>;
  }

  if (!property) {
    return (
      <div className={styles.notFound}>
        <h1>Property not found</h1>
        <Link href="/" className={styles.backLink}>Go back to home</Link>
      </div>
    );
  }

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    e.target.reset();
  };


  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        
        {/* Gallery Section */}
        <div className={styles.gallery}>
          <div 
            className={styles.mainImageContainer} 
            onClick={() => setIsLightboxOpen(true)}
          >
            <Image 
              src={property.images[activeImageIndex] || '/images/pg_building_exterior.jpg'} 
              alt={property.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 800px"
              className={styles.mainImage} 
            />
            <div className={styles.overlay}>Click to expand</div>
          </div>
          <div className={styles.thumbnailStrip}>
            {property.images.map((img, index) => (
              <div 
                key={index} 
                className={`${styles.thumbnailContainer} ${activeImageIndex === index ? styles.activeThumbnail : ''}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <Image src={img} alt={`Thumbnail ${index + 1}`} fill sizes="100px" className={styles.thumbnail} />
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.contentGrid}>
          {/* Left Column */}
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <div className={styles.badges}>
                <span className={styles.typeBadge}>{property.type.toUpperCase()}</span>
                <span className={styles.genderBadge}>{property.gender}</span>
              </div>
              <h1 className={styles.title}>{property.name}</h1>
              <div className={styles.subHeader}>
                <span className={styles.rating}>⭐ {property.rating} ({property.reviews} reviews)</span>
                <span className={styles.address}>📍 {property.address}</span>
                <span className={styles.established}>Est. {property.established}</span>
              </div>
            </div>

            <div className={styles.descriptionSection}>
              <h2>About the Property</h2>
              <p className={styles.description}>{property.description}</p>
              {property.vertical_video_url && (
                <VerticalVideoPlayer videoUrl={property.vertical_video_url} />
              )}
            </div>

            {property.video_url && (
              <div className={styles.descriptionSection}>
                <h2>Video Walkthrough</h2>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
                  <iframe 
                    src={(() => {
                      const url = property.video_url;
                      if (url.includes('youtube.com/watch?v=')) {
                        return `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`;
                      }
                      if (url.includes('youtu.be/')) {
                        return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
                      }
                      return url;
                    })()}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {property.commute_times && (
              <div className={styles.descriptionSection}>
                <h2>Commute Times & Landmarks</h2>
                <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
                  {property.commute_times.split(',').map((commute, i) => {
                    const isWalk = commute.toLowerCase().includes('walk');
                    const isDrive = commute.toLowerCase().includes('drive') || commute.toLowerCase().includes('car');
                    const icon = isWalk ? '🚶' : isDrive ? '🚗' : '📍';
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--surface-soft)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{commute.trim()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.amenitiesSection}>
              <h2>Amenities</h2>
              <div className={styles.amenitiesGrid}>
                {/* 1. Show all standard amenities (highlighted if available, gray if not) */}
                {allAmenities.map((amenity) => {
                  const isAvailable = property.amenities.some(a => {
                    const aLower = a.toLowerCase();
                    const idLower = amenity.id.toLowerCase();
                    const labelLower = amenity.label.toLowerCase();
                    if (idLower === 'food' && aLower.includes('food')) return true;
                    if (idLower === 'cleaning' && aLower.includes('cleaning')) return true;
                    return aLower === labelLower || aLower === idLower;
                  });
                  return (
                    <div 
                      key={amenity.id} 
                      className={`${styles.amenityCard} ${isAvailable ? styles.available : styles.unavailable}`}
                    >
                      <span className={styles.amenityIcon}>{amenity.icon}</span>
                      <span className={styles.amenityLabel}>{amenity.label}</span>
                    </div>
                  );
                })}
                
                {/* 2. Show any custom amenities the admin typed that aren't in the standard list */}
                {property.amenities
                  .filter(custom => !allAmenities.some(std => {
                    const customLower = custom.toLowerCase();
                    const stdId = std.id.toLowerCase();
                    if (stdId === 'food' && customLower.includes('food')) return true;
                    if (stdId === 'cleaning' && customLower.includes('cleaning')) return true;
                    return std.label.toLowerCase() === customLower || stdId === customLower;
                  }))
                  .map((customAmenity, idx) => (
                    <div 
                      key={`custom-${idx}`} 
                      className={`${styles.amenityCard} ${styles.available}`}
                    >
                      <span className={styles.amenityIcon}>✨</span>
                      <span className={styles.amenityLabel}>{customAmenity}</span>
                    </div>
                ))}
              </div>
            </div>

            <div className={styles.rulesSection}>
              <h2>House Rules</h2>
              <ul className={styles.rulesList}>
                {property.rules.map((rule, idx) => (
                  <li key={idx}>✅ {rule}</li>
                ))}
              </ul>
            </div>

            <ReviewsSection propertyId={property.id} reviews={property.reviews} />
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.priceCard}>
              <h2>Pricing Plans</h2>
              <div className={styles.pricingTiers}>
                {property.price.single && (
                  <div className={styles.priceTier}>
                    <span>Single Occupancy</span>
                    <strong>₹{property.price.single}{property.billing_cycle === 'yearly' ? '/yr' : '/mo'}</strong>
                  </div>
                )}
                {property.price.double && (
                  <div className={`${styles.priceTier} ${styles.bestValue}`}>
                    <span className={styles.bestValueTag}>Best Value</span>
                    <span>Double Sharing</span>
                    <strong>₹{property.price.double}{property.billing_cycle === 'yearly' ? '/yr' : '/mo'}</strong>
                  </div>
                )}
                {property.price.triple && (
                  <div className={styles.priceTier}>
                    <span>Triple Sharing</span>
                    <strong>₹{property.price.triple}{property.billing_cycle === 'yearly' ? '/yr' : '/mo'}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.contactCard}>
              <h2>Contact Property</h2>
              {property.contact?.whatsapp && (
                (() => {
                  const waClean = property.contact.whatsapp.replace(/[^0-9]/g, '');
                  const waNumber = waClean.length === 10 ? '91' + waClean : waClean;
                  return (
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${property.name} in ${property.area}, ${property.city}. Is it available?`)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => incrementWhatsAppClick(property.id).catch(console.error)}
                      className={styles.whatsappBtnLarge}
                    >
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.528 5.855L.057 23.882l6.177-1.628A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.652-.518-5.168-1.417l-.369-.22-3.828 1.009 1.028-3.742-.244-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                      Chat on WhatsApp
                    </a>
                  );
                })()
              )}
              <div className={styles.contactButtons}>
                {property.contact?.phone && (
                  <a href={`tel:${property.contact.phone}`} className={styles.phoneBtn}>
                    📞 {property.contact.phone}
                  </a>
                )}
              </div>
              <div className={styles.divider}>or</div>
              <form onSubmit={handleContactSubmit} className={styles.enquiryForm}>
                <input type="text" placeholder="Your Name" required className={styles.input} />
                <input type="tel" placeholder="Your Phone" required className={styles.input} />
                <textarea placeholder="Message" required className={styles.textarea} rows={3}></textarea>
                <button type="submit" className={styles.submitBtn}>Send Enquiry</button>
              </form>
              {showToast && <div className={styles.toast}>Enquiry sent successfully!</div>}
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className={styles.similarSection}>
            <h2>Similar Properties</h2>
            <div className={styles.similarGrid}>
            {similarProperties.map(similar => (
              <PropertyCard key={similar.id} property={similar} />
            ))}
          </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className={styles.lightbox} onClick={() => setIsLightboxOpen(false)}>
          <button className={styles.closeBtn} onClick={() => setIsLightboxOpen(false)}>✕</button>
          <button className={styles.prevBtn} onClick={handlePrevImage}>‹</button>
          <div className={styles.lightboxImageContainer} onClick={(e) => e.stopPropagation()}>
            <Image 
              src={property.images[activeImageIndex]} 
              alt={property.name} 
              fill 
              className={styles.lightboxImage} 
            />
          </div>
          <button className={styles.nextBtn} onClick={handleNextImage}>›</button>
        </div>
      )}
    </div>
  );
}
