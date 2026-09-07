import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { Plus, Trash2, Edit3, User, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';

export const PatientsView = () => {
  const { patients, doctors, companies, orders, savePatient, deletePatient, setIsOrderModalOpen, searchQuery } = useDental();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedPatientIds, setExpandedPatientIds] = useState({});

  const toggleExpandPatient = (id, e) => {
    if (e) e.stopPropagation();
    setExpandedPatientIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const [companyId, setCompanyId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [name, setName] = useState('');
  const [chartNumber, setChartNumber] = useState('');
  const [age, setAge] = useState(32);
  const [gender, setGender] = useState('Kadın');
  const [notes, setNotes] = useState('');

  let filtered = [...patients];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.chartNumber && p.chartNumber.toLowerCase().includes(q))
    );
  }

  const filteredDoctors = doctors.filter(d => !companyId || d.companyId === companyId);

  const openNewModal = () => {
    setEditingId(null);
    setCompanyId(companies[0]?.id || '');
    setDoctorId(doctors[0]?.id || '');
    setName('');
    setChartNumber('');
    setAge(30);
    setGender('Kadın');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (pat) => {
    setEditingId(pat.id);
    setCompanyId(pat.companyId || '');
    setDoctorId(pat.doctorId || '');
    setName(pat.name || '');
    setChartNumber(pat.chartNumber || '');
    setAge(pat.age || 30);
    setGender(pat.gender || 'Kadın');
    setNotes(pat.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!doctorId) {
      alert('Lütfen hastanın hekimini seçin.');
      return;
    }
    savePatient({
      id: editingId,
      companyId,
      doctorId,
      name,
      chartNumber: chartNumber || ('PRT-' + Math.floor(1000 + Math.random() * 9000)),
      age: parseInt(age, 10) || 30,
      gender,
      notes
    });
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Hastalar & Dosya Arşivi</h2>
          <p className="page-subtitle">
            Hekimlere bağlı hastalar, protokol numaraları, düzenleme ve medikal geçmiş
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-dental btn-dental-primary"
            onClick={openNewModal}
          >
            <Plus size={18} />
            <span>Yeni Hasta Ekle</span>
          </button>
        </div>
      </div>

      <div className="entity-card-grid">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            Kayıtlı hasta bulunamadı.
          </div>
        ) : (
          filtered.map(pat => {
            const doc = doctors.find(d => d.id === pat.doctorId);
            const comp = companies.find(c => c.id === pat.companyId);
            const patOrders = orders.filter(o => o.patientId === pat.id);

            const isExpanded = !!expandedPatientIds[pat.id];

            return (
              <div
                key={pat.id}
                className={`dental-card ${isExpanded ? 'is-expanded' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: isExpanded ? '18px' : '14px 18px'
                }}
                onClick={(e) => toggleExpandPatient(pat.id, e)}
                title="Detayları açmak / kapatmak için tıklayın"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pat.name}</div>
                      <div style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono', color: 'var(--dental-blue)', fontWeight: 700, marginTop: 2 }}>
                        {pat.chartNumber} • {pat.age} Yaş ({pat.gender})
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-dental btn-dental-secondary btn-dental-sm"
                        style={{ padding: '5px 7px' }}
                        onClick={() => openEditModal(pat)}
                        title="Hastayı Düzenle"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-dental btn-dental-danger btn-dental-sm"
                        style={{ padding: '5px 7px' }}
                        onClick={() => {
                          if (window.confirm(`${pat.name} silinsin mi?`)) {
                            deletePatient(pat.id);
                          }
                        }}
                        title="Sil"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="card-expand-indicator" style={{ marginLeft: 4 }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Kompakt Özet Satırı */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>🏥 {comp?.name || 'Klinik Atanmamış'}</span>
                    <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)', fontSize: '0.72rem' }}>
                      {patOrders.length} İş Emri
                    </span>
                  </div>

                  {/* TIKLANINCA AÇILAN DETAYLAR */}
                  {isExpanded && (
                    <div className="job-card-details-drawer" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <div>👨‍⚕️ Sorumlu Hekim: <strong>{doc?.name || '-'}</strong></div>
                        <div>🏥 Klinik: <strong>{comp?.name || '-'}</strong></div>
                        {pat.notes && (
                          <div style={{ marginTop: 4, padding: '6px 10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', borderLeft: '2px solid var(--dental-teal)' }}>
                            📝 {pat.notes}
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toplam Sipariş: <strong>{patOrders.length}</strong></span>
                        <button
                          type="button"
                          className="btn-dental btn-dental-primary btn-dental-sm"
                          onClick={() => setIsOrderModalOpen(true)}
                        >
                          + Yeni İş Emri Başlat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* HASTA EKLEME & DÜZENLEME MODALI */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-dialog-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingId ? 'Hasta Bilgilerini Düzenle' : 'Yeni Hasta Kaydı'}
              </h3>
              <button
                type="button"
                className="btn-dental btn-dental-secondary"
                style={{ padding: 6, borderRadius: '50%' }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-dialog-body">
                <div className="form-grid-2" style={{ marginBottom: 14 }}>
                  <div className="form-item">
                    <label>Klinik</label>
                    <select
                      className="dental-input"
                      value={companyId}
                      onChange={e => {
                        setCompanyId(e.target.value);
                        setDoctorId('');
                      }}
                    >
                      <option value="">Klinik Seçin...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-item">
                    <label>Tedavi Eden Hekim *</label>
                    <select
                      className="dental-input"
                      value={doctorId}
                      onChange={e => setDoctorId(e.target.value)}
                      required
                    >
                      <option value="">Hekim Seçin...</option>
                      {filteredDoctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-item" style={{ marginBottom: 14 }}>
                  <label>Hasta Adı Soyadı *</label>
                  <input
                    type="text"
                    className="dental-input"
                    placeholder="Örn: Caner Yalçın"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="form-item">
                    <label>Protokol No</label>
                    <input
                      type="text"
                      className="dental-input"
                      placeholder="PRT-..."
                      value={chartNumber}
                      onChange={e => setChartNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-item">
                    <label>Yaş</label>
                    <input
                      type="number"
                      className="dental-input"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                    />
                  </div>
                  <div className="form-item">
                    <label>Cinsiyet</label>
                    <select
                      className="dental-input"
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                    >
                      <option value="Kadın">Kadın</option>
                      <option value="Erkek">Erkek</option>
                    </select>
                  </div>
                </div>

                <div className="form-item">
                  <label>Medikal & Kapanış Notları</label>
                  <textarea
                    className="dental-input"
                    rows={2}
                    placeholder="Bruksizm, derin kapanış, estetik gülüş beklentisi..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn-dental btn-dental-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn-dental btn-dental-primary">
                  {editingId ? 'Değişiklikleri Kaydet' : 'Hastayı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
