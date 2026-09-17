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
                <strong>Working Hours</strong><br />
                Mon-Sat, 9 AM - 7 PM
              </div>
            </li>
          </ul>

          <a href="https://wa.me/919518416021" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
            <span>💬</span> Chat on WhatsApp
          </a>

          <div>
            <strong style={{ display: 'block', marginBottom: '1rem' }}>Follow Us</strong>
            <div className={styles.socialLinks}>
              <a href="https://instagram.com/_staygn._" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>In</a>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>Find Us Here</h2>
        <div className={styles.mapContainer}>
          Map coming soon
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
