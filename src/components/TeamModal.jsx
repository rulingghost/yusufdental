import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { Users, Plus, Trash2, X, Briefcase, Award, CheckCircle2, Edit2, RotateCcw } from 'lucide-react';

const COMMON_ROLES = [
  '🎨 Seramist / Porselen',
  '💻 CAD/CAM Tasarım',
  '🦷 Alçı & Modelaj',
  '⚙️ Metal & Altyapı',
  '🔥 Fırınlama & Sinter',
  '✨ Glaze & Polisaj'
];

export const TeamModal = () => {
  const {
    isTeamModalOpen,
    setIsTeamModalOpen,
    techniciansList,
    addTechnician,
    updateTechnician,
    removeTechnician,
    orders
  } = useDental();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [editingTech, setEditingTech] = useState(null);

  if (!isTeamModalOpen) return null;

  // Her teknisyenin aktif üzerindeki iş adedini hesapla
  const getWorkload = (techName) => {
    return orders.filter(o => {
      if (o.status === 'completed') return false;
      const curStep = o.steps?.[o.currentStepIndex];
      return curStep?.technician === techName;
    }).length;
  };

  const handleStartEdit = (tech) => {
    setEditingTech(tech);
    setName(tech.name || '');
    setRole(tech.role || '');
  };

  const handleCancelEdit = () => {
    setEditingTech(null);
    setName('');
    setRole('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTech) {
      updateTechnician(editingTech.id, {
        name: name.trim(),
        role: role.trim() || 'Dental Teknisyen'
      });
      setEditingTech(null);
    } else {
      addTechnician(name.trim(), role.trim() || 'Dental Teknisyen');
    }

    setName('');
    setRole('');
  };

  const handleRemove = (tech) => {
    if (editingTech?.id === tech.id) {
      handleCancelEdit();
    }
    const workload = getWorkload(tech.name);
    const msg = workload > 0
      ? `"${tech.name}" şu anda ${workload} aktif işte sorumlu olarak atanmış durumda. Yine de ekipten çıkarılsın mı?`
      : `"${tech.name}" laboratuvar ekibinden çıkarılsın mı?`;
    if (window.confirm(msg)) {
      removeTechnician(tech.id || tech.name);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsTeamModalOpen(false)}>
      <div
        className="modal-dialog-box"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlığı */}
        <div className="modal-dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(2, 132, 199, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--dental-blue)'
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Laboratuvar Ekibi & Teknisyenler
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Sorumlu teknisyen ekleyin, unvanlarını belirleyin veya ekipten çıkarın.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={() => setIsTeamModalOpen(false)}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-dialog-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Teknisyen Ekleme / Düzenleme Formu */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: 16,
              background: editingTech ? 'rgba(2, 132, 199, 0.05)' : 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: editingTech ? '1px solid var(--dental-blue)' : '1px solid var(--border-subtle)',
              marginBottom: 20
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--dental-blue)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {editingTech ? <Edit2 size={16} /> : <Plus size={16} />}
                <span>{editingTech ? `Teknisyeni Düzenle: ${editingTech.name}` : 'Yeni Teknisyen / Personel Ekle'}</span>
              </div>
              {editingTech && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <RotateCcw size={12} />
                  <span>Vazgeç</span>
                </button>
              )}
            </div>

            <div className="form-grid-2" style={{ marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Teknisyen Adı Soyadı *
                </label>
                <input
                  type="text"
                  className="dental-input"
                  placeholder="Örn: Hakan Usta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Uzmanlık / Departman
                </label>
                <input
                  type="text"
                  className="dental-input"
                  placeholder="Örn: CAD/CAM & Tarama"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            {/* Hızlı Rol Çipleri */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 5 }}>Hızlı unvan seçimi:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {COMMON_ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    className="quick-micro-btn"
                    onClick={() => setRole(r.replace(/^[^\s]+\s/, ''))}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {editingTech && (
                <button
                  type="button"
                  className="btn-dental btn-dental-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={handleCancelEdit}
                >
                  Vazgeç
                </button>
              )}
              <button
                type="submit"
                className="btn-dental btn-dental-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                {editingTech ? <CheckCircle2 size={15} /> : <Plus size={15} />}
                <span>{editingTech ? 'Değişiklikleri Kaydet' : 'Teknisyeni Kaydet'}</span>
              </button>
            </div>
          </form>

          {/* Mevcut Teknisyenler Listesi */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Kayıtlı Teknisyenler ({techniciansList.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Düzenleyin veya iş emirlerinde sorumlu atayın
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {techniciansList.map((tech, idx) => {
                const workload = getWorkload(tech.name);
                const isCurrentEdit = editingTech?.id === tech.id;
                const initials = tech.name
                  .split(' ')
                  .map(p => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'TK';

                return (
                  <div
                    key={tech.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: isCurrentEdit ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)',
                      border: isCurrentEdit ? '1.5px solid var(--dental-blue)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--dental-blue), var(--dental-cyan))',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          flexShrink: 0
                        }}
                      >
                        {initials}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {tech.name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Award size={12} />
                          <span>{tech.role || 'Dental Teknisyen'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 999,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: workload > 0 ? 'rgba(2, 132, 199, 0.1)' : 'var(--bg-surface-elevated)',
                          color: workload > 0 ? 'var(--dental-blue)' : 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)'
                        }}
                        title={`${tech.name} üzerindeki aktif iş sayısı`}
                      >
                        {workload > 0 ? `${workload} Aktif İş` : 'Müsait'}
                      </span>

                      <button
                        type="button"
                        className="btn-dental btn-dental-secondary btn-dental-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handleStartEdit(tech)}
                        title="Teknisyeni Düzenle"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        type="button"
                        className="btn-dental btn-dental-danger btn-dental-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handleRemove(tech)}
                        title="Teknisyeni Ekipten Çıkar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Altı */}
        <div className="modal-dialog-footer" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-dental btn-dental-secondary"
            onClick={() => setIsTeamModalOpen(false)}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
