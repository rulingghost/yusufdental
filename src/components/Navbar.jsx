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
      <div className="navbar-left-group">
        {/* Mobil Hamburger Menü Butonu */}
        <button
          type="button"
          className="btn-dental btn-dental-secondary btn-dental-sm navbar-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Menüyü Aç"
        >
          <Menu size={20} />
        </button>

        <div className="top-navbar-search">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Sipariş, hasta, hekim veya klinik ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="navbar-right-group">
        {/* Veritabanı Durumu Butonu */}
        <button
          type="button"
          className="btn-dental btn-dental-secondary navbar-db-btn"
          onClick={() => setIsDbModalOpen && setIsDbModalOpen(true)}
          title="Supabase Bulut Veritabanı Durumu"
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
          <span className="navbar-btn-text">
            {dbStatus === 'connected' ? 'Bulut: Aktif' : 'Bulut'}
          </span>
        </button>

        {/* Yeni Sipariş Butonu */}
        <button
          type="button"
          className="btn-dental btn-dental-primary navbar-new-order-btn"
          onClick={() => setIsOrderModalOpen(true)}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="navbar-btn-text">Yeni İş Emri</span>
        </button>

        {/* Tema Değiştirici */}
        <button
          type="button"
          className="btn-dental btn-dental-secondary navbar-theme-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Koyu Safir Temaya Geç' : 'Ferah Dental Temaya Geç'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};
