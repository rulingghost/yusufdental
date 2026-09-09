import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginView = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Lütfen kullanıcı adınızı girin.');
      return;
    }
    if (!cleanPass) {
      setError('Lütfen şifrenizi girin.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(cleanUser, cleanPass);
      setLoading(false);
      if (!result.ok) {
        setError(result.error || 'Kullanıcı adı veya şifre hatalı.');
      }
    }, 150);
  };

  return (
    <div className="modern-login-wrapper">
      {/* Arka plan ışık efektleri */}
      <div className="login-backdrop-glow glow-1" />
      <div className="login-backdrop-glow glow-2" />

      <div className="modern-login-card">
        {/* Üst Logo ve Başlık Bölümü */}
        <div className="login-hero-header">
          <div className="login-emblem-wrap">
            <div className="login-emblem-core">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2C4.5 2 3 4 3 6.5C3 9 4.2 12.5 5 15.5C5.8 18.5 6.5 22 8 22C9.5 22 10 19 11 15C11.5 13 12.5 13 13 15C14 19 14.5 22 16 22C17.5 22 18.2 18.5 19 15.5C19.8 12.5 21 9 21 6.5C21 4 19.5 2 17 2C15 2 13.5 3.5 12 3.5C10.5 3.5 9 2 7 2Z" />
              </svg>
            </div>
            <div className="login-emblem-ring" />
          </div>

          <div className="login-title-group">
            <h1 className="login-title">
              Dental<span>Lab</span> <span className="title-pro-badge">PRO</span>
            </h1>
            <p className="login-subtitle">Diş Protez & Laboratuvar Üretim Yönetim Sistemi</p>
          </div>
        </div>

        {/* Hata Uyarısı */}
        {error && (
          <div className="login-alert-box animate-shake">
            <AlertCircle size={16} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Giriş Formu */}
        <form onSubmit={handleLogin} className="modern-login-form">
          <div className="login-field-group">
            <label className="login-label" htmlFor="login-username">Kullanıcı Adı</label>
            <div className="login-input-box">
              <User size={18} className="input-leading-icon" />
              <input
                id="login-username"
                type="text"
                className="login-input"
                placeholder="Kullanıcı adınızı yazın..."
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="login-field-group">
            <label className="login-label" htmlFor="login-password">Şifre</label>
            <div className="login-input-box">
              <Lock size={18} className="input-leading-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Şifrenizi yazın..."
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(prev => !prev)}
                title={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-action-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="login-btn-loading">
                <span className="spinner-dot" /> Giriş yapılıyor...
              </span>
            ) : (
              <>
                <span>Sisteme Giriş Yap</span>
                <ArrowRight size={18} className="btn-arrow-icon" />
              </>
            )}
          </button>
        </form>

        {/* Alt Bilgi */}
        <div className="login-footer-note">
          <span>Güvenli Laboratuvar Oturumu • © 2026 DentalLab Pro</span>
        </div>
      </div>
    </div>
  );
};
