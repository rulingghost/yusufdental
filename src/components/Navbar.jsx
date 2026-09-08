import React, { useRef, useEffect } from 'react';
import { useDental } from '../context/DentalContext';
import { Search, Plus, Sun, Moon, Menu, X, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onToggleSidebar }) => {
  const {
    searchQuery,
    setSearchQuery,
    theme,
    toggleTheme,
    setIsOrderModalOpen,
    setEditingOrder,
    setIsTeamModalOpen,
    technicians
  } = useDental();
  const { isAdmin, isOperator, isCompany, logout, currentUser } = useAuth();

  const searchInputRef = useRef(null);

  // Global Klavye Kısayolları (Ctrl+K -> Arama, Ctrl+N -> Yeni İş Emri)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K veya Cmd+K: Aramaya odaklan
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // Ctrl+N veya Cmd+N: Yeni sipariş modalını aç (eğer input içinde yazmıyorsa)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        if (!isCompany) {
          setEditingOrder(null);
          setIsOrderModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOrderModalOpen, setEditingOrder, isCompany]);

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
            ref={searchInputRef}
            type="text"
            placeholder="Hasta, hekim, klinik veya iş emri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              type="button"
              className="navbar-clear-btn"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              title="Aramayı Temizle"
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="navbar-kbd desktop-only" title="Hızlı Arama (Ctrl + K)">
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      <div className="navbar-right-group">
        {isAdmin && (
        <button
          type="button"
          className="btn-dental btn-dental-secondary desktop-only"
          onClick={() => setIsTeamModalOpen && setIsTeamModalOpen(true)}
          title="Laboratuvar teknisyenlerini ve ekibi yönet"
        >
          <Users size={15} color="var(--dental-blue)" />
          <span className="navbar-btn-text">
            Ekip ({technicians ? technicians.length : 0})
          </span>
        </button>
        )}

        {!isCompany && (
        <button
          type="button"
          className="btn-dental btn-dental-primary navbar-new-order-btn"
          onClick={() => {
            setEditingOrder(null);
            setIsOrderModalOpen(true);
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="navbar-btn-text">{isOperator ? 'İş Emri Başlat' : 'Yeni İş Emri'}</span>
        </button>
        )}

        <button
          type="button"
          className="btn-dental btn-dental-secondary navbar-theme-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Koyu Safir Temaya Geç' : 'Ferah Dental Temaya Geç'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          type="button"
          className="btn-dental btn-dental-secondary btn-dental-sm"
          onClick={logout}
          title={`${currentUser?.name || ''} çıkış`}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
