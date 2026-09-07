import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import {
  LayoutDashboard,
  Columns3,
  Plus,
  ClipboardList,
  Building2
} from 'lucide-react';

export const MobileBottomNav = () => {
  const { orders, setIsOrderModalOpen } = useDental();
  const activeOrdersCount = orders.filter(o => o.status === 'in_progress').length;

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Özet</span>
      </NavLink>

      <NavLink
        to="/kanban"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div style={{ position: 'relative' }}>
          <Columns3 size={20} />
          {activeOrdersCount > 0 && (
            <span className="mobile-nav-badge">{activeOrdersCount}</span>
          )}
        </div>
        <span>Kanban</span>
      </NavLink>

      {/* Orta Hızlı Sipariş Ekleme Butonu */}
      <button
        type="button"
        className="mobile-nav-add-btn"
        onClick={() => setIsOrderModalOpen(true)}
        aria-label="Yeni Sipariş Ekle"
      >
        <Plus size={24} strokeWidth={2.6} />
      </button>

      <NavLink
        to="/orders"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <ClipboardList size={20} />
        <span>İşler</span>
      </NavLink>

      <NavLink
        to="/companies"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Building2 size={20} />
        <span>Klinikler</span>
      </NavLink>
    </nav>
  );
};
