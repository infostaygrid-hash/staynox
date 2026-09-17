'use client';
import { useState } from 'react';
import PropertyForm from './PropertyForm';
import { saveProperty } from '../actions';
import styles from '../page.module.css';

export default function PropertyManager({ initialProperties }) {
  const [properties, setProperties] = useState(initialProperties);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const handleSave = async (formData) => {
    try {
      const result = await saveProperty(formData);
      if (result.success) {
        setIsFormOpen(false);
        setEditingProperty(null);
        // Soft refresh to show new data immediately
        window.location.reload();
      } else {
        alert('Error saving property: ' + result.error);
      }
    } catch (error) {
      alert('Network or unexpected error: ' + error.message);
    }
  };

  const handleEdit = (prop) => {
    // Format property for the form
    const formatted = {
      ...prop,
      prices: prop.property_prices?.[0] || { single: '', double: '', triple: '' },
      amenities: prop.property_amenities?.map(a => a.amenity).join(', ') || '',
      rules: prop.property_rules?.map(r => r.rule).join(', ') || '',
      images: prop.property_images?.map(i => i.url).join(', ') || '',
      commute_times: prop.commute_times || '',
    };
    setEditingProperty(formatted);
    setIsFormOpen(true);
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Active Properties</h2>
        <button className={styles.editBtn} onClick={() => { setEditingProperty(null); setIsFormOpen(true); }}>
          + Add Property
        </button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>City</th>
              <th>Featured</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {properties?.length === 0 ? (
              <tr><td colSpan="5" className={styles.empty}>No properties found.</td></tr>
            ) : (
              properties?.map((prop) => (
                <tr key={prop.id}>
                  <td>
                    <div className={styles.propertyCell}>
                      <img 
                        src={prop.property_images?.[0]?.url || '/images/pg_building_exterior.jpg'} 
                        alt={prop.name} 
                        className={styles.thumbnail}
                      />
                      {prop.name}
                    </div>
                  </td>
                  <td><span className={styles.badge}>{prop.type}</span></td>
                  <td>{prop.city}</td>
                  <td>{prop.featured ? '⭐ Yes' : 'No'}</td>
                  <td>
                    <button className={styles.actionBtn} onClick={() => handleEdit(prop)}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <PropertyForm 
          initialData={editingProperty} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </section>
  );
}
