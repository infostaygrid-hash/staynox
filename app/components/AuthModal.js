'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import styles from './AuthModal.module.css';

export default function AuthModal({ isOpen, onClose }) {
  // Screens: 'main', 'email-login', 'email-signup', 'phone', 'forgot-password'
  const [screen, setScreen] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setMessage({ text: '', type: '' });
  };

  const switchScreen = (newScreen) => {
    resetForm();
    setScreen(newScreen);
  };

  const handleClose = () => {
    resetForm();
    setScreen('main');
    onClose();
  };

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // --- Auth Handlers ---

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);
    if (error) {
      // Custom friendly error if email is not confirmed
      if (error.message.includes('Invalid login credentials')) {
         setMessage({ text: 'Invalid email or password (or email not verified).', type: 'error' });
      } else {
         setMessage({ text: error.message, type: 'error' });
      }
    } else {
      setMessage({ text: 'Logged in successfully!', type: 'success' });
      // Force reload so Server Components read the newly set SSR cookies
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone }
      }
    });

    setIsLoading(false);
    if (error) {
      // Improve error message if they haven't verified their email
      if (error.message.includes('Invalid login credentials')) {
        setMessage({ text: 'Invalid email or password.', type: 'error' });
      } else {
        setMessage({ text: error.message, type: 'error' });
      }
    } else if (data.session) {
      // If email verification is off in Supabase, they are auto-logged in!
      setMessage({ text: 'Account created successfully! Logging you in...', type: 'success' });
      setTimeout(() => {
        window.location.reload(); // Force a reload so server components catch the cookie
      }, 1000);
    } else {
      // They need to verify their email
      setMessage({ text: 'Success! Please check your email for a verification link.', type: 'success' });
      setTimeout(() => {
        switchScreen('email-login');
        setMessage({ text: 'Please verify your email before logging in.', type: 'success' });
      }, 3000);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    // Supabase phone auth requires a Twilio/MSG91 provider to be configured.
    // For now, show a friendly message.
    setIsLoading(false);
    setMessage({ text: 'Phone OTP login is coming soon! Please use email for now.', type: 'error' });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);
    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Password reset link sent to your email!', type: 'success' });
    }
  };

  // --- Render Screens ---

  const renderMainScreen = () => (
    <>
      <h2 className={styles.title}>Welcome to StayNox</h2>
      <p className={styles.subtitle}>Log in or sign up to save your favourite PGs & Hostels</p>

      <div className={styles.optionsContainer}>
        <button className={styles.optionBtn} onClick={() => switchScreen('email-login')}>
          <span className={styles.optionIcon}>📧</span>
          Continue with Email
        </button>
      </div>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <p className={styles.switchText}>
        Don't have an account?{' '}
        <button className={styles.switchBtn} onClick={() => switchScreen('email-signup')}>
          Sign Up
        </button>
      </p>
    </>
  );

  const renderEmailLoginScreen = () => (
    <>
      <button className={styles.backBtn} onClick={() => switchScreen('main')}>← Back</button>
      <h2 className={styles.title}>Log In with Email</h2>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}

      <form onSubmit={handleEmailLogin} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="button"
          className={styles.forgotBtn}
          onClick={() => switchScreen('forgot-password')}
        >
          Forgot Password?
        </button>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className={styles.switchText}>
        Don't have an account?{' '}
        <button className={styles.switchBtn} onClick={() => switchScreen('email-signup')}>
          Sign Up
        </button>
      </p>
    </>
  );

  const renderEmailSignupScreen = () => (
    <>
      <button className={styles.backBtn} onClick={() => switchScreen('main')}>← Back</button>
      <h2 className={styles.title}>Create Account</h2>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}

      <form onSubmit={handleEmailSignup} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p className={styles.switchText}>
        Already have an account?{' '}
        <button className={styles.switchBtn} onClick={() => switchScreen('email-login')}>
          Log In
        </button>
      </p>
    </>
  );

  const renderPhoneScreen = () => (
    <>
      <button className={styles.backBtn} onClick={() => switchScreen('main')}>← Back</button>
      <h2 className={styles.title}>Continue with Mobile</h2>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}

      <form onSubmit={handlePhoneLogin} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Mobile Number</label>
          <div className={styles.phoneInput}>
            <span className={styles.countryCode}>+91</span>
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={10}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>

      <p className={styles.switchText}>
        Or{' '}
        <button className={styles.switchBtn} onClick={() => switchScreen('email-login')}>
          continue with Email
        </button>
      </p>
    </>
  );

  const renderForgotPasswordScreen = () => (
    <>
      <button className={styles.backBtn} onClick={() => switchScreen('email-login')}>← Back</button>
      <h2 className={styles.title}>Reset Password</h2>
      <p className={styles.subtitle}>Enter your email and we'll send you a link to reset your password.</p>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}

      <form onSubmit={handleForgotPassword} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className={styles.switchText}>
        Remember your password?{' '}
        <button className={styles.switchBtn} onClick={() => switchScreen('email-login')}>
          Log In
        </button>
      </p>
    </>
  );

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={handleModalClick}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          ✕
        </button>

        <div className={styles.modalContent}>
          {screen === 'main' && renderMainScreen()}
          {screen === 'email-login' && renderEmailLoginScreen()}
          {screen === 'email-signup' && renderEmailSignupScreen()}
          {screen === 'forgot-password' && renderForgotPasswordScreen()}
        </div>
      </div>
    </div>
  );
}
