import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { PipelineStepper } from '../components/PipelineStepper';
import { PrintSlip } from '../components/PrintSlip';
import { ArrowLeft, Printer, Edit3, X, Share2, Copy } from 'lucide-react';

export const OrderDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, companies, doctors, patients, materials, vitaShades, saveOrder, showToast, restartOrder } = useDental();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const order = orders.find(o => o.id === id);

  // Düzenleme state'leri
  const [editShade, setEditShade] = useState('');
  const [editDeliveryDate, setEditDeliveryDate] = useState('');
  const [editTrialDate, setEditTrialDate] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editPriority, setEditPriority] = useState('normal');
  const [editNotes, setEditNotes] = useState('');

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3>İş emri bulunamadı (#{id})</h3>
        <button
          type="button"
          className="btn-dental btn-dental-primary"
          style={{ marginTop: 16 }}
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft size={16} />
          <span>İş Emirlerine Dön</span>
        </button>
      </div>
    );
  }

  const company = companies.find(c => c.id === order.companyId);
  const doctor = doctors.find(d => d.id === order.doctorId);
  const patient = patients.find(p => p.id === order.patientId);
  const material = materials[order.materialId] || { name: order.materialId, color: '#0284c7' };

  const handlePrint = () => {
    window.print();
  };

  const openEditModal = () => {
    setEditShade(order.shade || 'A2');
    setEditDeliveryDate(order.deliveryDate || '');
    setEditTrialDate(order.trialDate || '');
    setEditPrice(order.price || 0);
    setEditPriority(order.priority || 'normal');
    setEditNotes(order.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveOrderEdit = (e) => {
    e.preventDefault();
    saveOrder({
      ...order,
      shade: editShade,
      deliveryDate: editDeliveryDate,
      trialDate: editTrialDate,
      price: parseFloat(editPrice) || 0,
      priority: editPriority,
      notes: editNotes
    });
    setIsEditModalOpen(false);
  };

  const handleRestartOrder = (targetStep = 0) => {
    if (window.confirm('Bu tamamlanmış işlem tekrar üretim hattına alınsın mı?')) {
      restartOrder(order.id, targetStep, 'Kullanıcı talebiyle üretime geri çevrildi');
    }
  };

  const handleCopyWhatsApp = () => {
    const toothInfo = order.selectedTeeth && order.selectedTeeth.length > 0 
      ? order.selectedTeeth.join(', ') 
      : 'Belirtilmedi';
    const activeStep = (order.steps || []).find(s => s.status === 'in_progress') || (order.steps || [])[0];
    const stepName = isCompleted ? '✓ Üretim Tamamlandı' : (activeStep ? `${activeStep.order}. ${activeStep.name}` : 'İşlemde');

    const text = 
`🦷 *DENTALLAB - İŞ EMRİ BİLGİSİ*
📋 *İş No:* #${order.id}
🏥 *Klinik:* ${company?.name || 'Bilinmiyor'}
👨‍⚕️ *Hekim:* ${doctor?.name || 'Bilinmiyor'}
👤 *Hasta:* ${patient?.name || 'Bilinmiyor'}
🦷 *Diş No:* ${toothInfo}
💎 *Tür:* ${material.name} (Renk: ${order.shade || 'Belirtilmedi'})
⚡ *Aşama:* ${stepName}
📅 *Teslim:* ${order.deliveryDate || 'Belirtilmedi'}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    showToast('WhatsApp için sipariş bilgisi panoya kopyalandı! 📋', 'success');
  };

  const isCompleted = order.status === 'completed';

  return (
    <div>
      {/* GERİ DÖN BUTONU */}
      <button
        type="button"
        className="btn-back-nav"
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/orders');
          }
        }}
      >
        <ArrowLeft size={16} />
        <span>← Geri Dön (Önceki Sayfa)</span>
      </button>

      {/* Üst Bilgi Barı */}
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <h2 className="page-title">İş Emri #{order.id}</h2>
            <span className={`badge-pill ${material.badgeClass}`} style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
              {material.name}
            </span>
          </div>
          <p className="page-subtitle">
            Sipariş Tarihi: <strong>{order.orderDate}</strong> • Nihai Teslim: <strong style={{ color: 'var(--status-urgent)' }}>{order.deliveryDate}</strong>
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn-dental btn-dental-secondary"
            onClick={handleCopyWhatsApp}
            title="WhatsApp veya mesaja yapıştırmak için tek tıkla kopyala"
            style={{ borderColor: 'rgba(37, 211, 102, 0.4)', color: 'var(--dental-teal)' }}
          >
            <Copy size={16} />
            <span>WhatsApp Özeti Kopyala</span>
          </button>
          <button
            type="button"
            className="btn-dental btn-dental-secondary"
            onClick={openEditModal}
          >
            <Edit3 size={16} />
            <span>Siparişi Düzenle</span>
          </button>
          <button
            type="button"
            className="btn-dental btn-dental-secondary"
            onClick={handlePrint}
          >
            <Printer size={16} />
            <span>İş Emri Fişini Yazdır</span>
          </button>
        </div>
      </div>

      {/* EĞER TAMAMLANMIŞSA: YENİDEN BAŞLATMA & ÜRETİME GERİ ALMA BANNERI */}
      {isCompleted && (
        <div style={{
          padding: '16px 20px',
          background: 'var(--status-completed-bg)',
          border: '1px solid var(--status-completed)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--status-completed)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              ✓
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', display: 'block' }}>Bu İş Emri Tamamlandı ve Arşivde</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Kliniğin talebiyle renk/uyum düzeltmesi veya revizyon için işlemi tekrar üretim hattına alabilirsiniz.</div>
            </div>
          </div>
          <button
            type="button"
            className="btn-dental btn-dental-primary"
            style={{ background: 'linear-gradient(135deg, var(--dental-teal), var(--dental-blue))', boxShadow: '0 4px 14px var(--dental-primary-glow)' }}
            onClick={() => handleRestartOrder(Math.max(0, (order.steps || []).length - 2))}
          >
            <span>🔄 İşlemi Yeniden Başlat & Üretime Geri Döndür</span>
          </button>
        </div>
      )}

      {/* Hasta, Doktor ve Protez Detay Bilgi Kartı */}
      <div
        className="dental-card order-detail-meta-grid"
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-surface-elevated))'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hasta Bilgisi</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 2 }}>{patient?.name || '-'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{patient?.chartNumber} • {patient?.age} Yaş ({patient?.gender})</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tedavi Eden Hekim</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 2 }}>{doctor?.name || '-'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doctor?.specialty || 'Diş Hekimi'}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Klinik / Müşteri Firma</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 2 }}>{company?.name || '-'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{company?.phone || '-'}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VITA Diş Rengi</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dental-blue)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
            {order.shade}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Doğal estetik skalası</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>İşlem Dişleri (FDI)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--dental-teal)', marginTop: 2 }}>
            {(order.teeth || []).join(', ') || 'Belirtilmedi'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(order.teeth || []).length} Adet Diş</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>İşlem Bedeli & Öncelik</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'JetBrains Mono', marginTop: 2 }}>
            {order.price ? order.price.toLocaleString('tr-TR') + ' ₺' : '0 ₺'}
          </div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: order.priority === 'urgent' ? 'var(--status-urgent)' : 'var(--text-muted)' }}>
            Öncelik: {order.priority}
          </div>
        </div>

        {order.notes && (
          <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--dental-blue)', fontSize: '0.88rem' }}>
            <strong>Hekim Özel Notu:</strong> {order.notes}
          </div>
        )}
      </div>

      {/* CANLI ADIM ADIM ÜRETİM AŞAMALARI (PIPELINE STEPPER) */}
      <div className="dental-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 16 }}>
          Adım Adım Üretim Aşamaları Takibi
        </h3>
        <PipelineStepper order={order} />
      </div>

      {/* SİPARİŞ DÜZENLEME MODALI */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-dialog-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>İş Emri Bilgilerini Düzenle (#{order.id})</h3>
              <button
                type="button"
                className="btn-dental btn-dental-secondary"
                style={{ padding: 6, borderRadius: '50%' }}
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOrderEdit}>
              <div className="modal-dialog-body">
                <div className="form-grid-2" style={{ marginBottom: 14 }}>
                  <div className="form-item">
                    <label>VITA Diş Rengi *</label>
                    <select
                      className="dental-input"
                      value={editShade}
                      onChange={e => setEditShade(e.target.value)}
                      required
                    >
                      {vitaShades.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-item">
                    <label>Aciliyet / Öncelik</label>
                    <select
                      className="dental-input"
                      value={editPriority}
                      onChange={e => setEditPriority(e.target.value)}
                    >
                      <option value="normal">Normal Üretim</option>
                      <option value="urgent">Acil (24-48 Saat)</option>
                      <option value="vip">VIP Özel Öncelikli</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: 14 }}>
                  <div className="form-item">
                    <label>Prova Tarihi</label>
                    <input
                      type="date"
                      className="dental-input"
                      value={editTrialDate}
                      onChange={e => setEditTrialDate(e.target.value)}
                    />
                  </div>
                  <div className="form-item">
                    <label>Nihai Teslim Tarihi *</label>
                    <input
                      type="date"
                      className="dental-input"
                      value={editDeliveryDate}
                      onChange={e => setEditDeliveryDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-item" style={{ marginBottom: 14 }}>
                  <label>İşlem Bedeli (₺)</label>
                  <input
                    type="number"
                    className="dental-input"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    step="100"
                  />
                </div>

                <div className="form-item">
                  <label>Hekim / Klinik Özel Notu</label>
                  <textarea
                    className="dental-input"
                    rows={3}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Örn: 11 ve 21 numaralı dişlerde mamelon ve insizal şeffaflık artırılsın..."
                  />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn-dental btn-dental-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn-dental btn-dental-primary">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yazdırma Şablonu */}
      <PrintSlip order={order} />
    </div>
  );
};
