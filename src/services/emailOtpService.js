// Bu servis kaldırılmıştır. Gmail doğrulaması ve OTP sistemi iptal edilmiştir.
export function isGmailAddress() { return false; }
export function normalizeEmail(v) { return String(v || '').trim().toLowerCase(); }
export function maskEmail(v) { return v; }
export function clearStoredOtp() {}
export async function sendEmailOtp() { return { ok: false, error: 'E-posta doğrulaması devredışıdır.' }; }
export async function verifyEmailOtp() { return { ok: false, error: 'E-posta doğrulaması devredışıdır.' }; }
