import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { Plus, Trash2, Edit3, Phone, Mail, Stethoscope, X, ChevronDown, ChevronUp } from 'lucide-react';

export const DoctorsView = () => {
  const { doctors, companies, patients, orders, saveDoctor, deleteDoctor, searchQuery } = useDental();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedDoctorIds, setExpandedDoctorIds] = useState({});

  const toggleExpandDoctor = (docId, e) => {
    if (e) e.stopPropagation();
    setExpandedDoctorIds(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const [companyId, setCompanyId] = useState('');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  let filtered = [...doctors];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.specialty && d.specialty.toLowerCase().includes(q))
    );
  }

  const openNewModal = () => {
    setEditingId(null);
    setCompanyId(companies[0]?.id || '');
    setName('');
    setSpecialty('');
    setPhone('');
    setEmail('');
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingId(doc.id);
    setCompanyId(doc.companyId || '');
    setName(doc.name || '');
    setSpecialty(doc.specialty || '');
    setPhone(doc.phone || '');
    setEmail(doc.email || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyId) {
      alert('Lütfen hekimin bağlı olduğu kliniği seçin.');
      return;
    }
    saveDoctor({
      id: editingId,
      companyId,
      name,
      specialty,
      phone,
      email
    });
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Hekimler & Diş Doktorları
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Kliniklere bağlı diş hekimleri, uzmanlık alanları, düzenleme ve iş emri geçmişi
          </p>
        </div>
        <button
          type="button"
          className="btn-dental btn-dental-primary"
          onClick={openNewModal}
        >
          <Plus size={18} />
          <span>Yeni Hekim Ekle</span>
        </button>
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            Kayıtlı hekim bulunamadı.
          </div>
        ) : (
          filtered.map(doc => {
            const comp = companies.find(c => c.id === doc.companyId);
            const docPatients = patients.filter(p => p.doctorId === doc.id);
            const docOrders = orders.filter(o => o.doctorId === doc.id);
            const isExpanded = !!expandedDoctorIds[doc.id];

            return (
              <div
                key={doc.id}
                className={`dental-card ${isExpanded ? 'is-expanded' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: isExpanded ? '18px' : '14px 18px'
                }}
                onClick={(e) => toggleExpandDoctor(doc.id, e)}
                title="Detayları açmak / kapatmak için tıklayın"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--dental-blue)', fontWeight: 700, marginTop: 2 }}>
                        {doc.specialty || 'Diş Hekimi'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn-dental btn-dental-secondary btn-dental-sm"
                        style={{ padding: '5px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(doc);
                        }}
                        title="Hekimi Düzenle"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-dental btn-dental-danger btn-dental-sm"
                        style={{ padding: '5px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`${doc.name} silinsin mi?`)) {
                            deleteDoctor(doc.id);
                          }
                        }}
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="card-expand-indicator" style={{ marginLeft: 4 }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Kompakt Özet Satırı */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>🏥 {comp?.name || 'Bağımsız'}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)', fontSize: '0.72rem' }}>
                        {docPatients.length} Hasta
                      </span>
                      <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)', fontSize: '0.72rem' }}>
                        {docOrders.length} İş
                      </span>
                    </div>
                  </div>

                  {/* TIKLANINCA AÇILAN DETAYLAR */}
                  {isExpanded && (
                    <div className="job-card-details-drawer" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        <div><strong>🏥 Bağlı Klinik:</strong> {comp?.name || 'Bağımsız'}</div>
                        
                        {doc.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Phone size={14} color="var(--dental-blue)" />
                              <span>{doc.phone}</span>
                            </div>
                            <a
                              href={`tel:${doc.phone}`}
                              className="btn-dental btn-dental-secondary btn-dental-sm"
                              style={{ padding: '3px 8px', fontSize: '0.75rem', textDecoration: 'none' }}
                            >
                              📞 Hemen Ara
                            </a>
                          </div>
                        )}

                        {doc.email && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Mail size={14} color="var(--dental-blue)" />
                              <span>{doc.email}</span>
                            </div>
                            <a
                              href={`mailto:${doc.email}`}
                              className="btn-dental btn-dental-secondary btn-dental-sm"
                              style={{ padding: '3px 8px', fontSize: '0.75rem', textDecoration: 'none' }}
                            >
                              ✉️ E-posta
                            </a>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>👥 Kayıtlı Hasta: <strong>{docPatients.length}</strong></span>
                        <span>📦 Toplam İş Emri: <strong>{docOrders.length}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* HEKİM EKLEME & DÜZENLEME MODALI */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-dialog-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingId ? 'Hekim Bilgilerini Düzenle' : 'Yeni Hekim Ekle'}
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
                <div className="form-item" style={{ marginBottom: 14 }}>
                  <label>Bağlı Olduğu Klinik *</label>
                  <select
                    className="dental-input"
                    value={companyId}
                    onChange={e => setCompanyId(e.target.value)}
                    required
                  >
                    <option value="">Klinik Seçin...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-item" style={{ marginBottom: 14 }}>
                  <label>Hekim Adı Soyadı *</label>
                  <input
                    type="text"
                    className="dental-input"
                    placeholder="Örn: Dr. Dt. Selim Aydın"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-item" style={{ marginBottom: 14 }}>
                  <label>Uzmanlık Alanı</label>
                  <input
                    type="text"
                    className="dental-input"
                    placeholder="Örn: Protetik Diş Tedavisi Uzmanı"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-item">
                    <label>Telefon / GSM</label>
                    <input
                      type="text"
                      className="dental-input"
                      placeholder="+90 (532) ..."
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-item">
                    <label>E-posta</label>
                    <input
                      type="email"
                      className="dental-input"
                      placeholder="hekim@mail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
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
                  {editingId ? 'Değişiklikleri Kaydet' : 'Hekimi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
