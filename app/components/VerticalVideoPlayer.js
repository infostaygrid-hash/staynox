'use client';
import { useState } from 'react';

export default function VerticalVideoPlayer({ videoUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!videoUrl) return null;

  // Handle comma-separated list of URLs
  const urls = videoUrl.split(',').map(s => s.trim()).filter(Boolean);
  if (urls.length === 0) return null;

  const currentRawUrl = urls[currentIndex];

  // Detect if it's a YouTube shorts URL and convert to embed
  let embedUrl = currentRawUrl;
  let isIframe = false;

  if (currentRawUrl.includes('youtube.com/shorts/')) {
    const id = currentRawUrl.split('shorts/')[1].split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}`;
    isIframe = true;
  } else if (currentRawUrl.includes('instagram.com/reel/') || currentRawUrl.includes('instagram.com/p/')) {
    const cleanUrl = currentRawUrl.split('?')[0].replace(/\/$/, '');
    embedUrl = `${cleanUrl}/embed`;
    isIframe = true;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  };
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
  };

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
        ▶️ Watch Video Tours ({urls.length})
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
            boxShadow: '0 0 30px rgba(0,0,0,0.5)', position: 'relative'
          }}>
            {isIframe ? (
              <iframe 
                width="100%" height="100%" 
                src={embedUrl} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            ) : (
              <video 
                src={currentRawUrl} 
                controls 
                autoPlay 
                loop 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {urls.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '2rem', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', zIndex: 10001 }}
                >
                  ‹
                </button>
                <button 
                  onClick={handleNext}
                  style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '2rem', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', zIndex: 10001 }}
                >
                  ›
                </button>
              </>
            )}
          </div>
          
          <div style={{ color: 'white', marginTop: '1rem', fontWeight: 500, display: 'flex', gap: '8px', alignItems: 'center' }}>
            {urls.length > 1 && <span>Video {currentIndex + 1} of {urls.length} • </span>}
            Click X to close
          </div>
        </div>
      )}
    </>
  );
}
