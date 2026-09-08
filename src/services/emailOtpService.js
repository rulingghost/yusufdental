const OTP_STORAGE_KEY = 'dentallab_email_otp_v1';
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_GAP_MS = 45 * 1000;

export function isGmailAddress(value) {
  return /^[a-zA-Z0-9._%+-]+@(gmail|googlemail)\.com$/i.test(String(value || '').trim());
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function maskEmail(value) {
  const email = normalizeEmail(value);
  const at = email.indexOf('@');
  if (at < 1) return email;
  const name = email.slice(0, at);
  const domain = email.slice(at);
  const visible = name.slice(0, 1);
  return `${visible}${'*'.repeat(Math.max(2, name.length - 1))}${domain}`;
}

export function clearStoredOtp() {
  try {
    sessionStorage.removeItem(OTP_STORAGE_KEY);
  } catch (e) {}
}

function hashCode(value) {
  try {
    return btoa(unescape(encodeURIComponent(`otp-v1:${value}`)));
  } catch {
    return `otp-v1:${value}`;
  }
}

function randomSixDigit() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function readOtp() {
  try {
    const raw = sessionStorage.getItem(OTP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeOtp(payload) {
  sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(payload));
}

async function sendSixDigitMail(email, code) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      _subject: `DentalLab kodunuz: ${code}`,
      _captcha: 'false',
      _template: 'box',
      name: 'DentalLab Pro',
      Kod: code,
      message: `6 haneli doğrulama kodunuz: ${code}\n\nBu kod 10 dakika geçerlidir.`
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'E-posta gönderilemedi');
  }
}

export async function sendEmailOtp(email) {
  const target = normalizeEmail(email);
  if (!isGmailAddress(target)) {
    return { ok: false, error: 'Yalnızca Gmail adresi kullanılabilir.' };
  }

  const existing = readOtp();
  if (existing?.lastSentAt && Date.now() - existing.lastSentAt < RESEND_GAP_MS) {
    const wait = Math.ceil((RESEND_GAP_MS - (Date.now() - existing.lastSentAt)) / 1000);
    return { ok: false, error: `Yeni kod için ${wait} saniye bekleyin.` };
  }

  const code = randomSixDigit();
  writeOtp({
    email: target,
    hash: hashCode(code),
    expiresAt: Date.now() + OTP_TTL_MS,
    lastSentAt: Date.now()
  });

  try {
    await sendSixDigitMail(target, code);
    return { ok: true, message: `6 haneli kod ${maskEmail(target)} adresine gönderildi.` };
  } catch {
    clearStoredOtp();
    return { ok: false, error: 'Kod gönderilemedi. Gmail adresini ve interneti kontrol edin.' };
  }
}

export async function verifyEmailOtp(email, token) {
  const target = normalizeEmail(email);
  const code = String(token || '').trim();
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: '6 haneli kodu girin.' };
  }

  const local = readOtp();
  const localValid = local
    && local.email === target
    && local.hash === hashCode(code)
    && local.expiresAt > Date.now();

  if (localValid) {
    clearStoredOtp();
    return { ok: true };
  }

  return { ok: false, error: 'Kod hatalı veya süresi doldu.' };
}
