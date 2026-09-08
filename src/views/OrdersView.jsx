import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDental, isOrderFromCompletedImplant } from '../context/DentalContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Printer, Trash2, RotateCcw, CheckCircle2, Factory, ChevronDown, ChevronUp, ExternalLink, Pencil, ClipboardList } from 'lucide-react';
import { PrintSlip } from '../components/PrintSlip';
import { StepDateModal } from '../components/StepDateModal';

export const OrdersView = () => {
  const navigate = useNavigate();
  const { orders, companies, doctors, patients, materials, deleteOrder, restartOrder, searchQuery, setIsOrderModalOpen, setEditingOrder, approveOrder } = useDental();

  // 'active' (Üretim aşamasındakiler) vs 'completed' (Tamamlananlar bölümü)
  const { isAdmin, isOperator, isCompany } = useAuth();
  const [tabMode, setTabMode] = useState(isCompany ? 'all' : 'active');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [printingOrder, setPrintingOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [approveTargetId, setApproveTargetId] = useState(null);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'rejected').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

  let filtered = orders.filter(o => {
    if (tabMode === 'all') return true;
    if (tabMode === 'active') return o.status !== 'completed';
    return o.status === 'completed';
  });

  if (filterMaterial) filtered = filtered.filter(o => o.materialId === filterMaterial);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(o => {
      const p = patients.find(pat => pat.id === o.patientId);
      const d = doctors.find(doc => doc.id === o.doctorId);
      const c = companies.find(comp => comp.id === o.companyId);
      return (
        o.id.toLowerCase().includes(q) ||
        (p && p.name.toLowerCase().includes(q)) ||
        (d && d.name.toLowerCase().includes(q)) ||
        (c && c.name.toLowerCase().includes(q)) ||
        (o.teeth && o.teeth.join(',').includes(q))
      );
    });
  }

  const handlePrint = (order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleRestart = (orderId) => {
    if (window.confirm('Bu tamamlanmış işlem tekrar üretime geri alınsın ve üzerinde düzenleme yapılsın mı?')) {
      const order = orders.find(o => o.id === orderId);
      const targetStep = order?.steps?.length ? Math.max(0, order.steps.length - 2) : 0;
      restartOrder(orderId, targetStep, 'Üretime geri çevrildi');
      setTabMode('active'); // Aktif sekmesine geç
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{isCompany ? 'İş Emirlerim' : (isOperator ? 'İş Emirlerim' : 'İş Emirleri & Sipariş Takibi')}</h2>
          <p className="page-subtitle">
            {isCompany
              ? 'Kliniğinize ait tüm iş emirleri: üretimde, onay bekleyen ve tamamlananlar. Yalnızca kendi işlerinizi görürsünüz.'
              : (isOperator
              ? 'Yeni iş emri verebilirsiniz. Onaylanana kadar kendi emrinizi düzenleyebilirsiniz; onaydan sonra yalnızca durumunu görürsünüz.'
              : (tabMode === 'active'
              ? 'Yalnızca aktif üretim aşamasındaki işlemler listeleniyor'
              : (tabMode === 'all'
              ? 'Tüm iş emirleri listeleniyor'
              : 'Tamamlanan protezlerin ayrı arşivi (Buradan istediğiniz işi üretime geri çevirebilirsiniz)')))}
          </p>
        </div>

        <div className="page-header-actions">
          <div className="segmented-tabs">
            {isCompany && (
              <button
                type="button"
                className={`btn-dental btn-dental-sm ${tabMode === 'all' ? 'btn-dental-primary' : 'btn-dental-secondary'}`}
                style={{ border: 'none' }}
                onClick={() => setTabMode('all')}
              >
                <ClipboardList size={15} />
                <span>Tümü ({orders.length})</span>
              </button>
            )}
            <button
              type="button"
              className={`btn-dental btn-dental-sm ${tabMode === 'active' ? 'btn-dental-primary' : 'btn-dental-secondary'}`}
              style={{ border: 'none', marginLeft: isCompany ? 4 : 0 }}
              onClick={() => setTabMode('active')}
            >
              <Factory size={15} />
              <span>Üretimdekiler ({activeOrdersCount})</span>
            </button>
            <button
              type="button"
              className={`btn-dental btn-dental-sm ${tabMode === 'completed' ? 'btn-dental-primary' : 'btn-dental-secondary'}`}
              style={{ border: 'none', marginLeft: 4 }}
              onClick={() => setTabMode('completed')}
            >
              <CheckCircle2 size={15} />
              <span>Tamamlananlar ({completedOrdersCount})</span>
            </button>
          </div>

          {!isCompany && (
          <button
            type="button"
            className="btn-dental btn-dental-primary desktop-only"
            onClick={() => {
              setEditingOrder(null);
              setIsOrderModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Yeni İş Emri Başlat</span>
          </button>
          )}
        </div>
      </div>

      {/* Tablo ve Filtre */}
      <div className="dental-table-wrapper">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <select
            className="dental-input"
            style={{ width: '100%', maxWidth: 280 }}
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
          >
            <option value="">Tüm Materyaller</option>
            {Object.values(materials).map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {tabMode === 'all'
              ? 'Kliniğinize ait tüm iş emirleri'
              : (tabMode === 'active' ? 'Sadece tamamlanmayan aktif işler gösteriliyor' : 'Tamamlanan arşivlenmiş işler')}
          </span>
        </div>

        {/* Masaüstü Tablo Görünümü */}
        <div className="desktop-table-container">
          <table className="dental-table">
            <thead>
              <tr>
                <th>İş Emri No</th>
                <th>Hasta Adı</th>
                <th>Hekim & Klinik</th>
                <th>Restorasyon / Materyal</th>
                <th>Aşama & İlerleme</th>
                <th>Teslim Tarihi</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    {tabMode === 'all'
                      ? 'Bu kliniğe ait iş emri yok.'
                      : (tabMode === 'active' ? 'Üretim aşamasında bekleyen iş yok.' : 'Henüz tamamlanmış iş yok.')}
                  </td>
                </tr>
              ) : (
                filtered.map(o => {
                  const pat = patients.find(p => p.id === o.patientId);
                  const doc = doctors.find(d => d.id === o.doctorId);
                  const comp = companies.find(c => c.id === o.companyId);
                  const mat = materials[o.materialId] || { name: o.materialId, badgeClass: 'badge-pending' };
                  const cur = o.steps?.[o.currentStepIndex];

                  const completedSteps = (o.steps || []).filter(s => s.status === 'completed').length;
                  const totalSteps = (o.steps || []).length || 1;
                  const pct = Math.round((completedSteps / totalSteps) * 100);
                  const isExpanded = expandedOrderId === o.id;

                  return (
                    <React.Fragment key={o.id}>
                      <tr
                        onClick={() => toggleExpandOrder(o.id)}
                        style={{ cursor: 'pointer', background: isExpanded ? 'rgba(2, 132, 199, 0.04)' : 'inherit' }}
                        title="Detayları açmak / kapatmak için tıklayın"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </span>
                            <div>
                              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--dental-blue)' }}>
                                {o.id}
                              </span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.orderDate}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{pat?.name || '-'}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pat?.chartNumber}</div>
                        </td>
                        <td>
                          <div>{doc?.name || '-'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{comp?.name || '-'}</div>
                        </td>
                        <td>
                          <span className={`badge-pill ${mat.badgeClass}`}>{mat.name.split('(')[0]}</span>
                          <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)', marginLeft: 4, fontWeight: 700 }}>
                            {o.shade}
                          </span>
                          {isOrderFromCompletedImplant(o) && (
                            <span className="badge-pill badge-completed" style={{ marginLeft: 4 }}>
                              İmplant tamamlandı
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{cur?.name || 'Tamamlandı'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <div style={{ flex: 1, height: 5, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--dental-blue)' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>%{pct}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{o.deliveryDate}</div>
                          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{o.priority}</div>
                        </td>
                        <td>
                          <span className={`badge-pill ${o.status === 'pending_approval' ? 'badge-revision' : `badge-${o.status}`}`}>
                            {o.status === 'in_progress' ? 'İşlemde' : (o.status === 'completed' ? 'Tamamlandı' : (o.status === 'pending_approval' ? 'Onay bekliyor' : o.status))}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                            {o.status === 'pending_approval' && isOperator && (
                              <button
                                type="button"
                                className="btn-dental btn-dental-primary btn-dental-sm"
                                onClick={() => {
                                  setEditingOrder(o);
                                  setIsOrderModalOpen(true);
                                }}
                              >
                                <Pencil size={14} />
                                <span>Düzenle</span>
                              </button>
                            )}

                            {o.status === 'completed' && isAdmin && (
                              <button
                                type="button"
                                className="btn-dental btn-dental-primary btn-dental-sm"
                                style={{ padding: '6px 10px', background: 'linear-gradient(135deg, var(--dental-teal), var(--dental-blue))' }}
                                onClick={() => handleRestart(o.id)}
                                title="İşlemi Yeniden Başlat & Üretime Geri Al"
                              >
                                <RotateCcw size={14} />
                                <span>Yeniden Başlat</span>
                              </button>
                            )}

                            {o.status === 'pending_approval' && isAdmin && (
                              <button
                                type="button"
                                className="btn-dental btn-dental-primary btn-dental-sm"
                                onClick={() => setApproveTargetId(o.id)}
                              >
                                Onayla
                              </button>
                            )}

                            {isCompany && (
                              <button
                                type="button"
                                className="btn-dental btn-dental-secondary btn-dental-sm"
                                onClick={() => navigate('/orders/' + o.id)}
                                title="İş emri detayı"
                              >
                                Detay
                              </button>
                            )}

                            {isAdmin && o.status !== 'completed' && o.status !== 'pending_approval' && (
                              <button
                                type="button"
                                className="btn-dental btn-dental-secondary btn-dental-sm"
                                onClick={() => navigate('/orders/' + o.id)}
                                title="Aşama Takibi & Detay"
                              >
                                Aşamalar ➔
                              </button>
                            )}

                            {isAdmin && (
                              <>
                            <button
                              type="button"
                              className="btn-dental btn-dental-secondary btn-dental-sm"
                              style={{ padding: '6px 8px' }}
                              onClick={() => handlePrint(o)}
                              title="Laboratuvar Fişi Yazdır"
                            >
                              <Printer size={15} />
                            </button>

                            <button
                              type="button"
                              className="btn-dental btn-dental-danger btn-dental-sm"
                              style={{ padding: '6px 8px' }}
                              onClick={() => {
                                if (window.confirm(`${o.id} numaralı iş emri silinsin mi?`)) {
                                  deleteOrder(o.id);
                                }
                              }}
                              title="Sil"
                            >
                              <Trash2 size={15} />
                            </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Tıklanınca Açılan Satır Detayı */}
                      {isExpanded && (
                        <tr className="table-expanded-row">
                          <td colSpan={8} className="table-expanded-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.82rem' }}>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)' }}>🦷 FDI Dişler: </span>
                                  <strong style={{ fontFamily: 'JetBrains Mono' }}>{(o.teeth || []).join(', ') || 'Tüm Çene'}</strong>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)' }}>👷 Anlık Teknisyen: </span>
                                  <strong>{cur?.technician || 'Atanmamış'}</strong>
                                </div>
                                {o.notes && (
                                  <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>📝 Sipariş Notu: </span>
                                    <span>{o.notes}</span>
                                  </div>
                                )}
                              </div>

                              {(isAdmin || isCompany) && (
                              <button
                                type="button"
                                className="btn-dental btn-dental-primary btn-dental-sm"
                                onClick={() => navigate('/orders/' + o.id)}
                              >
                                <span>{isCompany ? 'İş emri detayını aç' : 'İş Emri Detayına & Odontograma Git'}</span>
                                <ExternalLink size={13} />
                              </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobil Kart Görünümü (Telefonlarda Tıklanınca Açılan Akordiyon Kartlar) */}
        <div className="mobile-order-cards">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              {tabMode === 'all'
                ? 'Bu kliniğe ait iş emri yok.'
                : (tabMode === 'active' ? 'Üretim aşamasında bekleyen iş yok.' : 'Henüz tamamlanmış iş yok.')}
            </div>
          ) : (
            filtered.map(o => {
              const pat = patients.find(p => p.id === o.patientId);
              const doc = doctors.find(d => d.id === o.doctorId);
              const comp = companies.find(c => c.id === o.companyId);
              const mat = materials[o.materialId] || { name: o.materialId, badgeClass: 'badge-pending' };
              const cur = o.steps?.[o.currentStepIndex];
              const completedSteps = (o.steps || []).filter(s => s.status === 'completed').length;
              const totalSteps = (o.steps || []).length || 1;
              const pct = Math.round((completedSteps / totalSteps) * 100);
              const isExpanded = expandedOrderId === o.id;

              return (
                <div
                  key={o.id}
                  className={`mobile-order-item ${isExpanded ? 'is-expanded' : ''}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => toggleExpandOrder(o.id)}
                  title="Detayları ve eylemleri açmak için tıklayın"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: 'var(--dental-blue)', fontSize: '0.85rem' }}>
                        #{o.id}
                      </span>
                      {o.priority === 'urgent' && (
                        <span className="badge-pill" style={{ background: 'var(--status-urgent-bg)', color: 'var(--status-urgent)', fontWeight: 800, fontSize: '0.7rem' }}>
                          🔴 Acil
                        </span>
                      )}
                      <span className={`badge-pill ${o.status === 'pending_approval' ? 'badge-revision' : `badge-${o.status}`}`} style={{ fontSize: '0.7rem' }}>
                        {o.status === 'in_progress' ? 'İşlemde' : (o.status === 'pending_approval' ? 'Onay bekliyor' : 'Tamamlandı')}
                      </span>
                    </div>
                    <div className="card-expand-indicator">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {pat?.name || 'İsimsiz Hasta'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <span>🏥 {comp?.name || '-'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--dental-blue)' }}>%{pct} ({cur?.name || 'Aşama'})</span>
                  </div>

                  {/* İnce İlerleme Çubuğu */}
                  <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden', marginTop: 6 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--dental-blue)' }} />
                  </div>

                  {/* Tıklanınca Açılan Mobil Detay Çekmecesi */}
                  {isExpanded && (
                    <div className="job-card-details-drawer" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
                          🦷 {(o.teeth || []).join(', ') || '-'}
                        </span>
                        <span className="badge-pill" style={{ background: 'var(--status-completed-bg)', color: 'var(--status-completed)', fontWeight: 700, fontSize: '0.72rem' }}>
                          🎨 {o.shade}
                        </span>
                        <span className={`badge-pill ${mat.badgeClass}`} style={{ fontSize: '0.72rem' }}>
                          {mat.name.split('(')[0]}
                        </span>
                        {isOrderFromCompletedImplant(o) && (
                          <span className="badge-pill badge-completed" style={{ fontSize: '0.72rem' }}>
                            İmplant tamamlandı
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                        <div>👨‍⚕️ Hekim: <strong>{doc?.name || '-'}</strong></div>
                        <div>📅 Teslim Tarihi: <strong>{o.deliveryDate}</strong></div>
                        {o.notes && <div>📝 Not: <em>{o.notes}</em></div>}
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                        {o.status === 'pending_approval' && isOperator && (
                          <button
                            type="button"
                            className="btn-dental btn-dental-primary btn-dental-sm"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }}
                            onClick={() => {
                              setEditingOrder(o);
                              setIsOrderModalOpen(true);
                            }}
                          >
                            <Pencil size={13} />
                            <span>Düzenle</span>
                          </button>
                        )}

                        {o.status === 'pending_approval' && isAdmin && (
                          <button
                            type="button"
                            className="btn-dental btn-dental-primary btn-dental-sm"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }}
                            onClick={() => setApproveTargetId(o.id)}
                          >
                            Onayla
                          </button>
                        )}

                        {o.status === 'completed' && isAdmin ? (
                          <button
                            type="button"
                            className="btn-dental btn-dental-primary btn-dental-sm"
                            style={{ flex: 1, background: 'linear-gradient(135deg, var(--dental-teal), var(--dental-blue))', fontSize: '0.75rem', padding: '6px 10px' }}
                            onClick={() => handleRestart(o.id)}
                          >
                            <RotateCcw size={13} />
                            <span>Yeniden Başlat</span>
                          </button>
                        ) : (isAdmin && o.status !== 'pending_approval') || isCompany ? (
                          <button
                            type="button"
                            className="btn-dental btn-dental-primary btn-dental-sm"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }}
                            onClick={() => navigate('/orders/' + o.id)}
                          >
                            <span>{isCompany ? 'Detay' : 'Aşamalar ➔'}</span>
                          </button>
                        ) : null}

                        {isAdmin && (
                          <>
                        <button
                          type="button"
                          className="btn-dental btn-dental-secondary btn-dental-sm"
                          style={{ padding: '6px 10px' }}
                          onClick={() => handlePrint(o)}
                          title="Fiş Yazdır"
                        >
                          <Printer size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn-dental btn-dental-danger btn-dental-sm"
                          style={{ padding: '6px 10px' }}
                          onClick={() => {
                            if (window.confirm(`${o.id} numaralı iş emri silinsin mi?`)) {
                              deleteOrder(o.id);
                            }
                          }}
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Yazdırma Alanı */}
      {printingOrder && <PrintSlip order={printingOrder} />}
      {approveTargetId && (
        <StepDateModal
          title="İş emrini onayla"
          subtitle="Onay tarihini seçin. İş bu tarihten sonra üretim hattına alınır."
          confirmLabel="Onayla ve başlat"
          onConfirm={(date) => {
            approveOrder(approveTargetId, date);
            setApproveTargetId(null);
          }}
          onCancel={() => setApproveTargetId(null)}
        />
      )}
    </div>
  );
};
