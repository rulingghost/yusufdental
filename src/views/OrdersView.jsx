import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { Plus, Printer, Trash2, RotateCcw, CheckCircle2, Factory } from 'lucide-react';
import { PrintSlip } from '../components/PrintSlip';

export const OrdersView = () => {
  const navigate = useNavigate();
  const { orders, companies, doctors, patients, materials, deleteOrder, restartOrder, searchQuery, setIsOrderModalOpen } = useDental();

  // 'active' (Üretim aşamasındakiler) vs 'completed' (Tamamlananlar bölümü)
  const [tabMode, setTabMode] = useState('active');

  const [filterMaterial, setFilterMaterial] = useState('');
  const [printingOrder, setPrintingOrder] = useState(null);

  const activeOrdersCount = orders.filter(o => o.status !== 'completed').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

  let filtered = orders.filter(o => {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            İş Emirleri & Sipariş Takibi
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            {tabMode === 'active'
              ? 'Yalnızca aktif üretim aşamasındaki işlemler listeleniyor'
              : 'Tamamlanan protezlerin ayrı arşivi (Buradan istediğiniz işi üretime geri çevirebilirsiniz)'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Sekmeler */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className={`btn-dental btn-dental-sm ${tabMode === 'active' ? 'btn-dental-primary' : 'btn-dental-secondary'}`}
              style={{ border: 'none' }}
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
              <span>Tamamlananlar Bölümü ({completedOrdersCount})</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-dental btn-dental-primary"
            onClick={() => setIsOrderModalOpen(true)}
          >
            <Plus size={18} />
            <span>Yeni İş Emri Başlat</span>
          </button>
        </div>
      </div>

      {/* Tablo ve Filtre */}
      <div className="dental-table-wrapper">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <select
            className="dental-input"
            style={{ width: 220 }}
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
          >
            <option value="">Tüm Materyaller</option>
            <option value="porcelain">Porselen Diş (PFM)</option>
            <option value="zirconia">Zirkonyum (CAD/CAM)</option>
            <option value="emax">E-Max Tam Seramik</option>
            <option value="implant">İmplant Üstü Protez</option>
          </select>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {tabMode === 'active' ? 'Sadece tamamlanmayan aktif işler gösteriliyor' : 'Tamamlanan arşivlenmiş işler'}
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
                    {tabMode === 'active' ? 'Üretim aşamasında bekleyen iş yok.' : 'Henüz tamamlanmış iş yok.'}
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

                  return (
                    <tr key={o.id}>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--dental-blue)' }}>
                          {o.id}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.orderDate}</div>
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
                        <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                          Dişler: {(o.teeth || []).join(', ')}
                        </div>
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
                        <span className={`badge-pill badge-${o.status}`}>
                          {o.status === 'in_progress' ? 'İşlemde' : (o.status === 'completed' ? 'Tamamlandı' : o.status)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {o.status === 'completed' ? (
                            <button
                              type="button"
                              className="btn-dental btn-dental-primary btn-dental-sm"
                              style={{ padding: '6px 10px', background: 'linear-gradient(135deg, #0d9488, #0284c7)' }}
                              onClick={() => handleRestart(o.id)}
                              title="İşlemi Yeniden Başlat & Üretime Geri Al"
                            >
                              <RotateCcw size={14} />
                              <span>Yeniden Başlat</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-dental btn-dental-secondary btn-dental-sm"
                              onClick={() => navigate('/orders/' + o.id)}
                              title="Aşama Takibi & Detay"
                            >
                              Aşamalar ➔
                            </button>
                          )}

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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobil Kart Görünümü (Telefonlarda Tablo Yerine Açılır) */}
        <div className="mobile-order-cards">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              {tabMode === 'active' ? 'Üretim aşamasında bekleyen iş yok.' : 'Henüz tamamlanmış iş yok.'}
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

              return (
                <div key={o.id} className="mobile-order-item" onClick={() => navigate('/orders/' + o.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: 'var(--dental-blue)', fontSize: '0.88rem' }}>
                      #{o.id}
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {o.priority === 'urgent' && (
                        <span className="badge-pill" style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: '0.7rem' }}>
                          🔴 Acil
                        </span>
                      )}
                      <span className={`badge-pill badge-${o.status}`} style={{ fontSize: '0.7rem' }}>
                        {o.status === 'in_progress' ? 'İşlemde' : 'Tamamlandı'}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 2 }}>
                    {pat?.name || 'İsimsiz Hasta'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    🏥 {comp?.name || '-'} {doc?.name ? `(${doc.name})` : ''}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
                      🦷 {(o.teeth || []).join(', ') || '-'}
                    </span>
                    <span className="badge-pill" style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.72rem' }}>
                      🎨 {o.shade}
                    </span>
                    <span className={`badge-pill ${mat.badgeClass}`} style={{ fontSize: '0.72rem' }}>
                      {mat.name.split('(')[0]}
                    </span>
                  </div>

                  {/* İlerleme Çubuğu */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: 'var(--dental-blue)' }}>{cur?.name || 'Aşama'}</span>
                      <span style={{ fontFamily: 'JetBrains Mono' }}>%{pct}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--dental-blue)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      📅 Teslim: <strong>{o.deliveryDate}</strong>
                    </span>

                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      {o.status === 'completed' ? (
                        <button
                          type="button"
                          className="btn-dental btn-dental-primary btn-dental-sm"
                          style={{ background: 'linear-gradient(135deg, #0d9488, #0284c7)', fontSize: '0.75rem', padding: '6px 10px' }}
                          onClick={() => handleRestart(o.id)}
                        >
                          <RotateCcw size={13} />
                          <span>Yeniden Başlat</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-dental btn-dental-secondary btn-dental-sm"
                          style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                          onClick={() => navigate('/orders/' + o.id)}
                        >
                          Aşamalar ➔
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-dental btn-dental-secondary btn-dental-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handlePrint(o)}
                        title="Yazdır"
                      >
                        <Printer size={14} />
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
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Yazdırma Alanı */}
      {printingOrder && <PrintSlip order={printingOrder} />}
    </div>
  );
};
