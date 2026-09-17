'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import styles from './CompareModal.module.css';

const amenityIcons = {
  WiFi: '📶',
  AC: '❄️',
  Food: '🍽️',
  Laundry: '🧺',
  Parking: '🅿️',
  Gym: '💪'
};

export default function CompareModal({ isOpen, onClose, properties }) {
  if (!isOpen) return null;

  const allAmenities = [...new Set(properties.flatMap(p => p.amenities))];

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2>Compare Properties</h2>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          <div className={styles.content}>
            <div className={styles.compareTable}>
              {/* Table Header Row (Properties) */}
              <div className={styles.row}>
                <div className={styles.cellHeading}>Property</div>
                {properties.map(p => (
                  <div key={p.id} className={styles.cell}>
                    <div className={styles.propImageWrap}>
                      <Image src={p.images[0] || '/images/pg_building_exterior.jpg'} alt={p.name} fill className={styles.propImage} />
                    </div>
                    <div className={styles.propName}>{p.name}</div>
                    <div className={styles.propArea}>{p.area}</div>
                  </div>
                ))}
              </div>

              {/* Price Row */}
              <div className={styles.row}>
                <div className={styles.cellHeading}>Starting Price</div>
                {properties.map(p => {
                  const lowestPrice = p.price?.triple || p.price?.double || p.price?.single || 'N/A';
                  return (
                    <div key={p.id} className={styles.cellPrice}>
                      ₹{lowestPrice} {p.billing_cycle === 'yearly' ? '/yr' : '/mo'}
                    </div>
                  );
                })}
              </div>

              {/* Rating Row */}
              <div className={styles.row}>
                <div className={styles.cellHeading}>Rating</div>
                {properties.map(p => (
                  <div key={p.id} className={styles.cell}>
                    ⭐ {p.rating} ({p.reviews})
                  </div>
                ))}
              </div>

              {/* Gender Row */}
              <div className={styles.row}>
                <div className={styles.cellHeading}>Gender</div>
                {properties.map(p => (
                  <div key={p.id} className={styles.cell}>
                    {p.gender}
                  </div>
                ))}
              </div>

              {/* Amenities Breakdown */}
              <div className={styles.amenityHeaderRow}>
                <div className={styles.cellHeading}>Amenities</div>
                {properties.map(p => <div key={`am-head-${p.id}`} className={styles.cell}></div>)}
              </div>
              
              {allAmenities.map(amenity => (
                <div key={amenity} className={styles.row}>
                  <div className={styles.cellHeading}>{amenityIcons[amenity]} {amenity}</div>
                  {properties.map(p => (
                    <div key={`${p.id}-${amenity}`} className={styles.cellCheck}>
                      {p.amenities.includes(amenity) ? '✅' : '❌'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
