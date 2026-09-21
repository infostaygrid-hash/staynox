'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getProperties } from '@/app/data/properties';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I am the StayNox AI. Tell me what you are looking for!\n(e.g. "I am a boy looking for a single room near Knowledge Park under 15k")' }
  ]);
  const [input, setInput] = useState('');
  const [properties, setProperties] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
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

  const extractIntent = (text) => {
    const intent = { gender: 'Any', type: 'Any', budget: 999999, area: '' };
    const lower = text.toLowerCase();

    // Gender
    if (lower.includes('boy') || lower.includes('male') || lower.includes('men')) intent.gender = 'Boys PG';
    if (lower.includes('girl') || lower.includes('female') || lower.includes('women')) intent.gender = 'Girls PG';

    // Sharing Type
    if (lower.includes('single') || lower.includes('1 sharing') || lower.includes('1 seater')) intent.type = 'Single';
    if (lower.includes('double') || lower.includes('2 sharing') || lower.includes('2 seater') || lower.includes('two')) intent.type = 'Double';
    if (lower.includes('triple') || lower.includes('3 sharing') || lower.includes('3 seater') || lower.includes('three')) intent.type = 'Triple';

    // Budget
    const numMatches = lower.match(/\d+[k,]*\d*/g);
    if (numMatches) {
      for (const m of numMatches) {
        let num = parseInt(m.replace(/,/g, '').replace('k', '000'));
        if (num >= 3000 && num <= 50000) {
          intent.budget = num;
          break; // take the first plausible budget
        }
      }
    }

    // Area (basic check)
    const areas = ['knowledge park', 'beta', 'alpha', 'gamma', 'delta', 'pari chowk', 'sector 62', 'sector 63', 'surajpur'];
    for (const a of areas) {
      if (lower.includes(a)) {
        intent.area = a;
        break;
      }
    }

    return intent;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const intent = extractIntent(userText);
      const matches = properties.filter(p => {
        if (intent.gender !== 'Any' && p.type.toLowerCase() !== intent.gender.toLowerCase()) return false;
        
        let price = 999999;
        if (intent.type === 'Single' && !p.price?.single) return false;
        if (intent.type === 'Double' && !p.price?.double) return false;
        if (intent.type === 'Triple' && !p.price?.triple) return false;

        if (intent.type === 'Single' && p.price?.single) price = p.price.single;
        else if (intent.type === 'Double' && p.price?.double) price = p.price.double;
        else if (intent.type === 'Triple' && p.price?.triple) price = p.price.triple;
        else price = Math.min(...Object.values(p.price || { s: 99999 }).filter(Boolean));

        if (price > intent.budget) return false;

        if (intent.area && !p.area?.toLowerCase().includes(intent.area)) return false;

        return true;
      });

      let reply = '';
      if (matches.length > 0) {
        reply = \I found \ matches\\! Here are the best ones:\;
        setMessages(prev => [
          ...prev,
          { role: 'ai', content: reply },
          { role: 'results', matches: matches.slice(0, 3) }
        ]);
      } else {
        reply = \Hmm, I couldn't find any exact matches for that criteria. Try expanding your budget or changing the area!\;
        setMessages(prev => [...prev, { role: 'ai', content: reply }]);
      }
    }, 600);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '85px', right: '20px', width: '60px', height: '60px',
          borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          color: 'white', border: 'none', cursor: 'pointer', zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {isOpen ? <span style={{fontSize: '24px'}}>?</span> : <span style={{fontSize: '30px'}}>??</span>}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '155px', right: '20px', width: '350px', height: '500px',
          background: 'var(--surface)', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)'
        }}>
          <div style={{ background: 'var(--primary)', padding: '16px', color: 'white', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{fontSize: '20px'}}>??</span> StayNox AI Assistant
          </div>
          
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'ai' && (
                  <div style={{ background: 'var(--surface-soft)', padding: '12px', borderRadius: '12px 12px 12px 0', maxWidth: '85%', alignSelf: 'flex-start', color: 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
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
                      <Link href={\/property/\\} key={p.id} onClick={() => setIsOpen(false)} style={{ display: 'flex', gap: '12px', textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px' }}>
                        <img src={p.images?.[0] || '/images/pg_building_exterior.jpg'} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{p.area || p.city}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ background: 'var(--surface-soft)', padding: '12px', borderRadius: '12px', maxWidth: '50px', color: 'var(--text-secondary)' }}>
                ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '12px', borderTop: '1px solid var(--border)', background: 'var(--surface-soft)', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type your requirements..." 
              style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
