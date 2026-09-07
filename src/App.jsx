import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DentalProvider, useDental } from './context/DentalContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OrderModal } from './components/OrderModal';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';
import { TeamModal } from './components/TeamModal';
import { MobileBottomNav } from './components/MobileBottomNav';

// Sayfalar
import { Dashboard } from './views/Dashboard';
import { KanbanView } from './views/KanbanView';
import { OrdersView } from './views/OrdersView';
import { OrderDetailView } from './views/OrderDetailView';
import { CompaniesView } from './views/CompaniesView';
import { DoctorsView } from './views/DoctorsView';
import { PatientsView } from './views/PatientsView';
import { MaterialsView } from './views/MaterialsView';

// Toast Bildirim Bileşeni
const ToastNotification = () => {
  const { toast } = useDental();
  if (!toast) return null;

  const borderLeftColor = toast.type === 'error'
    ? 'var(--status-urgent)'
    : (toast.type === 'warning' ? 'var(--status-revision)' : 'var(--dental-blue)');

  return (
    <div
      className="dental-toast-notification"
      style={{ borderLeftColor }}
    >
      <span>{toast.type === 'error' ? '✕' : (toast.type === 'warning' ? '⚠️' : '✓')}</span>
      <span>{toast.message}</span>
    </div>
  );
};

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', isSidebarOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [isSidebarOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="app-layout">
      {/* Sol Menü */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Ana İçerik */}
      <div className="main-content-flow">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        <main className="page-body-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kanban" element={<KanbanView />} />
            <Route path="/orders" element={<OrdersView />} />
            <Route path="/orders/:id" element={<OrderDetailView />} />
            <Route path="/companies" element={<CompaniesView />} />
            <Route path="/doctors" element={<DoctorsView />} />
            <Route path="/patients" element={<PatientsView />} />
            <Route path="/materials" element={<MaterialsView />} />
          </Routes>
        </main>
      </div>

      {/* Yeni Sipariş Modalı */}
      <OrderModal />

      {/* Ücretsiz Veritabanı Ayarları Modalı */}
      <DatabaseConfigModal />

      {/* Laboratuvar Ekibi / Teknisyenler Modalı */}
      <TeamModal />

      {/* Mobil Alt Navigasyon Çubuğu */}
      <MobileBottomNav />

      {/* Toast Bildirimleri */}
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <DentalProvider>
        <AppLayout />
      </DentalProvider>
    </HashRouter>
  );
}
