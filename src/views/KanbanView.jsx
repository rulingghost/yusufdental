import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import {
  Plus,
  RotateCcw,
  CheckCircle2,
  Factory,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  X,
  Clock,
  User,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const KanbanView = () => {
  const navigate = useNavigate();
  const {
    orders,
    companies,
    doctors,
    patients,
    materials,
    technicians,
    advanceOrderToNextStep,
    regressOrderToPrevStep,
    moveOrderToStep,
    restartOrder,
    setIsOrderModalOpen
  } = useDental();

  // 'active_pipeline' (Üretim hattı) vs 'completed_archive' (Tamamlananlar)
  const [viewMode, setViewMode] = useState('active_pipeline');

  // Filtreleme Durumları
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClinic, setFilterClinic] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterMaterial, setFilterMaterial] = useState('all');
  const [filterTechnician, setFilterTechnician] = useState('all');

  // Mobil İstasyon Filtresi ('all' veya istasyon id'si örn: 'col-model')
  const [activeMobileStation, setActiveMobileStation] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sürükle-Bırak Durumu
  const [draggedOrderId, setDraggedOrderId] = useState(null);
  const [dragOverStationId, setDragOverStationId] = useState(null);

  // Sadece tamamlanmayan (aktif üretimdeki) siparişler
  const activeOrders = orders.filter(o => o.status !== 'completed');
  // Tamamlanan siparişler
  const completedOrders = orders.filter(o => o.status === 'completed');

  // 8 Klinik Üretim İstasyonu
  const STATIONS = [
    {
      id: 'col-model',
      title: '1. Model & Alçı',
      stepIndex: 0,
      filter: s => s.name.includes('Model') || s.name.includes('Tarama') || s.name.includes('Alçı') || s.name.includes('Analog')
    },
    {
      id: 'col-cad',
      title: '2. Mum & CAD Dizayn',
      stepIndex: 1,
      filter: s => s.name.includes('Mum') || s.name.includes('CAD') || s.name.includes('Dayanak') || s.name.includes('Wax')
    },
    {
      id: 'col-metal',
      title: '3. Altyapı & CAM Freze',
      stepIndex: 2,
      filter: s => s.name.includes('Alt Yapı') || s.name.includes('Frezeleme') || s.name.includes('Presleme') || s.name.includes('Bar') || s.name.includes('Kazıma')
    },
    {
      id: 'col-build',
      title: '4. Katmanlama & Seramik',
      stepIndex: 3,
      filter: s => s.name.includes('Katmanlama') || s.name.includes('Opak') || s.name.includes('Divestment') || s.name.includes('Ayırma')
    },
    {
      id: 'col-furnace',
      title: '5. Fırınlama & Sinter',
      stepIndex: 4,
      filter: s => s.name.includes('Fırınlama') || s.name.includes('Sinterleme') || s.name.includes('Kristalizasyon') || s.name.includes('Sinter')
    },
    {
      id: 'col-morph',
      title: '6. Morfoloji & Uyum',
      stepIndex: 5,
      filter: s => s.name.includes('Morfoloji') || s.name.includes('Rötuş') || s.name.includes('Pasif Uyum') || s.name.includes('Tesviye') || s.name.includes('Vida')
    },
    {
      id: 'col-glaze',
      title: '7. Glaze, Renk & Cila',
      stepIndex: 6,
      filter: s => s.name.includes('Glaze') || s.name.includes('Karakterizasyon') || s.name.includes('Polisaj') || s.name.includes('Cila')
    },
    {
      id: 'col-delivery',
      title: '8. Kalite & Sevkiyat',
      stepIndex: 7,
      filter: s => s.name.includes('Kalite') || s.name.includes('Sevkiyat') || s.name.includes('Paket') || s.name.includes('Teslimat')
    }
  ];

  // Filtrelenmiş Aktif Siparişler
  const filteredActiveOrders = activeOrders.filter(order => {
    const pat = patients.find(p => p.id === order.patientId);
    const doc = doctors.find(d => d.id === order.doctorId);
    const comp = companies.find(c => c.id === order.companyId);
    const curStep = order.steps?.[order.currentStepIndex];

    // Arama Metni Filtresi
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = order.id?.toLowerCase().includes(q);
      const matchPat = pat?.name?.toLowerCase().includes(q);
      const matchDoc = doc?.name?.toLowerCase().includes(q);
      const matchComp = comp?.name?.toLowerCase().includes(q);
      const matchTeeth = (order.teeth || []).some(t => t.toString().includes(q));
      if (!matchId && !matchPat && !matchDoc && !matchComp && !matchTeeth) return false;
    }

    // Klinik Filtresi
    if (filterClinic !== 'all' && order.companyId !== filterClinic) return false;

    // Öncelik Filtresi
    if (filterPriority !== 'all' && order.priority !== filterPriority) return false;

    // Materyal Filtresi
    if (filterMaterial !== 'all' && order.materialId !== filterMaterial) return false;

    // Teknisyen Filtresi
    if (filterTechnician !== 'all') {
      const techName = curStep?.technician || '';
      if (!techName.includes(filterTechnician)) return false;
    }

    return true;
  });

  // Drag & Drop İşleyicileri
  const handleDragStart = (e, orderId) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('text/plain', orderId);
    e.currentTarget.classList.add('is-dragging');
  };

  const handleDragEnd = (e) => {
    setDraggedOrderId(null);
    setDragOverStationId(null);
    e.currentTarget.classList.remove('is-dragging');
  };

  const handleDragOver = (e, stationId) => {
    e.preventDefault();
    if (dragOverStationId !== stationId) {
      setDragOverStationId(stationId);
    }
  };

  const handleDragLeave = (e, stationId) => {
    if (dragOverStationId === stationId) {
      setDragOverStationId(null);
    }
  };

  const handleDrop = (e, targetStation) => {
    e.preventDefault();
    setDragOverStationId(null);
    const orderId = draggedOrderId || e.dataTransfer.getData('text/plain');
    if (!orderId) return;

    const order = orders.find(o => o.id === orderId);
    if (!order || !order.steps) return;

    // Hedef istasyonun filtresine uyan aşama indeksini bul
    let targetIndex = order.steps.findIndex(st => targetStation.filter(st));
    if (targetIndex === -1) {
      targetIndex = Math.min(targetStation.stepIndex, order.steps.length - 1);
    }

    if (targetIndex >= 0) {
      moveOrderToStep(orderId, targetIndex);
    }
  };

  const handleRestartOrder = (orderId, e) => {
    e.stopPropagation();
    if (window.confirm('Bu tamamlanmış iş emri tekrar üretime geri alınsın ve üzerinde işlem yapılsın mı?')) {
      const order = orders.find(o => o.id === orderId);
      const targetStep = order?.steps?.length ? Math.max(0, order.steps.length - 2) : 0;
      restartOrder(orderId, targetStep, 'Kullanıcı talebiyle üretim hattına geri alındı');
      setViewMode('active_pipeline');
    }
  };

  const isFiltered = searchTerm || filterClinic !== 'all' || filterPriority !== 'all' || filterMaterial !== 'all' || filterTechnician !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setFilterClinic('all');
    setFilterPriority('all');
    setFilterMaterial('all');
    setFilterTechnician('all');
  };

  return (
    <div>
      {/* Üst Başlık ve Görünüm Değiştirici */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Üretim İstasyonları (Kanban Panosu)
            </h2>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 999,
                background: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--dental-blue)',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              {activeOrders.length} Aktif Üretimde
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            {viewMode === 'active_pipeline'
              ? 'Kartları "Sonraki Aşamaya Geçir" butonuyla veya sürükleyip bırakarak hızlıca bir sonraki istasyona aktarın.'
              : 'Tamamlanan protez işleri arşivi. Dilediğiniz zaman "Yeniden Başlat" ile geri alabilirsiniz.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Aktif vs Tamamlananlar Sekmesi */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className={`btn-dental btn-dental-sm ${viewMode === 'active_pipeline' ? 'btn-dental-primary' : 'btn-dental-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setViewMode('active_pipeline')}
            >
              <Factory size={15} />
              <span>Üretim Hattı ({activeOrders.length})</span>
            </button>
            <button
              type="button"
              className={`btn-dental btn-dental-sm ${viewMode === 'completed_archive' ? 'btn-dental-primary' : 'btn-dental-secondary'}`}
              style={{ border: 'none', marginLeft: 4 }}
              onClick={() => setViewMode('completed_archive')}
            >
              <CheckCircle2 size={15} />
              <span>Tamamlananlar Arşivi ({completedOrders.length})</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-dental btn-dental-primary"
            onClick={() => setIsOrderModalOpen(true)}
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>Yeni İş Emri Başlat</span>
          </button>
        </div>
      </div>

      {/* Gelişmiş Filtreleme & Arama Araç Çubuğu (Kanban İçin) */}
      {viewMode === 'active_pipeline' && (
        <div className="kanban-toolbar">
          <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
            {/* Arama Kutusu */}
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Hasta adı, klinik, diş no veya iş emri..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dental-input"
                style={{ width: '100%', paddingLeft: 34, fontSize: '0.84rem' }}
              />
            </div>

            {/* Mobilde Filtreleri Aç/Kapa Butonu */}
            <button
              type="button"
              className={`btn-dental btn-dental-sm kanban-mobile-filter-toggle ${isFiltered ? 'btn-dental-primary' : 'btn-dental-secondary'}`}
              onClick={() => setShowMobileFilters(prev => !prev)}
            >
              <Filter size={15} />
              <span>Filtrele {isFiltered && '●'}</span>
            </button>
          </div>

          {/* Filtre Seçicileri */}
          <div className={`kanban-filter-group ${showMobileFilters ? 'is-expanded' : ''}`}>
            {/* Klinik Filtresi */}
            <select
              value={filterClinic}
              onChange={(e) => setFilterClinic(e.target.value)}
              className="kanban-filter-select"
            >
              <option value="all">🏥 Tüm Klinikler ({companies.length})</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Öncelik Filtresi */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="kanban-filter-select"
            >
              <option value="all">⚡ Tüm Öncelikler</option>
              <option value="urgent">🔴 Acil (Vaka)</option>
              <option value="vip">⭐ VIP Özel</option>
              <option value="normal">🟢 Normal</option>
            </select>

            {/* Materyal Filtresi */}
            <select
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value)}
              className="kanban-filter-select"
            >
              <option value="all">🦷 Tüm Materyaller</option>
              <option value="porcelain">Porselen (PFM)</option>
              <option value="zirconia">Zirkonyum (CAD/CAM)</option>
              <option value="emax">E-Max / Lamina</option>
              <option value="implant">İmplant Üstü Hibrit</option>
            </select>

            {/* Teknisyen Filtresi */}
            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="kanban-filter-select"
            >
              <option value="all">👷 Tüm Teknisyenler</option>
              {technicians.map(t => (
                <option key={t} value={t.split(' ')[0]}>{t}</option>
              ))}
            </select>

            {/* Filtreleri Temizle */}
            {isFiltered && (
              <button
                type="button"
                className="btn-dental btn-dental-secondary btn-dental-sm"
                onClick={resetFilters}
                style={{ fontSize: '0.78rem', color: '#dc2626' }}
              >
                <X size={14} />
                <span>Temizle</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MOBİL İSTASYON HIZLI GEÇİŞ SEKMELERİ (Kolay Tek Parmak Kullanımı) */}
      {viewMode === 'active_pipeline' && orders.length > 0 && (
        <div className="kanban-mobile-station-tabs">
          <button
            type="button"
            className={`kanban-station-tab-btn ${activeMobileStation === 'all' ? 'active' : ''}`}
            onClick={() => setActiveMobileStation('all')}
          >
            <span>🌟 Tümü ({filteredActiveOrders.length})</span>
          </button>
          {STATIONS.map(st => {
            const count = filteredActiveOrders.filter(o => {
              const curStep = o.steps?.[o.currentStepIndex];
              return curStep && st.filter(curStep);
            }).length;

            return (
              <button
                key={st.id}
                type="button"
                className={`kanban-station-tab-btn ${activeMobileStation === st.id ? 'active' : ''}`}
                onClick={() => setActiveMobileStation(st.id)}
              >
                <span>{st.title}</span>
                <span className={`station-tab-badge ${count > 0 ? 'has-jobs' : ''}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* SIFIR VERİ DURUMU (Tertemiz Sistem) */}
      {orders.length === 0 && (
        <div
          style={{
            padding: '60px 30px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            border: '2px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            margin: '20px 0'
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(2, 132, 199, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--dental-blue)'
            }}
          >
            <Factory size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 6 }}>
            Üretim Hattında Henüz İş Emri Bulunmuyor
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 500, margin: '0 auto 20px' }}>
            Sisteminiz tertemiz ve hazır. Sol menüden kliniklerinizi ve hekimlerinizi ekleyebilir, ardından yeni diş protez iş emirlerinizi başlatabilirsiniz.
          </p>
          <button
            type="button"
            className="btn-dental btn-dental-primary"
            onClick={() => setIsOrderModalOpen(true)}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>İlk İş Emrini Başlat</span>
          </button>
        </div>
      )}

      {/* GÖRÜNÜM 1: AKTİF ÜRETİM KANBAN İSTASYONLARI */}
      {viewMode === 'active_pipeline' && orders.length > 0 && (
        <div className={`kanban-board-container ${activeMobileStation !== 'all' ? 'has-single-station' : ''}`}>
          {(activeMobileStation === 'all' ? STATIONS : STATIONS.filter(s => s.id === activeMobileStation)).map(st => {
            // Bu istasyona uyan siparişler
            const matchingOrders = filteredActiveOrders.filter(o => {
              const curStep = o.steps?.[o.currentStepIndex];
              if (!curStep) return false;
              return st.filter(curStep);
            });

            return (
              <div
                key={st.id}
                className={`kanban-station-col ${activeMobileStation !== 'all' ? 'is-single-station' : ''} ${dragOverStationId === st.id ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, st.id)}
                onDragLeave={(e) => handleDragLeave(e, st.id)}
                onDrop={(e) => handleDrop(e, st)}
              >
                {/* İstasyon Başlığı */}
                <div className="kanban-station-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: '0.92rem' }}>{st.title}</strong>
                  </div>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: matchingOrders.length > 0 ? 'var(--dental-blue)' : 'var(--bg-surface)',
                      color: matchingOrders.length > 0 ? '#fff' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {matchingOrders.length}
                  </span>
                </div>

                {/* Kartlar Akışı */}
                <div className="station-cards-flow">
                  {matchingOrders.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px 10px',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(0,0,0,0.01)'
                      }}
                    >
                      Bu aşamada bekleyen iş yok
                      <div style={{ fontSize: '0.72rem', marginTop: 4, color: 'var(--text-muted)' }}>
                        (Kartları buraya sürükleyebilirsiniz)
                      </div>
                    </div>
                  ) : (
                    matchingOrders.map(order => {
                      const pat = patients.find(p => p.id === order.patientId);
                      const doc = doctors.find(d => d.id === order.doctorId);
                      const comp = companies.find(c => c.id === order.companyId);
                      const curStep = order.steps?.[order.currentStepIndex];
                      const totalSteps = order.steps?.length || 1;
                      const curIndex = order.currentStepIndex || 0;
                      const isLastStep = curIndex >= totalSteps - 1;

                      const completedCount = (order.steps || []).filter(s => s.status === 'completed').length;
                      const pct = Math.round((completedCount / totalSteps) * 100);

                      // Öncelik Rozeti
                      const priorityConfig = {
                        urgent: { label: '🔴 ACİL', color: '#ef4444', bg: '#fee2e2' },
                        vip: { label: '⭐ VIP', color: '#d97706', bg: '#fef3c7' },
                        normal: { label: 'Normal', color: '#0284c7', bg: '#e0f2fe' }
                      }[order.priority || 'normal'];

                      return (
                        <div
                          key={order.id}
                          className="job-card"
                          data-priority={order.priority}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, order.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => navigate('/orders/' + order.id)}
                        >
                          {/* Üst Bilgi: Sipariş No & Öncelik */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', fontWeight: 800, color: 'var(--dental-blue)' }}>
                              #{order.id}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: 4,
                                color: priorityConfig.color,
                                background: priorityConfig.bg
                              }}
                            >
                              {priorityConfig.label}
                            </span>
                          </div>

                          {/* Hasta Adı */}
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 3 }}>
                            {pat?.name || 'İsimsiz Hasta'}
                          </div>

                          {/* Klinik & Hekim */}
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building2 size={13} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {comp?.name ? comp.name.replace(' Ağız ve Diş Sağlığı', '') : '-'}
                              {doc?.name ? ` (${doc.name})` : ''}
                            </span>
                          </div>

                          {/* Diş No & VITA Renk Rozetleri */}
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                padding: '2px 7px',
                                background: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 4,
                                fontFamily: 'JetBrains Mono',
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}
                            >
                              🦷 {(order.teeth || []).join(', ') || '-'}
                            </span>

                            <span
                              style={{
                                padding: '2px 7px',
                                background: '#f0fdf4',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                borderRadius: 4,
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}
                            >
                              🎨 {order.shade || 'A2'}
                            </span>
                          </div>

                          {/* Mevcut Aşama & İlerleme */}
                          <div style={{ marginTop: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, color: 'var(--dental-blue)' }}>
                                Adım {curIndex + 1}/{totalSteps}: {curStep?.name || 'İşlemde'}
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>%{pct}</span>
                            </div>
                            <div style={{ height: 5, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--dental-blue), var(--dental-teal))' }} />
                            </div>
                          </div>

                          {/* Alt Kısım: Sorumlu & Teslim Tarihi */}
                          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <User size={12} />
                              {curStep?.technician ? curStep.technician.split(' ')[0] : 'Atanmadı'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: order.priority === 'urgent' ? '#dc2626' : 'inherit', fontWeight: order.priority === 'urgent' ? 700 : 400 }}>
                              <Calendar size={12} />
                              {order.deliveryDate || '-'}
                            </span>
                          </div>

                          {/* HIZLI EYLEM BUTONLARI (Kullanışlılık & Hız) */}
                          <div className="job-card-actions" onClick={(e) => e.stopPropagation()}>
                            {/* Bir önceki aşamaya geri alma butonu */}
                            {curIndex > 0 && (
                              <button
                                type="button"
                                className="job-regress-btn"
                                onClick={() => regressOrderToPrevStep(order.id)}
                                title="Bir önceki istasyona geri al"
                              >
                                <ArrowLeft size={13} />
                              </button>
                            )}

                            {/* Doğrudan Sonraki Aşamaya İlerletme Butonu */}
                            <button
                              type="button"
                              className="job-advance-btn"
                              onClick={() => advanceOrderToNextStep(order.id)}
                              title={isLastStep ? 'Bu işi bitir ve arşive aktar' : 'Sonraki üretim istasyonuna aktar'}
                            >
                              <span>{isLastStep ? '✓ İşi Tamamla' : 'Sonraki Aşama'}</span>
                              <ArrowRight size={13} />
                            </button>

                            {/* Detay Butonu */}
                            <button
                              type="button"
                              className="btn-dental btn-dental-secondary"
                              style={{ padding: '6px 9px', fontSize: '0.75rem' }}
                              onClick={() => navigate('/orders/' + order.id)}
                              title="İş emri reçete ve detayını incele"
                            >
                              Detay
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GÖRÜNÜM 2: TAMAMLANANLAR ARŞİVİ (YENİDEN BAŞLATMA VE DÜZENLEME) */}
      {viewMode === 'completed_archive' && (
        <div>
          <div style={{ padding: '14px 18px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={20} color="#059669" />
              <span style={{ fontSize: '0.9rem', color: '#065f46', fontWeight: 600 }}>
                Tamamlanan protez işleri üretim hattında kalabalık yaratmaması için burada arşivlenir. Kliniğin revizyon veya ilave isteğinde <strong>"İşlemi Yeniden Başlat"</strong> butonuyla hemen üretim hattına geri alabilirsiniz.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {completedOrders.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                Henüz tamamlanmış iş emri bulunmuyor.
              </div>
            ) : (
              completedOrders.map(order => {
                const pat = patients.find(p => p.id === order.patientId);
                const doc = doctors.find(d => d.id === order.doctorId);
                const comp = companies.find(c => c.id === order.companyId);

                return (
                  <div
                    key={order.id}
                    className="dental-card"
                    style={{
                      borderLeft: '4px solid var(--status-completed)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: 'var(--status-completed)', fontSize: '0.9rem' }}>
                          #{order.id}
                        </span>
                        <span className="badge-pill badge-completed">
                          Tamamlandı ✓
                        </span>
                      </div>

                      <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 4 }}>
                        {pat?.name || 'İsimsiz Hasta'}
                      </div>

                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        🏥 {comp?.name || '-'} {doc?.name ? `• ${doc.name}` : ''}
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)' }}>
                          Materyal: {order.materialId}
                        </span>
                        <span className="badge-pill" style={{ background: '#e0f2fe', color: '#0284c7', fontWeight: 700 }}>
                          VITA: {order.shade}
                        </span>
                        <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)', fontFamily: 'JetBrains Mono' }}>
                          FDI: {(order.teeth || []).join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* YENİDEN BAŞLAT & DETAY BUTONLARI */}
                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn-dental btn-dental-primary btn-dental-sm"
                        style={{ flex: 1, background: 'linear-gradient(135deg, #0d9488, #0284c7)' }}
                        onClick={(e) => handleRestartOrder(order.id, e)}
                        title="Bu işlemi tekrar aktif üretim hattına al"
                      >
                        <RotateCcw size={14} />
                        <span>İşlemi Yeniden Başlat & Revize Et</span>
                      </button>

                      <button
                        type="button"
                        className="btn-dental btn-dental-secondary btn-dental-sm"
                        onClick={() => navigate('/orders/' + order.id)}
                      >
                        <span>Detay & Düzenle</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
