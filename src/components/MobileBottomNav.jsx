import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Columns3,
  Plus,
  ClipboardList,
  Building2
} from 'lucide-react';

export const MobileBottomNav = () => {
  const { orders, setIsOrderModalOpen, setEditingOrder } = useDental();
  const { isAdmin, isOperator, isCompany } = useAuth();
  const location = useLocation();
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'rejected').length;
  const clinicsActive = ['/companies', '/doctors', '/patients'].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  if (isCompany) {
    return (
      <nav className="mobile-bottom-nav" aria-label="Mobil alt menü">
        <NavLink
          to="/orders"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon-wrap">
            <ClipboardList size={20} />
            {activeOrdersCount > 0 && (
              <span className="mobile-nav-badge">{activeOrdersCount > 99 ? '99+' : activeOrdersCount}</span>
            )}
          </div>
          <span>İşlerim</span>
        </NavLink>
        <NavLink
          to="/kanban"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Columns3 size={20} />
          <span>Hat</span>
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobil alt menü">
      {isAdmin && (
        <NavLink
          to="/"
          end
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Özet</span>
        </NavLink>
      )}

      {isAdmin && (
        <NavLink
          to="/kanban"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon-wrap">
            <Columns3 size={20} />
            {activeOrdersCount > 0 && (
              <span className="mobile-nav-badge">{activeOrdersCount > 99 ? '99+' : activeOrdersCount}</span>
            )}
          </div>
          <span>Kanban</span>
        </NavLink>
      )}

      <button
        type="button"
        className="mobile-nav-add-btn"
        onClick={() => {
          setEditingOrder(null);
          setIsOrderModalOpen(true);
        }}
        aria-label="Yeni sipariş ekle"
      >
        <Plus size={24} strokeWidth={2.6} />
      </button>

      <NavLink
        to="/orders"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <ClipboardList size={20} />
        <span>{isOperator ? 'İşlerim' : 'İşler'}</span>
      </NavLink>

      {isAdmin && (
        <NavLink
          to="/companies"
          className={() => `mobile-nav-item ${clinicsActive ? 'active' : ''}`}
        >
          <Building2 size={20} />
          <span>Klinikler</span>
        </NavLink>
      )}
    </nav>
  );
};
