import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  X,
  Layers,
  Sparkles,
  Server,
  RotateCcw
} from 'lucide-react';

export const DatabaseConfigModal = () => {
  const {
    isDbModalOpen,
    setIsDbModalOpen,
    dbConfig,
    saveDbConfig,
    dbStatus,
    isDbLoading,
    testAndSyncDb,
    orders,
    companies,
    doctors,
    patients,
    clearAllData,
    showToast
  } = useDental();

  const [provider, setProvider] = useState(dbConfig?.provider || 'supabase');
  const [supabaseUrl, setSupabaseUrl] = useState(dbConfig?.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(dbConfig?.supabaseKey || '');
  const [copiedSchema, setCopiedSchema] = useState(false);

  if (!isDbModalOpen) return null;

  const handleSave = async () => {
    saveDbConfig({
      provider,
      supabaseUrl: supabaseUrl.trim(),
      supabaseKey: supabaseKey.trim(),
      apiUrl: '/api/db'
    });
    showToast('Veritabanı ayarları kaydedildi. Bağlantı test ediliyor...');
    testAndSyncDb();
  };

  const handleCopySchemaNotice = () => {
    setCopiedSchema(true);
    showToast('schema.sql dosyasının yeri kopyalandı. Supabase SQL Editor içine yapıştırabilirsiniz.');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="dental-modal-overlay" onClick={() => setIsDbModalOpen(false)}>
      <div
        className="dental-modal"
        style={{ maxWidth: 680 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="dental-modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--dental-blue), var(--dental-teal))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px var(--dental-primary-glow)'
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Ücretsiz Bulut Veritabanı Bağlantısı
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Tüm cihazlarınızdan (telefon, ofis, ev) ortak çalışan kalıcı veritabanı
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={() => setIsDbModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Gövde */}
        <div className="dental-modal-body" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Bağlantı Durumu Kartı */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: dbStatus === 'connected' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${dbStatus === 'connected' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: dbStatus === 'connected' ? '#10b981' : '#f59e0b',
                  boxShadow: dbStatus === 'connected' ? '0 0 10px #10b981' : '0 0 10px #f59e0b'
                }}
              />
              <div>
                <strong style={{ fontSize: '0.92rem', display: 'block' }}>
                  {dbStatus === 'connected'
                    ? (provider === 'supabase' && supabaseUrl ? '🟢 Supabase PostgreSQL Veritabanı Aktif' : '🟢 Vercel Serverless / Yerel Veritabanı Aktif')
                    : '🟡 Veritabanı Bağlantısı Bekleniyor'}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  📊 Canlı Kayıtlar: {orders.length} Sipariş • {companies.length} Klinik • {doctors.length} Hekim • {patients.length} Hasta
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-dental btn-dental-secondary btn-dental-sm"
              onClick={testAndSyncDb}
              disabled={isDbLoading}
            >
              <RefreshCw size={14} className={isDbLoading ? 'spin-anim' : ''} />
              <span>{isDbLoading ? 'Bağlanıyor...' : 'Bağlantıyı Yenile'}</span>
            </button>
          </div>

          {/* Veritabanı Sağlayıcı Seçimi */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: 8, display: 'block' }}>
              Veritabanı Sağlayıcısını Seçin:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Supabase Seçeneği */}
              <div
                onClick={() => setProvider('supabase')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${provider === 'supabase' ? 'var(--dental-blue)' : 'var(--border-subtle)'}`,
                  background: provider === 'supabase' ? 'rgba(2, 132, 199, 0.05)' : 'var(--bg-surface-elevated)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: '0.92rem', color: provider === 'supabase' ? 'var(--dental-blue)' : 'inherit' }}>
                    ⚡ Supabase (PostgreSQL)
                  </strong>
                  {provider === 'supabase' && <CheckCircle2 size={16} color="var(--dental-blue)" />}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Tamamen ücretsiz, kredi kartsız, sınırsız API istekli gerçek PostgreSQL bulut veritabanı.
                </p>
              </div>

              {/* Vercel Postgres / Serverless Seçeneği */}
              <div
                onClick={() => setProvider('vercel')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${provider === 'vercel' ? 'var(--dental-blue)' : 'var(--border-subtle)'}`,
                  background: provider === 'vercel' ? 'rgba(2, 132, 199, 0.05)' : 'var(--bg-surface-elevated)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: '0.92rem', color: provider === 'vercel' ? 'var(--dental-blue)' : 'inherit' }}>
                    ▲ Vercel Postgres / KV
                  </strong>
                  {provider === 'vercel' && <CheckCircle2 size={16} color="var(--dental-blue)" />}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Vercel paneli üzerinden Storage sekmesinden tek tıkla oluşturulan dahili sunucusuz veritabanı.
                </p>
              </div>
            </div>
          </div>

          {/* Supabase Bağlantı Alanları */}
          {provider === 'supabase' && (
            <div style={{ background: 'var(--bg-surface-elevated)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Supabase Project URL:
                </label>
                <input
                  type="text"
                  placeholder="https://xyzabcdefghijklm.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="dental-input"
                  style={{ width: '100%', fontFamily: 'JetBrains Mono', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Supabase Anon Public API Key:
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="dental-input"
                  style={{ width: '100%', fontFamily: 'JetBrains Mono', fontSize: '0.84rem' }}
                />
              </div>

              {/* Hızlı Kurulum Rehberi */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: '0.82rem', color: '#0369a1' }}>
                    1 Dakikada Ücretsiz Supabase Nasıl Açılır?
                  </strong>
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--dental-blue)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                  >
                    supabase.com'a Git <ExternalLink size={12} />
                  </a>
                </div>
                <ol style={{ fontSize: '0.78rem', color: '#475569', margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                  <li><strong>supabase.com</strong> adresinde ücretsiz bir hesap açıp <strong>"New Project"</strong> deyin.</li>
                  <li>Sol menüdeki <strong>SQL Editor</strong> sekmesine tıklayın.</li>
                  <li>Projenizin kök dizinindeki <code>schema.sql</code> dosyasının içeriğini yapıştırıp <strong>"Run"</strong> butonuna basın (Tüm tablolarınız saniyeler içinde oluşur).</li>
                  <li>Sol alttaki <strong>Project Settings ➔ API</strong> sayfasına girip <strong>Project URL</strong> ve <strong>anon public</strong> anahtarını yukarıya yapıştırıp <strong>"Kaydet & Bağlan"</strong> butonuna basın.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Vercel Postgres Bilgilendirmesi */}
          {provider === 'vercel' && (
            <div style={{ background: 'var(--bg-surface-elevated)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: 6 }}>
                Vercel Üzerinde Otomatik Veritabanı Kullanımı
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Projenizi Vercel'e yüklediğinizde, Vercel Dashboard ➔ <strong>Storage</strong> sekmesinden <strong>Postgres</strong> veya <strong>KV</strong> eklediğinizde, uygulamamızın <code>/api/db</code> servisi ortam değişkenlerini otomatik olarak tanır ve hiçbir ayar yapmanıza gerek kalmadan tüm cihazlarınızı aynı veritabanına bağlar.
              </p>
            </div>
          )}
        </div>

        {/* Alt Butonlar */}
        <div className="dental-modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn-dental btn-dental-secondary"
              onClick={() => setIsDbModalOpen(false)}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className="btn-dental btn-dental-danger btn-dental-sm"
              style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}
              onClick={async () => {
                const ok = window.confirm(
                  'TÜM VERİLER SIFIRLANSIN MI?\n\n' +
                  '• Tüm klinikler\n' +
                  '• Tüm hekimler\n' +
                  '• Tüm hastalar\n' +
                  '• Tüm iş emirleri\n\n' +
                  'Bulut veritabanı dahil tamamen silinecektir. Onaylıyor musunuz?'
                );
                if (ok) {
                  await clearAllData();
                  setIsDbModalOpen(false);
                  if (window.location.hash !== '#/' && window.location.hash !== '') {
                    window.location.hash = '#/';
                  }
                }
              }}
              title="Bulut ve yerel dahil tüm verileri sil"
            >
              <RotateCcw size={14} />
              <span>Tüm Verileri Sıfırla</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-dental btn-dental-primary"
            onClick={handleSave}
          >
            <Check size={16} />
            <span>Ayarları Kaydet & Veritabanına Bağlan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
