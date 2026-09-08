import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Trash2,
  Edit3,
  Phone,
  Mail,
  MapPin,
  X,
  Stethoscope,
  Users,
  Package,
  Check,
  Building,
  UserPlus,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown
} from 'lucide-react';

export const CompaniesView = () => {
  const {
    companies,
    doctors,
    orders,
    patients,
    saveCompany,
    deleteCompany,
    saveDoctor,
    deleteDoctor,
    searchQuery,
    showToast
  } = useDental();
  const { users, upsertCompanyUser, deleteUsersByCompanyId } = useAuth();

  const [expandedCompanyIds, setExpandedCompanyIds] = useState({});

  const toggleExpandCompany = (id, e) => {
    if (e) e.stopPropagation();
    setExpandedCompanyIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Firma Ekleme / Hızlı Düzenleme Modalı
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  const [compName, setCompName] = useState('');
  const [compContact, setCompContact] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compBalance, setCompBalance] = useState(0);
  const [compUsername, setCompUsername] = useState('');
  const [compPassword, setCompPassword] = useState('');

  // Kapsamlı Firma & Bağlı Doktorlar Yönetim Modalı
  const [selectedCompanyForManage, setSelectedCompanyForManage] = useState(null);
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'details' | 'orders'

  // Doğrudan Firma İçinden Doktor Ekleme / Düzenleme State'leri
  const [isDoctorFormOpen, setIsDoctorFormOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docEmail, setDocEmail] = useState('');

  let filtered = [...companies];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(q))
    );
  }

  // Yeni Firma Modalı Aç
  const handleOpenNewCompany = () => {
    setEditingCompanyId(null);
    setCompName('');
    setCompContact('');
    setCompPhone('');
    setCompEmail('');
    setCompAddress('');
    setCompBalance(0);
    setCompUsername('');
    setCompPassword('');
    setIsCompanyModalOpen(true);
  };

  // Firma Düzenleme Modalı Aç
  const handleOpenEditCompany = (comp, e) => {
    if (e) e.stopPropagation();
    setEditingCompanyId(comp.id);
    setCompName(comp.name || '');
    setCompContact(comp.contactPerson || '');
    setCompPhone(comp.phone || '');
    setCompEmail(comp.email || '');
    setCompAddress(comp.address || '');
    setCompBalance(comp.balance || 0);
    const existingUser = users.find(u => u.companyId === comp.id && u.role === 'company');
    setCompUsername(existingUser?.username || '');
    setCompPassword('');
    setIsCompanyModalOpen(true);
  };

  // Firma Kaydet
  const handleSaveCompany = (e) => {
    e.preventDefault();
    if (!editingCompanyId && (!compUsername.trim() || !compPassword)) {
      showToast('Firma için kullanıcı adı ve şifre zorunludur.', 'error');
      return;
    }

    const saved = saveCompany({
      id: editingCompanyId,
      name: compName,
      contactPerson: compContact,
      phone: compPhone,
      email: compEmail,
      address: compAddress,
      balance: parseFloat(compBalance) || 0
    });

    if (compUsername.trim()) {
      const userResult = upsertCompanyUser(
        saved.id,
        compUsername.trim(),
        editingCompanyId ? compPassword : compPassword,
        compName
      );
      if (!userResult.ok) {
        showToast(userResult.error, 'error');
      } else if (!editingCompanyId) {
        showToast('Klinik ve firma kullanıcısı oluşturuldu.', 'success');
      }
    }

    if (selectedCompanyForManage && selectedCompanyForManage.id === editingCompanyId) {
      setSelectedCompanyForManage({ ...selectedCompanyForManage, ...saved });
    }

    setIsCompanyModalOpen(false);
  };

  // Kapsamlı Firma & Bağlı Doktorları Yönet Ekranını Aç
  const handleOpenManageCompany = (comp) => {
    setSelectedCompanyForManage(comp);
    setActiveTab('doctors');
    setIsDoctorFormOpen(false);
    setEditingDoctorId(null);
  };

  // Firma İçinden Doktor Ekleme Formunu Aç
  const handleOpenAddDoctorInCompany = () => {
    setEditingDoctorId(null);
    setDocName('');
    setDocSpecialty('Protetik Diş Tedavisi Uzmanı');
    setDocPhone('');
    setDocEmail('');
    setIsDoctorFormOpen(true);
  };

  // Firma İçinden Doktor Düzenleme Formunu Aç
  const handleOpenEditDoctorInCompany = (doc) => {
    setEditingDoctorId(doc.id);
    setDocName(doc.name || '');
    setDocSpecialty(doc.specialty || '');
    setDocPhone(doc.phone || '');
    setDocEmail(doc.email || '');
    setIsDoctorFormOpen(true);
  };

  // Firma İçindeki Doktoru Kaydet
  const handleSaveDoctorInCompany = (e) => {
    e.preventDefault();
    if (!selectedCompanyForManage) return;

    saveDoctor({
      id: editingDoctorId,
      companyId: selectedCompanyForManage.id,
      name: docName,
      specialty: docSpecialty,
      phone: docPhone,
      email: docEmail
    });

    setIsDoctorFormOpen(false);
    setEditingDoctorId(null);
    setDocName('');
    setDocPhone('');
    setDocEmail('');
  };

  return (
    <div>
      {/* Üst Başlık ve Yeni Ekle */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Müşteri Klinikler & Hekim Yönetimi</h2>
          <p className="page-subtitle">
            Klinikleri, firmaya bağlı çalışan hekimleri ve cari hesapları doğrudan buradan yönetin
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-dental btn-dental-primary"
            onClick={handleOpenNewCompany}
          >
            <Plus size={18} />
            <span>Yeni Klinik Ekle</span>
          </button>
        </div>
      </div>

      {/* Klinik Kartları Listesi */}
      <div className="entity-card-grid">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            Kayıtlı klinik bulunamadı.
          </div>
        ) : (
          filtered.map(comp => {
            const compDocs = doctors.filter(d => d.companyId === comp.id);
            const compOrders = orders.filter(o => o.companyId === comp.id);

            const isExpanded = !!expandedCompanyIds[comp.id];

            return (
              <div
                key={comp.id}
                className={`dental-card ${isExpanded ? 'is-expanded' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: '4px solid var(--dental-blue)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: isExpanded ? '18px' : '14px 18px'
                }}
                onClick={(e) => toggleExpandCompany(comp.id, e)}
                title="Detayları açmak / kapatmak için tıklayın"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {comp.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Yetkili: {comp.contactPerson || '-'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-dental btn-dental-secondary btn-dental-sm"
                        style={{ padding: '5px 7px' }}
                        onClick={(e) => handleOpenEditCompany(comp, e)}
                        title="Klinik Bilgilerini Düzenle"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-dental btn-dental-danger btn-dental-sm"
                        style={{ padding: '5px 7px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`${comp.name} ve bağlı kayıtlar silinsin mi?`)) {
                            deleteUsersByCompanyId(comp.id);
                            deleteCompany(comp.id);
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

                  {/* Kompakt Satır: Sipariş Sayısı, Doktor Sayısı ve Bakiye */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)', fontSize: '0.72rem' }}>
                        📦 {compOrders.length} Sipariş
                      </span>
                      <span className="badge-pill" style={{ background: 'rgba(2, 132, 199, 0.08)', color: 'var(--dental-blue)', fontSize: '0.72rem' }}>
                        👨‍⚕️ {compDocs.length} Hekim
                      </span>
                    </div>

                    <span style={{ fontWeight: 800, color: 'var(--dental-blue)', fontFamily: 'JetBrains Mono', fontSize: '0.92rem' }}>
                      {(comp.balance || 0).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>

                  {/* TIKLANINCA AÇILAN DETAYLAR */}
                  {isExpanded && (
                    <div className="job-card-details-drawer" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Phone size={13} color="var(--dental-blue)" />
                          <span>{comp.phone || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Mail size={13} color="var(--dental-blue)" />
                          <span>{comp.email || '-'}</span>
                        </div>
                        {comp.address && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 2, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} color="var(--dental-blue)" />
                            <span>{comp.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Bağlı Hekimler Hızlı Önizleme */}
                      <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--dental-teal)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Bağlı Hekimler ({compDocs.length})</span>
                        </div>
                        {compDocs.length === 0 ? (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bu kliniğe kayıtlı hekim yok</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {compDocs.slice(0, 4).map(d => (
                              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                                <span style={{ fontWeight: 600 }}>👨‍⚕️ {d.name}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{d.specialty?.split(' ')[0]}</span>
                              </div>
                            ))}
                            {compDocs.length > 4 && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--dental-blue)', fontWeight: 600 }}>
                                +{compDocs.length - 4} hekim daha...
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Kapsamlı Yönetim Butonu */}
                      <button
                        type="button"
                        className="btn-dental btn-dental-primary btn-dental-sm"
                        style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                        onClick={() => handleOpenManageCompany(comp)}
                      >
                        <Stethoscope size={14} />
                        <span>Bağlı Doktorları & Kliniği Yönet</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==========================================================================
          KAPSAMLI FİRMA & BAĞLI DOKTORLARI YÖNETİM MODALI
          ========================================================================== */}
      {selectedCompanyForManage && (
        <div className="modal-overlay" onClick={() => setSelectedCompanyForManage(null)}>
          <div className="modal-dialog-box" style={{ maxWidth: 880 }} onClick={e => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building size={20} color="var(--dental-blue)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {selectedCompanyForManage.name}
                  </h3>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Kliniğe bağlı hekimlerin listesi, hekim düzenleme ve sipariş geçmişi
                </div>
              </div>
              <button
                type="button"
                className="btn-dental btn-dental-secondary"
                style={{ padding: 6, borderRadius: '50%' }}
                onClick={() => setSelectedCompanyForManage(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal İçi Sekmeler */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', padding: '0 24px' }}>
              <button
                type="button"
                className={`btn-dental btn-dental-secondary btn-dental-sm ${activeTab === 'doctors' ? 'btn-dental-primary' : ''}`}
                style={{ borderRadius: '0', borderBottom: 'none', marginRight: 8, padding: '10px 16px' }}
                onClick={() => setActiveTab('doctors')}
              >
                <Stethoscope size={16} />
                <span>Bağlı Hekimler / Doktorlar ({doctors.filter(d => d.companyId === selectedCompanyForManage.id).length})</span>
              </button>
              <button
                type="button"
                className={`btn-dental btn-dental-secondary btn-dental-sm ${activeTab === 'orders' ? 'btn-dental-primary' : ''}`}
                style={{ borderRadius: '0', borderBottom: 'none', padding: '10px 16px' }}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={16} />
                <span>Bu Kliniğin Siparişleri ({orders.filter(o => o.companyId === selectedCompanyForManage.id).length})</span>
              </button>
            </div>

            <div className="modal-dialog-body">
              {/* SEKME 1: BAĞLI HEKİMLER YÖNETİMİ */}
              {activeTab === 'doctors' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>Bu Kliniğe Kayıtlı Diş Hekimleri</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Buradan doğrudan bu klinikte çalışan hekimleri ekleyebilir veya düzenleyebilirsiniz.
                      </p>
                    </div>
                    {!isDoctorFormOpen && (
                      <button
                        type="button"
                        className="btn-dental btn-dental-primary btn-dental-sm"
                        onClick={handleOpenAddDoctorInCompany}
                      >
                        <UserPlus size={15} />
                        <span>+ Bu Kliniğe Yeni Hekim Ekle</span>
                      </button>
                    )}
                  </div>

                  {/* DOKTOR EKLEME / DÜZENLEME FORMU (AKORDİYON) */}
                  {isDoctorFormOpen && (
                    <div style={{ padding: 18, background: 'var(--bg-surface-elevated)', border: '2px solid var(--dental-blue)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--dental-blue)' }}>
                          {editingDoctorId ? 'Hekim Bilgilerini Güncelle' : `"${selectedCompanyForManage.name}" İçin Yeni Hekim Ekle`}
                        </strong>
                        <button
                          type="button"
                          className="btn-dental btn-dental-secondary btn-dental-sm"
                          style={{ padding: 4 }}
                          onClick={() => setIsDoctorFormOpen(false)}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <form onSubmit={handleSaveDoctorInCompany}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                          <div className="form-item">
                            <label>Hekim Adı Soyadı *</label>
                            <input
                              type="text"
                              className="dental-input"
                              placeholder="Örn: Dr. Dt. Selim Aydın"
                              value={docName}
                              onChange={e => setDocName(e.target.value)}
                              required
                            />
                          </div>

                          <div className="form-item">
                            <label>Uzmanlık Alanı</label>
                            <input
                              type="text"
                              className="dental-input"
                              placeholder="Örn: Protetik Diş Tedavisi Uzmanı"
                              value={docSpecialty}
                              onChange={e => setDocSpecialty(e.target.value)}
                            />
                          </div>

                          <div className="form-item">
                            <label>Telefon</label>
                            <input
                              type="text"
                              className="dental-input"
                              placeholder="+90 (532) ..."
                              value={docPhone}
                              onChange={e => setDocPhone(e.target.value)}
                            />
                          </div>

                          <div className="form-item">
                            <label>E-posta</label>
                            <input
                              type="email"
                              className="dental-input"
                              placeholder="hekim@mail.com"
                              value={docEmail}
                              onChange={e => setDocEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            type="button"
                            className="btn-dental btn-dental-secondary btn-dental-sm"
                            onClick={() => setIsDoctorFormOpen(false)}
                          >
                            İptal
                          </button>
                          <button type="submit" className="btn-dental btn-dental-primary btn-dental-sm">
                            <Check size={14} />
                            <span>{editingDoctorId ? 'Hekimi Güncelle' : 'Hekimi Kaydet'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Hekimler Tablosu / Listesi */}
                  <div className="dental-table-wrapper">
                    <table className="dental-table">
                      <thead>
                        <tr>
                          <th>Hekim Adı</th>
                          <th>Uzmanlık</th>
                          <th>İletişim</th>
                          <th>Kayıtlı Hasta</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.filter(d => d.companyId === selectedCompanyForManage.id).length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                              Bu kliniğe bağlı kayıtlı hekim bulunmuyor. Yukarıdaki butondan ekleyebilirsiniz.
                            </td>
                          </tr>
                        ) : (
                          doctors
                            .filter(d => d.companyId === selectedCompanyForManage.id)
                            .map(doc => {
                              const docPats = patients.filter(p => p.doctorId === doc.id);
                              return (
                                <tr key={doc.id}>
                                  <td>
                                    <strong>👨‍⚕️ {doc.name}</strong>
                                  </td>
                                  <td>
                                    <span className="badge-pill" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                      {doc.specialty || 'Diş Hekimi'}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.82rem' }}>{doc.phone || '-'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.email || ''}</div>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 700 }}>{docPats.length}</span> Hasta
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                      <button
                                        type="button"
                                        className="btn-dental btn-dental-secondary btn-dental-sm"
                                        onClick={() => handleOpenEditDoctorInCompany(doc)}
                                        title="Bu Hekimi Düzenle"
                                      >
                                        <Edit3 size={13} />
                                        <span>Düzenle</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-dental btn-dental-danger btn-dental-sm"
                                        onClick={() => {
                                          if (window.confirm(`${doc.name} adlı hekim bu klinikten silinsin mi?`)) {
                                            deleteDoctor(doc.id);
                                          }
                                        }}
                                        title="Hekimi Sil"
                                      >
                                        <Trash2 size={13} />
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
                </div>
              )}

              {/* SEKME 2: BU KLİNİĞİN SİPARİŞLERİ */}
              {activeTab === 'orders' && (
                <div>
                  <div className="dental-table-wrapper">
                    <table className="dental-table">
                      <thead>
                        <tr>
                          <th>İş Emri No</th>
                          <th>Hasta</th>
                          <th>Hekim</th>
                          <th>Materyal</th>
                          <th>Teslim Tarihi</th>
                          <th>Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o => o.companyId === selectedCompanyForManage.id).length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                              Bu kliniğe ait sipariş bulunamadı.
                            </td>
                          </tr>
                        ) : (
                          orders
                            .filter(o => o.companyId === selectedCompanyForManage.id)
                            .map(o => {
                              const pat = patients.find(p => p.id === o.patientId);
                              const doc = doctors.find(d => d.id === o.doctorId);
                              return (
                                <tr key={o.id}>
                                  <td>
                                    <strong style={{ color: 'var(--dental-blue)', fontFamily: 'JetBrains Mono' }}>{o.id}</strong>
                                  </td>
                                  <td>{pat?.name || '-'}</td>
                                  <td>{doc?.name || '-'}</td>
                                  <td>
                                    <span className="badge-pill" style={{ background: 'var(--bg-surface-elevated)' }}>
                                      {o.materialId} • {o.shade}
                                    </span>
                                  </td>
                                  <td>{o.deliveryDate}</td>
                                  <td>
                                    <span className={`badge-pill badge-${o.status}`}>
                                      {o.status === 'in_progress' ? 'İşlemde' : o.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-dialog-footer">
              <button
                type="button"
                className="btn-dental btn-dental-secondary"
                onClick={() => setSelectedCompanyForManage(null)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KLİNİK BİLGİLERİNİ EKLE / DÜZENLE MODALI */}
      {isCompanyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCompanyModalOpen(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-dialog-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingCompanyId ? 'Klinik Bilgilerini Düzenle' : 'Yeni Müşteri Klinik Ekle'}
              </h3>
              <button
                type="button"
                className="btn-dental btn-dental-secondary"
                style={{ padding: 6, borderRadius: '50%' }}
                onClick={() => setIsCompanyModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCompany}>
              <div className="modal-dialog-body">
                <div className="form-item" style={{ marginBottom: 14 }}>
                  <label>Klinik / Hastane Adı *</label>
                  <input
                    type="text"
                    className="dental-input"
                    placeholder="Örn: DentModern Ağız ve Diş Sağlığı"
                    value={compName}
                    onChange={e => setCompName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: 14 }}>
                  <div className="form-item">
                    <label>Yetkili Kişi</label>
                    <input
                      type="text"
                      className="dental-input"
                      placeholder="Örn: Merve Hanım"
                      value={compContact}
                      onChange={e => setCompContact(e.target.value)}
                    />
                  </div>
                  <div className="form-item">
                    <label>Telefon</label>
                    <input
                      type="text"
                      className="dental-input"
                      placeholder="+90 (212) ..."
                      value={compPhone}
                      onChange={e => setCompPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: 14 }}>
                  <div className="form-item">
                    <label>E-posta</label>
                    <input
                      type="email"
                      className="dental-input"
                      placeholder="klinik@mail.com"
                      value={compEmail}
                      onChange={e => setCompEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-item">
                    <label>Cari Bakiye (₺)</label>
                    <input
                      type="number"
                      className="dental-input"
                      value={compBalance}
                      onChange={e => setCompBalance(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-item">
                  <label>Adres & Fatura Bilgisi</label>
                  <textarea
                    className="dental-input"
                    rows={2}
                    placeholder="Açık adres..."
                    value={compAddress}
                    onChange={e => setCompAddress(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-surface-elevated)', borderRadius: 10, border: '1px dashed var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, marginBottom: 10, color: 'var(--dental-blue)' }}>
                    Firma giriş hesabı
                  </div>
                  <div className="form-grid-2">
                    <div className="form-item">
                      <label>Kullanıcı adı {editingCompanyId ? '' : '*'}</label>
                      <input
                        type="text"
                        className="dental-input"
                        placeholder="ornek.klinik"
                        value={compUsername}
                        onChange={e => setCompUsername(e.target.value)}
                        required={!editingCompanyId}
                      />
                    </div>
                    <div className="form-item">
                      <label>{editingCompanyId ? 'Yeni şifre (boş = değişmez)' : 'Şifre *'}</label>
                      <input
                        type="password"
                        className="dental-input"
                        placeholder={editingCompanyId ? 'Değiştirmek için yazın' : 'Şifre'}
                        value={compPassword}
                        onChange={e => setCompPassword(e.target.value)}
                        required={!editingCompanyId}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    Bu hesap yalnızca kendi işlerinin üretim hattını görür.
                  </div>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn-dental btn-dental-secondary"
                  onClick={() => setIsCompanyModalOpen(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn-dental btn-dental-primary">
                  {editingCompanyId ? 'Değişiklikleri Kaydet' : 'Kliniği Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
