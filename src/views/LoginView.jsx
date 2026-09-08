import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export const LoginView = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    if (!result.ok) setError(result.error);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon-dental" style={{ width: 48, height: 48 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2C4.5 2 3 4 3 6.5C3 9 4.2 12.5 5 15.5C5.8 18.5 6.5 22 8 22C9.5 22 10 19 11 15C11.5 13 12.5 13 13 15C14 19 14.5 22 16 22C17.5 22 18.2 18.5 19 15.5C19.8 12.5 21 9 21 6.5C21 4 19.5 2 17 2C15 2 13.5 3.5 12 3.5C10.5 3.5 9 2 7 2Z"/>
            </svg>
          </div>
          <h1>DentalLab Pro</h1>
          <p>Laboratuvar üretim takip sistemi</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-item">
            <label>Kullanıcı adı</label>
            <div className="login-input-wrap">
              <User size={16} className="login-field-icon" />
              <input
                type="text"
                className="dental-input"
                placeholder="Kullanıcı adınız"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-item">
            <label>Şifre</label>
            <div className="login-input-wrap">
              <Lock size={16} className="login-field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="dental-input"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-dental btn-dental-primary login-submit-btn">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};
