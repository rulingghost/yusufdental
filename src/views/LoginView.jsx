import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, Mail, ShieldCheck } from 'lucide-react';

export const LoginView = () => {
  const {
    login,
    users,
    setupAdminAccount,
    startAdminPasswordReset,
    finishAdminPasswordReset
  } = useAuth();
  const adminUser = (users || []).find(u => u.role === 'admin');
  const adminUsername = (adminUser?.username || 'admin').toLowerCase();
  const adminHasGmail = !!adminUser?.recoveryEmail;

  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  const typingAdmin = username.trim().toLowerCase() === adminUsername;
  const showGmailSetup = mode === 'login' && typingAdmin && !adminHasGmail;

  const goLogin = () => {
    setMode('login');
    setError('');
    setCode('');
    setPassword('');
    setPassword2('');
    setGmail('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (showGmailSetup) {
      if (password !== password2) {
        setError('Şifreler eşleşmiyor.');
        return;
      }
      const result = setupAdminAccount({ email: gmail, password });
      if (!result.ok) setError(result.error);
      return;
    }

    const result = login(username, password);
    if (!result.ok) setError(result.error);
  };

  const handleSendReset = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setBusy(true);
    const result = await startAdminPasswordReset();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMaskedEmail(result.maskedEmail || '');
    setMode('reset-code');
  };

  const handleFinishReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setBusy(true);
    const result = await finishAdminPasswordReset({
      code,
      newPassword: password
    });
    setBusy(false);
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
          <p>
            {mode === 'login'
              ? (showGmailSetup ? 'Yönetici için Gmail ekleyin ve şifre oluşturun' : 'Laboratuvar üretim takip sistemi')
              : 'Kayıtlı Gmail adresine 6 haneli kod gönderilir'}
          </p>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="login-form">
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

            {showGmailSetup && (
              <div className="form-item">
                <label>Gmail ekle</label>
                <div className="login-input-wrap">
                  <Mail size={16} className="login-field-icon" />
                  <input
                    type="email"
                    className="dental-input"
                    placeholder="ornek@gmail.com"
                    value={gmail}
                    onChange={(e) => { setGmail(e.target.value); setError(''); }}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-item">
              <label>{showGmailSetup ? 'Şifre oluştur' : 'Şifre'}</label>
              <div className="login-input-wrap">
                <Lock size={16} className="login-field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="dental-input"
                  placeholder={showGmailSetup ? 'En az 6 karakter' : 'Şifreniz'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoComplete={showGmailSetup ? 'new-password' : 'current-password'}
                  required
                  minLength={showGmailSetup ? 6 : undefined}
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

            {showGmailSetup && (
              <div className="form-item">
                <label>Şifre tekrar</label>
                <div className="login-input-wrap">
                  <Lock size={16} className="login-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="dental-input"
                    placeholder="Tekrar yazın"
                    value={password2}
                    onChange={(e) => { setPassword2(e.target.value); setError(''); }}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn-dental btn-dental-primary login-submit-btn">
              {showGmailSetup ? 'Gmail kaydet ve gir' : 'Giriş Yap'}
            </button>
            {typingAdmin && adminHasGmail && (
              <button
                type="button"
                className="login-text-btn"
                onClick={() => { setMode('reset'); setError(''); setPassword(''); setPassword2(''); }}
              >
                Şifremi unuttum
              </button>
            )}
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleSendReset} className="login-form">
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              6 haneli kod, yöneticinin kayıtlı Gmail adresine gönderilir.
            </p>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="btn-dental btn-dental-primary login-submit-btn" disabled={busy}>
              {busy ? 'Gönderiliyor...' : 'Kod gönder'}
            </button>
            <button type="button" className="login-text-btn" onClick={goLogin}>
              Girişe dön
            </button>
          </form>
        )}

        {mode === 'reset-code' && (
          <form onSubmit={handleFinishReset} className="login-form">
            {maskedEmail && (
              <div className="login-success">
                6 haneli kod {maskedEmail} adresine gönderildi.
              </div>
            )}
            <div className="form-item">
              <label>6 haneli kod</label>
              <div className="login-input-wrap">
                <ShieldCheck size={16} className="login-field-icon" />
                <input
                  type="text"
                  className="dental-input"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </div>
            </div>
            <div className="form-item">
              <label>Yeni şifre</label>
              <div className="login-input-wrap">
                <Lock size={16} className="login-field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="dental-input"
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-item">
              <label>Yeni şifre tekrar</label>
              <div className="login-input-wrap">
                <Lock size={16} className="login-field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="dental-input"
                  placeholder="Tekrar yazın"
                  value={password2}
                  onChange={(e) => { setPassword2(e.target.value); setError(''); }}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
            </div>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="btn-dental btn-dental-primary login-submit-btn" disabled={busy}>
              {busy ? 'Kaydediliyor...' : 'Şifreyi yenile'}
            </button>
            <button
              type="button"
              className="login-text-btn"
              onClick={handleSendReset}
              disabled={busy}
            >
              Kodu tekrar gönder
            </button>
            <button type="button" className="login-text-btn" onClick={goLogin}>
              Girişe dön
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
