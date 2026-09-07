import React, { useState, useEffect } from 'react';
import { useDental } from '../context/DentalContext';
import { Odontogram } from './Odontogram';
import { X, Sparkles, AlertCircle } from 'lucide-react';

export const OrderModal = () => {
  const {
    isOrderModalOpen,
    setIsOrderModalOpen,
    companies,
    doctors,
    patients,
    materials,
    vitaShades,
    saveOrder
  } = useDental();

  const [companyId, setCompanyId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [materialId, setMaterialId] = useState('zirconia');
  const [shade, setShade] = useState('A2');
  const [priority, setPriority] = useState('normal');
  const [trialDate, setTrialDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [price, setPrice] = useState(7000);
  const [notes, setNotes] = useState('');
  const [selectedTeeth, setSelectedTeeth] = useState(['11', '21']);

  // Varsayılan tarihler
  useEffect(() => {
    if (isOrderModalOpen) {
      const today = new Date();
      const trial = new Date(today);
      trial.setDate(today.getDate() + 3);
      const delivery = new Date(today);
      delivery.setDate(today.getDate() + 5);
      setTrialDate(trial.toISOString().split('T')[0]);
      setDeliveryDate(delivery.toISOString().split('T')[0]);
    }
  }, [isOrderModalOpen]);

  if (!isOrderModalOpen) return null;

  const filteredDoctors = doctors.filter(d => !companyId || d.companyId === companyId);
  const filteredPatients = patients.filter(p => !doctorId || p.doctorId === doctorId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyId || !doctorId || !patientId) {
      alert('Lütfen Klinik, Hekim ve Hasta alanlarını eksiksiz seçin.');
      return;
    }

    const template = materials[materialId] || materials.zirconia;
    const steps = template.steps.map((s, idx) => ({
      order: s.order,
      name: s.name,
      description: s.description,
      status: idx === 0 ? 'in_progress' : 'pending',
      technician: s.defaultTechnician,
      startedAt: idx === 0 ? new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : null,
      notes: ''
    }));

    saveOrder({
      companyId,
      doctorId,
      patientId,
      materialId,
      teeth: selectedTeeth,
      shade,
      priority,
      status: 'in_progress',
      orderDate: new Date().toISOString().split('T')[0],
      trialDate,
      deliveryDate,
      price: parseFloat(price) || 0,
      notes,
      currentStepIndex: 0,
      steps
    });

    setIsOrderModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsOrderModalOpen(false)}>
      <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
        <div className="modal-dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Yeni Diş Protez İş Emri Başlat</h3>
          </div>
          <button
            type="button"
            className="btn-dental btn-dental-secondary"
            style={{ padding: 6, borderRadius: '50%' }}
            onClick={() => setIsOrderModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="modal-dialog-body">
            <div className="dental-form-grid">
              {/* Klinik */}
              <div className="form-item">
                <label>Müşteri Klinik / Firma *</label>
                <select
                  className="dental-input"
                  value={companyId}
                  onChange={(e) => {
                    setCompanyId(e.target.value);
                    setDoctorId('');
                    setPatientId('');
                  }}
                  required
                >
                  <option value="">Klinik Seçin...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Hekim */}
              <div className="form-item">
                <label>Hekim / Doktor *</label>
                <select
                  className="dental-input"
                  value={doctorId}
                  onChange={(e) => {
                    setDoctorId(e.target.value);
                    setPatientId('');
                  }}
                  required
                >
                  <option value="">Hekim Seçin...</option>
                  {filteredDoctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty || 'Hekim'})</option>
                  ))}
                </select>
              </div>

              {/* Hasta */}
              <div className="form-item">
                <label>Hasta *</label>
                <select
                  className="dental-input"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                >
                  <option value="">Hasta Seçin...</option>
                  {filteredPatients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (#{p.chartNumber})</option>
                  ))}
                </select>
              </div>

              {/* Materyal */}
              <div className="form-item">
                <label>Restorasyon / Materyal *</label>
                <select
                  className="dental-input"
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                  required
                >
                  {Object.values(materials).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* VITA Rengi */}
              <div className="form-item">
                <label>VITA Diş Rengi *</label>
                <select
                  className="dental-input"
                  value={shade}
                  onChange={(e) => setShade(e.target.value)}
                  required
                >
                  {vitaShades.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Öncelik */}
              <div className="form-item">
                <label>Aciliyet Seviyesi</label>
                <select
                  className="dental-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="normal">Normal Üretim (Standart)</option>
                  <option value="urgent">Acil (24-48 Saat)</option>
                  <option value="vip">VIP Özel Öncelikli</option>
                </select>
              </div>

              {/* Prova Tarihi */}
              <div className="form-item">
                <label>Prova Tarihi (Metal / Dentin)</label>
                <input
                  type="date"
                  className="dental-input"
                  value={trialDate}
                  onChange={(e) => setTrialDate(e.target.value)}
                />
              </div>

              {/* Teslim Tarihi */}
              <div className="form-item">
                <label>Teslim Tarihi *</label>
                <input
                  type="date"
                  className="dental-input"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>

              {/* Bedel */}
              <div className="form-item">
                <label>İşlem Bedeli (₺)</label>
                <input
                  type="number"
                  className="dental-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="100"
                />
              </div>

              {/* Hekim Özel Talimatı */}
              <div className="form-item span-all">
                <label>Hekim / Klinik Özel Laboratuvar Notu</label>
                <textarea
                  className="dental-input"
                  rows={2}
                  placeholder="Örn: 11 ve 21 nolu dişlerde insizal transparanlık yüksek tutulsun, kapanış hafif bırakılsın..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* İNTERAKTİF DİŞ ŞEMASI */}
            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                İnteraktif FDI Diş Şeması (İşlem Yapılacak Dişleri Tıklayarak Seçin):
              </label>
              <Odontogram
                selectedTeeth={selectedTeeth}
                onChange={setSelectedTeeth}
              />
            </div>
          </div>

          <div className="modal-dialog-footer">
            <button
              type="button"
              className="btn-dental btn-dental-secondary"
              onClick={() => setIsOrderModalOpen(false)}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn-dental btn-dental-primary"
            >
              İş Emrini Başlat & Üretim Hattına Al
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
