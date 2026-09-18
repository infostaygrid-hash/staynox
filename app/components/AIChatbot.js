'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getProperties } from '@/app/data/properties';

export default function AIChatbot() {
  const [properties, setProperties] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I am the StayNox AI Assistant 🤖 I can help you find the perfect PG. What is your monthly budget?' }
  ]);
  const [step, setStep] = useState('budget'); // budget -> gender -> type -> done
  const [preferences, setPreferences] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getProperties().then(data => setProperties(data));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleOptionClick = (value, label) => {
    const newMessages = [...messages, { role: 'user', content: label }];
    setMessages(newMessages);

    setTimeout(() => {
      if (step === 'budget') {
        setPreferences({ ...preferences, budget: value });
        setStep('gender');
        setMessages([...newMessages, { role: 'ai', content: 'Got it. Are you looking for a Boys or Girls PG?' }]);
      } else if (step === 'gender') {
        const newPrefs = { ...preferences, gender: value };
        setPreferences(newPrefs);
        setStep('type');
        setMessages([...newMessages, { role: 'ai', content: 'Almost done! Do you prefer Single, Double, or Triple sharing?' }]);
      } else if (step === 'type') {
        const finalPrefs = { ...preferences, type: value };
        setPreferences(finalPrefs);
        setStep('done');
        findMatches(finalPrefs, newMessages);
      }
    }, 500);
  };

  const findMatches = (prefs, currentMessages) => {
    const matches = properties.filter(p => {
      if (prefs.gender !== 'Any' && p.type !== prefs.gender + ' PG') return false;
      if (prefs.type === 'Single' && !p.price?.single) return false;
      if (prefs.type === 'Double' && !p.price?.double) return false;
      if (prefs.type === 'Triple' && !p.price?.triple) return false;
      let price = 999999;
      if (prefs.type === 'Single' && p.price?.single) price = p.price.single;
      if (prefs.type === 'Double' && p.price?.double) price = p.price.double;
      if (prefs.type === 'Triple' && p.price?.triple) price = p.price.triple;
      if (price > prefs.budget) return false;
      return true;
    });

    if (matches.length > 0) {
      setMessages([
        ...currentMessages,
        { role: 'ai', content: `I found ${matches.length} matches! Here are the best options:` },
        { role: 'results', matches: matches.slice(0, 3) }
      ]);
    } else {
      setMessages([
        ...currentMessages,
        { role: 'ai', content: 'Hmm, I couldnt find an exact match. Try changing your budget or sharing type!' }
      ]);
    }
  };

  const resetChat = () => {
    setStep('budget');
    setPreferences({});
    setMessages([{ role: 'ai', content: 'Lets try again! What is your monthly budget?' }]);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px',
          borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          color: 'white', border: 'none', cursor: 'pointer', zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {isOpen ? <span style={{fontSize: '24px'}}>✕</span> : <span style={{fontSize: '30px'}}>🤖</span>}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '20px', width: '350px', height: '500px',
          background: 'var(--surface)', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)'
        }}>
          <div style={{ background: 'var(--primary)', padding: '16px', color: 'white', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{fontSize: '20px'}}>🤖</span> AI Matchmaker
          </div>
          
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'ai' && (
                  <div style={{ background: 'var(--surface-soft)', padding: '12px', borderRadius: '12px 12px 12px 0', maxWidth: '85%', alignSelf: 'flex-start', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {msg.content}
                  </div>
                )}
                {msg.role === 'user' && (
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '12px 12px 0 12px', maxWidth: '85%', alignSelf: 'flex-end', marginLeft: 'auto', fontSize: '0.9rem' }}>
                    {msg.content}
                  </div>
                )}
                {msg.role === 'results' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {msg.matches.map(p => (
                      <Link href={`/property/${p.slug}`} key={p.id} style={{ display: 'flex', gap: '8px', textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px' }}>
                        <img src={p.images?.[0] || '/images/pg_building_exterior.jpg'} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{p.city}</span>
                        </div>
                      </Link>
                    ))}
                    <button onClick={resetChat} style={{ marginTop: '8px', background: 'none', border: '1px solid var(--border)', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Start Over</button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--surface-soft)' }}>
            {step === 'budget' && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => handleOptionClick(10000, 'Under ₹10k')} style={optBtn}>Under ₹10k</button>
                <button onClick={() => handleOptionClick(15000, 'Under ₹15k')} style={optBtn}>Under ₹15k</button>
                <button onClick={() => handleOptionClick(999999, 'Any')} style={optBtn}>Any Budget</button>
              </div>
            )}
            {step === 'gender' && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => handleOptionClick('Boys', 'Boys PG')} style={optBtn}>Boys PG</button>
                <button onClick={() => handleOptionClick('Girls', 'Girls PG')} style={optBtn}>Girls PG</button>
                <button onClick={() => handleOptionClick('Any', 'Any')} style={optBtn}>Any</button>
              </div>
            )}
            {step === 'type' && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => handleOptionClick('Single', 'Single')} style={optBtn}>Single</button>
                <button onClick={() => handleOptionClick('Double', 'Double')} style={optBtn}>Double</button>
                <button onClick={() => handleOptionClick('Triple', 'Triple')} style={optBtn}>Triple</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const optBtn = {
  background: 'var(--surface)', border: '1px solid var(--primary)', color: 'var(--primary)',
  padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
};
