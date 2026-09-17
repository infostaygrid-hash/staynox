'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import styles from './page.module.css';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target;
    
    // Send the enquiry to WhatsApp
    const waMessage = `*New Enquiry on StayNox*
Name: ${form.name.value}
Phone: ${form.phone.value}
Subject: ${form.subject.value}
Message: ${form.message.value}`;
    
    window.open(`https://wa.me/919518416021?text=${encodeURIComponent(waMessage)}`, '_blank');
    
    setIsSubmitting(false);
    setSubmitted(true);
    form.reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How do I list my property on StayNox?',
      a: 'You can list your property by filling out the Contact Form and selecting "Property Listing" as the subject. Our team will get in touch with you to verify the details and schedule a photoshoot.'
    },
    {
      q: 'Is there a fee for listing?',
      a: 'No, listing your property on StayNox is completely free. We only charge a small nominal fee upon successful tenant placement.'
    },
    {
      q: 'How are properties verified?',
      a: 'Our ground team physically visits every property to verify the amenities, take real photographs, and ensure the safety standards meet our requirements.'
    },
    {
      q: 'Can I visit properties before booking?',
      a: 'Absolutely! We encourage you to visit the property. You can schedule a visit directly through our platform for any listed property.'
    },
    {
      q: 'Do you operate outside Greater Noida?',
      a: 'Currently, StayNox is operational in Greater Noida, Noida, Ghaziabad, and Delhi.'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Get in Touch</h1>
        <p>Have questions? We'd love to hear from you.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.glassCard}>
          {submitted && (
            <div className={styles.successMessage}>
              Thank you! We'll get back to you within 24 hours.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" className={styles.input} required placeholder="John Doe" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" className={styles.input} required placeholder="john@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone</label>
              <input type="tel" id="phone" name="phone" className={styles.input} required placeholder="+91 9876543210" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <select id="subject" name="subject" className={styles.input} required>
                <option value="">Select a subject...</option>
                <option value="general">General Inquiry</option>
                <option value="listing">Property Listing</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" className={`${styles.input} ${styles.textarea}`} required placeholder="How can we help you?"></textarea>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className={styles.glassCard}>
          <ul className={styles.infoList}>
            <li>
              <span className={styles.infoIcon}>📍</span>
              <div>
                <strong>Address</strong><br />
                Knowledge Park III,<br />
                Greater Noida, UP 201310
              </div>
            </li>
            <li>
              <span className={styles.infoIcon}>📧</span>
              <div>
                <strong>Email</strong><br />
                infostaygrid@gmail.com
              </div>
            </li>
            <li>
              <span className={styles.infoIcon}>💬</span>
              <div>
                <strong>WhatsApp Only</strong><br />
                +91 95184 16021
              </div>
            </li>
            <li>
              <span className={styles.infoIcon}>⏰</span>
              <div>
                <strong>24/7 Support</strong><br />
                Always available
              </div>
            </li>
          </ul>

          <a href="https://wa.me/919518416021" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
            <span>💬</span> Chat on WhatsApp
          </a>

          <div>
            <strong style={{ display: 'block', marginBottom: '1rem' }}>Follow Us</strong>
            <div className={styles.socialLinks}>
              <a href="https://instagram.com/_staygn._" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>Find Us Here</h2>
        <div className={styles.creativeMapContainer}>
          <div className={styles.pulseWrapper}>
            <div className={styles.pulseRing}></div>
            <div className={styles.pulseRing2}></div>
            <div className={styles.mapPin}>📍</div>
          </div>
          <div className={styles.locationDetails}>
            <h3>StayNox HQ</h3>
            <p>Knowledge Park, Greater Noida<br />Uttar Pradesh, India</p>
            <div className={styles.operatingAreas}>
              <span className={styles.areaTag}>✨ Galgotias</span>
              <span className={styles.areaTag}>✨ GL Bajaj</span>
              <span className={styles.areaTag}>✨ NIET</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button 
                className={styles.faqQuestion}
                onClick={() => toggleFaq(index)}
              >
                {faq.q}
                <span>{activeFaq === index ? '−' : '+'}</span>
              </button>
              {activeFaq === index && (
                <div className={styles.faqAnswer}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
