import React from 'react';
import { useDental } from '../context/DentalContext';
import { Search, Plus, Sun, Moon, Menu, Database } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const {
    searchQuery,
    setSearchQuery,
    theme,
    toggleTheme,
    setIsOrderModalOpen,
    setIsDbModalOpen,
    dbStatus
  } = useDental();

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          className="btn-dental btn-dental-secondary btn-dental-sm"
          onClick={onToggleSidebar}
          style={{ display: 'none' }}
        >
          <Menu size={18} />
        </button>

        <div className="top-navbar-search">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Sipariş no, hasta adı, hekim, klinik veya diş no ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Ücretsiz Veritabanı Durumu & Ayarları */}
        <button
          type="button"
          className="btn-dental btn-dental-secondary"
          onClick={() => setIsDbModalOpen && setIsDbModalOpen(true)}
          title="Ücretsiz Veritabanı Durumu & Ayarları"
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px' }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: dbStatus === 'connected' ? '#10b981' : '#f59e0b',
              boxShadow: dbStatus === 'connected' ? '0 0 6px #10b981' : 'none',
              flexShrink: 0
            }}
          />
          <Database size={15} color="var(--dental-blue)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            {dbStatus === 'connected' ? 'Veritabanı: Aktif' : 'Veritabanı'}
          </span>
        </button>

        {/* Yeni Sipariş Butonu */}
        <button
          type="button"
          className="btn-dental btn-dental-primary"
          onClick={() => setIsOrderModalOpen(true)}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Yeni İş Emri Başlat</span>
        </button>

        {/* Tema Değiştirici */}
        <button
          type="button"
          className="btn-dental btn-dental-secondary"
          style={{ padding: 9, borderRadius: 'var(--radius-md)' }}
          onClick={toggleTheme}
          title={theme === 'light' ? 'Koyu Safir Temaya Geç' : 'Ferah Dental Temaya Geç'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};
