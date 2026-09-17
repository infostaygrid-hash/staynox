'use client';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CompareDock.module.css';
import Image from 'next/image';

export default function CompareDock({ selectedProperties, onRemove, onCompare, onClear }) {
  if (selectedProperties.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.dockWrapper}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className={styles.dock}>
          <div className={styles.dockHeader}>
            <span>Compare ({selectedProperties.length}/3)</span>
            <button className={styles.clearBtn} onClick={onClear}>Clear</button>
          </div>
          
          <div className={styles.dockItems}>
            {selectedProperties.map(prop => (
              <div key={prop.id} className={styles.dockItem}>
                <Image src={prop.images[0] || '/images/pg_building_exterior.jpg'} alt={prop.name} width={40} height={40} className={styles.dockImg} />
                <div className={styles.dockItemInfo}>
                  <span className={styles.dockItemName}>{prop.name}</span>
                </div>
                <button className={styles.removeBtn} onClick={() => onRemove(prop.id)}>✕</button>
              </div>
            ))}
            
            {/* Empty slots */}
            {[...Array(3 - selectedProperties.length)].map((_, i) => (
              <div key={`empty-${i}`} className={styles.emptySlot}>
                + Add
              </div>
            ))}
          </div>

          <button 
            className={styles.compareBtn} 
            disabled={selectedProperties.length < 2}
            onClick={onCompare}
          >
            {selectedProperties.length < 2 ? 'Select one more' : 'Compare Now'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
