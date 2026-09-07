import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import {
  Activity,
  AlertOctagon,
  CheckCircle,
  Building,
  ArrowRight,
  Printer
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { orders, companies, doctors, patients, materials, technicians, searchQuery, setIsOrderModalOpen } = useDental();

  const activeOrders = orders.filter(o => o.status === 'in_progress');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const urgentOrders = orders.filter(o => o.priority === 'urgent' && o.status !== 'completed');

  // Materyal İstatistikleri
  const totalOrdersCount = orders.length || 1;
  const matStats = {
    zirconia: orders.filter(o => o.materialId === 'zirconia').length,
    porcelain: orders.filter(o => o.materialId === 'porcelain').length,
    implant: orders.filter(o => o.materialId === 'implant').length,
    emax: orders.filter(o => o.materialId === 'emax').length
  };

  // Teknisyen Yükü
  const techWorkload = {};
  technicians.forEach(t => techWorkload[t] = 0);
  orders.forEach(o => {
    const cur = o.steps?.[o.currentStepIndex];
    if (cur?.technician) {
      techWorkload[cur.technician] = (techWorkload[cur.technician] || 0) + 1;
    }
  });

  // Filtreleme
  let recentOrders = [...orders];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    recentOrders = recentOrders.filter(o => {
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

  return (
    <div>
      {/* Başlık ve Hızlı Eylem */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Laboratuvar Genel Bakış
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Güncel protez üretim hattı, fırın süreçleri ve teslimat takibi
          </p>
        </div>
        <div>
          <button
            type="button"
            className="btn-dental btn-dental-primary"
            onClick={() => setIsOrderModalOpen(true)}
          >
            + Hızlı İş Emri Başlat
          </button>
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="kpi-row">
        <div className="dental-card">
          <div className="kpi-header-flex">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Üretimdeki Aktif İşler</span>
            <div className="kpi-symbol blue"><Activity size={22} /></div>
          </div>
          <div className="kpi-num-large" style={{ color: 'var(--dental-blue)' }}>{activeOrders.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Toplam {orders.length} iş emri kaydı</div>
        </div>

        <div className="dental-card">
          <div className="kpi-header-flex">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Acil / VIP Siparişler</span>
            <div className="kpi-symbol rose"><AlertOctagon size={22} /></div>
          </div>
          <div className="kpi-num-large" style={{ color: 'var(--status-urgent)' }}>{urgentOrders.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Öncelikli fırın ve teslimat</div>
        </div>

        <div className="dental-card">
          <div className="kpi-header-flex">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tamamlanan İşler</span>
            <div className="kpi-symbol emerald"><CheckCircle size={22} /></div>
          </div>
          <div className="kpi-num-large" style={{ color: 'var(--status-completed)' }}>{completedOrders.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Kliniklere sevk edilmiş</div>
        </div>

        <div className="dental-card">
          <div className="kpi-header-flex">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Klinik & Hekim Ağı</span>
            <div className="kpi-symbol amber"><Building size={22} /></div>
          </div>
          <div className="kpi-num-large">{companies.length} / {doctors.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{patients.length} kayıtlı hasta</div>
        </div>
      </div>

      {/* Materyal Dağılımı ve Teknisyen Yükü İki Kolonlu Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* Materyal Dağılımı */}
        <div className="dental-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <strong style={{ fontSize: '0.98rem' }}>🔬 Materyal Üretim Payı</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{orders.length} Toplam İş</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                <span>Zirkonyum (CAD/CAM Kazıma)</span>
                <strong>{matStats.zirconia} (%{Math.round(matStats.zirconia / totalOrdersCount * 100)})</strong>
              </div>
              <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${matStats.zirconia / totalOrdersCount * 100}%`, background: 'var(--dental-blue)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                <span>Porselen (PFM Metal Destekli Seramik)</span>
                <strong>{matStats.porcelain} (%{Math.round(matStats.porcelain / totalOrdersCount * 100)})</strong>
              </div>
              <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${matStats.porcelain / totalOrdersCount * 100}%`, background: 'var(--mat-porcelain)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                <span>İmplant Üstü Protez (Ti-Base)</span>
                <strong>{matStats.implant} (%{Math.round(matStats.implant / totalOrdersCount * 100)})</strong>
              </div>
              <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${matStats.implant / totalOrdersCount * 100}%`, background: 'var(--status-completed)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                <span>E-Max Tam Seramik (Lityum Disilikat)</span>
                <strong>{matStats.emax} (%{Math.round(matStats.emax / totalOrdersCount * 100)})</strong>
              </div>
              <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${matStats.emax / totalOrdersCount * 100}%`, background: 'var(--mat-emax)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Teknisyen İstasyon Yükü */}
        <div className="dental-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <strong style={{ fontSize: '0.98rem' }}>👷 Teknisyen İstasyon Yükü</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Anlık Sorumlular</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {technicians.slice(0, 4).map(t => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{t.split('(')[0]}</span>
                <span className="badge-pill badge-inprogress" style={{ fontSize: '0.75rem' }}>
                  {techWorkload[t] || 0} aktif iş
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Son İş Emirleri Tablosu */}
      <div className="dental-table-wrapper">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '1rem' }}>Üretimdeki Son İş Emirleri</strong>
          <button
            type="button"
            className="btn-dental btn-dental-secondary btn-dental-sm"
            onClick={() => navigate('/orders')}
          >
            <span>Tüm Siparişleri Gör</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <table className="dental-table">
          <thead>
            <tr>
              <th>İş Emri No</th>
              <th>Hasta Adı</th>
              <th>Hekim & Klinik</th>
              <th>Restorasyon / Materyal</th>
              <th>Mevcut Aşama & İlerleme</th>
              <th>Teslim Tarihi</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.slice(0, 5).map(o => {
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
                    <button
                      type="button"
                      className="btn-dental btn-dental-secondary btn-dental-sm"
                      onClick={() => navigate('/orders/' + o.id)}
                    >
                      Aşamalar ➔
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
