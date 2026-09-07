import React, { useState, useEffect } from 'react';
import { useDental } from '../context/DentalContext';
import { Odontogram } from './Odontogram';
import { X, Sparkles, UserPlus, Calendar, Clock, DollarSign } from 'lucide-react';

export const OrderModal = () => {
  const {
    isOrderModalOpen,
    setIsOrderModalOpen,
    companies,
    doctors,
    patients,
    materials,
    vitaShades,
    technicians,
    setIsTeamModalOpen,
    saveOrder,
    savePatient,
    showToast
  } = useDental();

  const [companyId, setCompanyId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [assignedTech, setAssignedTech] = useState('');

  const [materialId, setMaterialId] = useState('zirconia');
  const [shade, setShade] = useState('A2');
  const [priority, setPriority] = useState('normal');
  const [trialDate, setTrialDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [price, setPrice] = useState(3500);
  const [notes, setNotes] = useState('');
  const [selectedTeeth, setSelectedTeeth] = useState(['11', '21']);

  // Akıllı Varsayılanlar & Tarihler
  useEffect(() => {
    if (isOrderModalOpen) {
      const today = new Date();
      const trial = new Date(today);
      trial.setDate(today.getDate() + 3);
      const delivery = new Date(today);
      delivery.setDate(today.getDate() + 5);
      setTrialDate(trial.toISOString().split('T')[0]);
      setDeliveryDate(delivery.toISOString().split('T')[0]);

      // İlk firma ve doktoru otomatik seç (Boş bekleme süresini sıfırla)
      if (!companyId && companies.length > 0) {
        const firstComp = companies[0];
        setCompanyId(firstComp.id);
        const compDocs = doctors.filter(d => d.companyId === firstComp.id);
        if (compDocs.length > 0) {
          setDoctorId(compDocs[0].id);
          const docPats = patients.filter(p => p.doctorId === compDocs[0].id);
          if (docPats.length > 0) {
            setPatientId(docPats[0].id);
          }
        }
      }
    }
  }, [isOrderModalOpen, companies, doctors, patients]);

  // Diş sayısı değiştikçe bedel önerisi
  useEffect(() => {
    const count = selectedTeeth.length || 1;
    setPrice(count * 1750);
  }, [selectedTeeth]);

  if (!isOrderModalOpen) return null;

  const filteredDoctors = doctors.filter(d => !companyId || d.companyId === companyId);
  const filteredPatients = patients.filter(p => !doctorId || p.doctorId === doctorId);

  // Hızlı teslim tarihi ayarlayıcı
  const setQuickDeadline = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDeliveryDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyId) {
      alert('Lütfen bir Klinik seçin.');
      return;
    }
    if (!doctorId) {
      alert('Lütfen bir Hekim seçin.');
      return;
    }

    let finalPatientId = patientId;

    // Hızlı Hasta Ekleme (Hasta sayfasına gitmeye üşenilmesin)
    if (isNewPatient) {
      if (!newPatientName.trim()) {
        alert('Lütfen hasta adını girin.');
        return;
      }
      const saved = savePatient({
        companyId,
        doctorId,
        name: newPatientName.trim(),
        chartNumber: 'PRT-' + Math.floor(1000 + Math.random() * 9000),
        age: 35,
        gender: 'Belirtilmedi'
      });
      finalPatientId = saved.id;
    } else if (!patientId) {
      alert('Lütfen listeden bir hasta seçin veya "+ Yeni Hasta" butonuna basıp adını yazın.');
      return;
    }

    const template = materials[materialId] || materials.zirconia;
    const steps = template.steps.map((s, idx) => ({
      order: s.order,
      name: s.name,
      description: s.description,
      status: idx === 0 ? 'in_progress' : 'pending',
      technician: assignedTech || s.defaultTechnician || (technicians && technicians[0]) || 'Yusuf Usta',
      startedAt: idx === 0 ? new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : null,
      notes: ''
    }));

    saveOrder({
      companyId,
      doctorId,
      patientId: finalPatientId,
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
    showToast(`İş emri başarıyla başlatıldı ve üretim hattına alındı ✓`, 'success');
  };

  return (
    <div className="modal-overlay" onClick={() => setIsOrderModalOpen(false)}>
      <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
        <div className="modal-dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--status-inprogress-bg)', color: 'var(--dental-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Yeni Diş Protez İş Emri</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Hızlı seçim tuşları ile saniyeler içinde başlatın</span>
            </div>
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
                    const cid = e.target.value;
                    setCompanyId(cid);
                    const docs = doctors.filter(d => d.companyId === cid);
                    setDoctorId(docs[0]?.id || '');
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

              {/* Hasta (Hızlı Yeni Hasta Ekleme Desteği) */}
              <div className="form-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <label>Hasta Adı *</label>
                  <button
                    type="button"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--dental-blue)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    onClick={() => setIsNewPatient(!isNewPatient)}
                  >
                    <UserPlus size={13} />
                    <span>{isNewPatient ? 'Kayıtlılardan Seç' : '+ Yeni Hasta Adı Yaz'}</span>
                  </button>
                </div>

                {isNewPatient ? (
                  <input
                    type="text"
                    className="dental-input"
                    placeholder="Örn: Ayşe Demir"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    autoFocus
                    required
                  />
                ) : (
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
                )}
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

              {/* VITA Rengi ve Hızlı Renk Tuşları */}
              <div className="form-item">
                <label>VITA Diş Rengi *</label>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                  {['A1', 'A2', 'A3', 'A3.5', 'B1', 'B2', 'BL2', 'BL3'].map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`quick-chip-btn ${shade === s ? 'active' : ''}`}
                      onClick={() => setShade(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
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

              {/* Öncelik / Aciliyet */}
              <div className="form-item">
                <label>Aciliyet Seviyesi</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  {[
                    { id: 'normal', label: '🟢 Normal' },
                    { id: 'urgent', label: '🔴 Acil (Vaka)' },
                    { id: 'vip', label: '⭐ VIP' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`quick-segmented-btn ${priority === p.id ? 'active' : ''}`}
                      onClick={() => setPriority(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorumlu Teknisyen Seçimi */}
              <div className="form-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Sorumlu Teknisyen</label>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--dental-blue)', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => {
                      if (setIsTeamModalOpen) setIsTeamModalOpen(true);
                    }}
                  >
                    + Ekip Yönetimi
                  </button>
                </div>
                <select
                  className="dental-input"
                  value={assignedTech}
                  onChange={(e) => setAssignedTech(e.target.value)}
                >
                  <option value="">Varsayılan İstasyon Teknisyeni</option>
                  {(technicians || []).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Teslim Tarihi ve Hızlı Gün Seçicileri */}
              <div className="form-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Teslim Tarihi *</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button type="button" className="quick-micro-btn" onClick={() => setQuickDeadline(2)}>+2 Gün</button>
                    <button type="button" className="quick-micro-btn" onClick={() => setQuickDeadline(4)}>+4 Gün</button>
                    <button type="button" className="quick-micro-btn active" onClick={() => setQuickDeadline(5)}>+5 Gün</button>
                    <button type="button" className="quick-micro-btn" onClick={() => setQuickDeadline(7)}>+7 Gün</button>
                  </div>
                </div>
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
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    className="dental-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="100"
                    style={{ width: '100%' }}
                  />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    ({selectedTeeth.length} Diş)
                  </span>
                </div>
              </div>

              {/* Hekim Özel Talimatı */}
              <div className="form-item span-all">
                <label>Hekim / Klinik Laboratuvar Notu</label>
                <textarea
                  className="dental-input"
                  rows={2}
                  placeholder="Örn: 11 ve 21 nolu dişlerde insizal transparanlık yüksek tutulsun..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* İNTERAKTİF DİŞ ŞEMASI & HIZLI ŞABLONLAR */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  İşlem Yapılacak Dişler ({selectedTeeth.length} Diş Seçili):
                </label>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button type="button" className="quick-micro-btn" onClick={() => setSelectedTeeth(['11', '21'])}>11 - 21</button>
                  <button type="button" className="quick-micro-btn" onClick={() => setSelectedTeeth(['13', '12', '11', '21', '22', '23'])}>Ön 6 Diş</button>
                  <button type="button" className="quick-micro-btn" onClick={() => setSelectedTeeth(['12', '11', '21', '22'])}>Üst Ön 4</button>
                  <button type="button" className="quick-micro-btn" onClick={() => setSelectedTeeth(['33', '32', '31', '41', '42', '43'])}>Alt Ön</button>
                </div>
              </div>
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
              ✓ İş Emrini Hemen Başlat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

