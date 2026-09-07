import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DentalProvider, useDental } from './context/DentalContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OrderModal } from './components/OrderModal';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';

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

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderLeft: `4px solid ${toast.type === 'error' ? 'var(--status-urgent)' : (toast.type === 'warning' ? 'var(--status-revision)' : 'var(--dental-blue)')}`,
        padding: '12px 20px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '0.88rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        animation: 'popModal 0.2s ease-out'
      }}
    >
      <span>{toast.type === 'error' ? '✕' : (toast.type === 'warning' ? '⚠️' : '✓')}</span>
      <span>{toast.message}</span>
    </div>
  );
};

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
