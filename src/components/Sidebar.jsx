import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import {
  LayoutDashboard,
  Columns3,
  ClipboardList,
  Building2,
  Stethoscope,
  Users,
  BookOpen,
  Download,
  Upload,
  RotateCcw,
  Database
} from 'lucide-react';

export const Sidebar = () => {
  const { orders, exportData, importData, clearAllData, setIsDbModalOpen } = useDental();
  const fileInputRef = useRef(null);

  const activeOrdersCount = orders.filter(o => o.status === 'in_progress').length;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importData(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="brand-section">
        <div className="brand-icon-dental">
          {/* Dental Tooth SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2C4.5 2 3 4 3 6.5C3 9 4.2 12.5 5 15.5C5.8 18.5 6.5 22 8 22C9.5 22 10 19 11 15C11.5 13 12.5 13 13 15C14 19 14.5 22 16 22C17.5 22 18.2 18.5 19 15.5C19.8 12.5 21 9 21 6.5C21 4 19.5 2 17 2C15 2 13.5 3.5 12 3.5C10.5 3.5 9 2 7 2Z"/>
          </svg>
        </div>
        <div className="brand-info">
          <h1>DentalLab Pro</h1>
          <span>Diş Üretim ERP</span>
        </div>
      </div>

      {/* Nav Linkleri */}
      <ul className="nav-menu">
        <li className="nav-heading">Üretim & Takip</li>
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Genel Bakış</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/kanban"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
          >
            <Columns3 size={18} />
            <span>Üretim Hattı (Kanban)</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/orders"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
          >
            <ClipboardList size={18} />
            <span>Tüm İş Emirleri</span>
            {activeOrdersCount > 0 && (
              <span className="nav-badge-count">{activeOrdersCount}</span>
            )}
          </NavLink>
        </li>

        <li className="nav-heading">Paydaşlar</li>
        <li>
          <NavLink
            to="/companies"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
          >
            <Building2 size={18} />
            <span>Klinikler & Firmalar</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/doctors"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
          >
            <Stethoscope size={18} />
            <span>Hekimler & Doktorlar</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/patients"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Hastalar & Arşiv</span>
          </NavLink>
        </li>

        <li className="nav-heading">Teknik Rehber</li>
        <li>
          <NavLink
            to="/materials"
            className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            <span>Materyal & Aşamalar</span>
          </NavLink>
        </li>

        <li className="nav-heading">Veritabanı & Yedekleme</li>
        <li style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Ücretsiz Veritabanı Ayarları Butonu */}
          <button
            type="button"
            className="btn-dental btn-dental-secondary btn-dental-sm"
            style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--bg-surface-elevated)' }}
            onClick={() => setIsDbModalOpen && setIsDbModalOpen(true)}
            title="Ücretsiz Bulut Veritabanı Bağlantısı"
          >
            <Database size={15} color="var(--dental-blue)" />
            <span>🗄️ Veritabanı Bağlantısı</span>
          </button>

          <button
            type="button"
            className="btn-dental btn-dental-secondary btn-dental-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={exportData}
          >
            <Download size={15} />
            <span>Yedek İndir (JSON)</span>
          </button>
          <button
            type="button"
            className="btn-dental btn-dental-secondary btn-dental-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <Upload size={15} />
            <span>Yedek Yükle</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            style={{ display: 'none' }}
          />

          {/* TÜM VERİLERİ SIFIRLAMA BUTONU */}
          <button
            type="button"
            className="btn-dental btn-dental-danger btn-dental-sm"
            style={{ width: '100%', justifyContent: 'flex-start', background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}
            onClick={() => {
              if (window.confirm('TÜM VERİLER SIFIRLANSIN MI?\n\nKayıtlı tüm klinikler, doktorlar, hastalar ve iş emirleri silinecektir. Kendi verilerinizi sıfırdan girmek için bu işlemi onaylayabilirsiniz.')) {
                clearAllData();
              }
            }}
            title="Tüm verileri temizle, sıfırdan kendi kliniklerini ekle"
          >
            <RotateCcw size={15} />
            <span>🗑️ Tüm Verileri Sıfırla</span>
          </button>
        </li>
      </ul>

      {/* Profil Alt Alanı */}
      <div className="sidebar-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--dental-blue), var(--dental-teal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#fff'
            }}
          >
            YU
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Yusuf Usta</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Baş Teknisyen / Seramist</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
