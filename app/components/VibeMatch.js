'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './VibeMatch.module.css';

const QUESTIONS = [
  {
    id: 'budget',
    question: "What's your monthly budget?",
    options: [
      { label: 'Budget-friendly (Under ₹10k)', value: 'low', icon: '💸' },
      { label: 'Standard (₹10k - ₹15k)', value: 'mid', icon: '🎯' },
      { label: 'Premium (₹15k+)', value: 'high', icon: '✨' }
    ]
  },
  {
    id: 'sharing',
    question: 'How do you feel about roommates?',
    options: [
      { label: 'I need my own space (Single)', value: 'single', icon: '🧘‍♂️' },
      { label: 'One roommate is fine (Double)', value: 'double', icon: '👯‍♀️' },
      { label: 'The more the merrier (Triple+)', value: 'triple', icon: '🎉' }
    ]
  },
  {
    id: 'vibe',
    question: 'What is your daily vibe?',
    options: [
      { label: 'Super Studious & Quiet', value: 'quiet', icon: '📚' },
      { label: 'Social Butterfly', value: 'social', icon: '🦋' },
      { label: 'Just chilling, balanced', value: 'chill', icon: '🎮' }
    ]
  }
];

export default function VibeMatch() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelect = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      // Finished
      setIsAnalyzing(true);
      setTimeout(() => {
        // Redirect to listings with filters
        const budget = newAnswers.budget;
        const sharing = newAnswers.sharing;
        router.push(`/listings?budget=${budget}&sharing=${sharing}`);
      }, 2500);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsAnalyzing(false);
  };

  return (
    <div className={styles.vibeWrapper}>
      <AnimatePresence mode="wait">
        {!isAnalyzing ? (
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={styles.questionCard}
          >
            <div className={styles.progress}>
              Step {currentStep + 1} of {QUESTIONS.length}
            </div>
            <h3 className={styles.questionTitle}>{QUESTIONS[currentStep].question}</h3>
            
            <div className={styles.optionsGrid}>
              {QUESTIONS[currentStep].options.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.optionBtn} ${answers[QUESTIONS[currentStep].id] === opt.value ? styles.selected : ''}`}
                  onClick={() => handleSelect(QUESTIONS[currentStep].id, opt.value)}
                >
                  <span className={styles.icon}>{opt.icon}</span>
                  <span className={styles.label}>{opt.label}</span>
                </button>
              ))}
            </div>
            
            {currentStep > 0 && (
              <button className={styles.backBtn} onClick={() => setCurrentStep(prev => prev - 1)}>
                ← Back
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.analyzingCard}
          >
            <motion.div 
              className={styles.spinner}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <h3>Analyzing your vibe...</h3>
            <p>Finding the perfect StayNox properties for you 🚀</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
