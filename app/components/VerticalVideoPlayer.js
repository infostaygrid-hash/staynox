'use client';
import { useState } from 'react';

export default function VerticalVideoPlayer({ videoUrl }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!videoUrl) return null;

  // Detect if it's a YouTube shorts URL and convert to embed
  let embedUrl = videoUrl;
  if (videoUrl.includes('youtube.com/shorts/')) {
    const id = videoUrl.split('shorts/')[1].split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}`;
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)',
          color: 'white', border: 'none', padding: '10px 20px', borderRadius: '30px',
          fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 0.2s', marginTop: '1rem'
        }}
      >
        ?? Watch Video Tour
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
        }}>
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none',
              color: 'white', fontSize: '2rem', cursor: 'pointer', zIndex: 10000
            }}
          >
            ✕
          </button>
          
          <div style={{ 
            width: '100%', maxWidth: '450px', height: '80vh', 
            maxHeight: '800px', background: 'black', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 0 30px rgba(0,0,0,0.5)'
          }}>
            {embedUrl.includes('youtube') ? (
              <iframe 
                width="100%" height="100%" 
                src={embedUrl} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            ) : (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
          <p style={{ color: 'white', marginTop: '1rem', fontWeight: 500 }}>Swipe down or click X to close</p>
        </div>
      )}
    </>
  );
}
