import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { CheckCircle2, Plus, Trash2, Edit2, X, Check, Clock } from 'lucide-react';

export const PipelineStepper = ({ order }) => {
  const {
    updateStepStatus,
    addStepToOrder,
    removeStepFromOrder,
    editStepInOrder,
    technicians
  } = useDental();

  const [localSteps, setLocalSteps] = useState(order.steps || []);

  // Yeni Aşama Ekleme State'leri
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepTech, setNewStepTech] = useState(technicians[0] || '');

  // Mevcut Aşamayı Düzenleme State'i
  const [editingStepIdx, setEditingStepIdx] = useState(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editStepSubtitle, setEditStepSubtitle] = useState('');

  const completedCount = (order.steps || []).filter(s => s.status === 'completed').length;
  const totalCount = (order.steps || []).length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleFieldChange = (stepIndex, field, value) => {
    const next = [...localSteps];
    next[stepIndex] = { ...next[stepIndex], [field]: value };
    setLocalSteps(next);
  };

  const handleSaveStep = (stepIndex) => {
    const s = localSteps[stepIndex] || order.steps[stepIndex];
    updateStepStatus(order.id, stepIndex, s.status, s.technician, s.notes);
  };

  const handleQuickComplete = (stepIndex) => {
    const s = localSteps[stepIndex] || order.steps[stepIndex];
    updateStepStatus(order.id, stepIndex, 'completed', s.technician, s.notes);
  };

  // Yeni Aşama Ekleme
  const handleCreateStep = (e) => {
    e.preventDefault();
    if (!newStepName.trim()) return;
    addStepToOrder(order.id, newStepName.trim(), newStepDesc.trim(), newStepTech);
    setNewStepName('');
    setNewStepDesc('');
    setIsAddingStep(false);
  };

  // Aşamayı Düzenleme
  const openEditStep = (step, idx) => {
    setEditingStepIdx(idx);
    setEditStepTitle(step.name);
    setEditStepSubtitle(step.description || '');
  };

  const handleSaveStepTitle = (idx) => {
    editStepInOrder(order.id, idx, {
      name: editStepTitle,
      description: editStepSubtitle
    });
    setEditingStepIdx(null);
  };

  return (
    <div>
      {/* İlerleme ve Aşama Ekleme Üst Barı */}
      <div style={{ padding: '16px 20px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Üretim Aşamaları Durumu:</span>
            <strong style={{ marginLeft: 8, color: 'var(--dental-blue)', fontSize: '1rem' }}>
              {completedCount} / {totalCount} Aşama Tamamlandı
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--dental-teal)' }}>
              %{progressPct}
            </span>

            {/* Yeni Aşama Ekle Butonu */}
            <button
              type="button"
              className="btn-dental btn-dental-primary btn-dental-sm"
              onClick={() => setIsAddingStep(prev => !prev)}
            >
              <Plus size={15} />
              <span>+ Yeni Aşama Ekle</span>
            </button>
          </div>
        </div>

        <div style={{ height: 8, background: 'var(--border-subtle)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, var(--dental-blue), var(--dental-teal-light))',
              borderRadius: 999,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* YENİ AŞAMA EKLEME FORMU */}
      {isAddingStep && (
        <form
          onSubmit={handleCreateStep}
          style={{
            padding: 16,
            background: 'var(--bg-surface)',
            border: '2px dashed var(--dental-blue)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <strong style={{ fontSize: '0.95rem', color: 'var(--dental-blue)' }}>
              Bu İş Emrine Özel Yeni Aşama Ekle
            </strong>
            <button
              type="button"
              className="btn-dental btn-dental-secondary btn-dental-sm"
              style={{ padding: 4 }}
              onClick={() => setIsAddingStep(false)}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div className="form-item">
              <label>Aşama Adı *</label>
              <input
                type="text"
                className="dental-input"
                placeholder="Örn: Dentin / Koping Provası"
                value={newStepName}
                onChange={e => setNewStepName(e.target.value)}
                required
              />
            </div>

            <div className="form-item">
              <label>Sorumlu Teknisyen</label>
              <select
                className="dental-input"
                value={newStepTech}
                onChange={e => setNewStepTech(e.target.value)}
              >
                {technicians.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-item" style={{ gridColumn: '1 / -1' }}>
              <label>Aşama Açıklaması / Talimat</label>
              <input
                type="text"
                className="dental-input"
                placeholder="Örn: Kliniğe prova için gönderilecek, uyum kontrol edilecek..."
                value={newStepDesc}
                onChange={e => setNewStepDesc(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              className="btn-dental btn-dental-secondary btn-dental-sm"
              onClick={() => setIsAddingStep(false)}
            >
              Vazgeç
            </button>
            <button type="submit" className="btn-dental btn-dental-primary btn-dental-sm">
              Aşamayı Kaydet & Ekle
            </button>
          </div>
        </form>
      )}

      {/* AŞAMALAR LİSTESİ (DÜZENLEME & ÇIKARMA DESTEKLİ) */}
      <div className="stepper-chain-list">
        {(order.steps || []).map((step, idx) => {
          const isDone = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          const isRevision = step.status === 'revision';
          const curLocal = localSteps[idx] || step;
          const isEditingThisTitle = editingStepIdx === idx;

          return (
            <div
              key={idx}
              className={`stepper-row-card ${isDone ? 'is-done' : ''} ${isInProgress ? 'is-active' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      background: isDone ? 'var(--status-completed)' : (isInProgress ? 'var(--dental-blue)' : 'var(--bg-surface-elevated)'),
                      color: isDone || isInProgress ? '#fff' : 'var(--text-secondary)',
                      border: '2px solid',
                      borderColor: isDone ? 'var(--status-completed)' : (isInProgress ? 'var(--dental-blue)' : 'var(--border-subtle)'),
                      flexShrink: 0
                    }}
                  >
                    {isDone ? <CheckCircle2 size={20} /> : step.order}
                  </div>

                  {/* Başlık veya Başlık Düzenleme Alanı */}
                  <div style={{ flex: 1 }}>
                    {isEditingThisTitle ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input
                          type="text"
                          className="dental-input"
                          style={{ fontWeight: 700, fontSize: '0.95rem', padding: '4px 8px' }}
                          value={editStepTitle}
                          onChange={e => setEditStepTitle(e.target.value)}
                        />
                        <input
                          type="text"
                          className="dental-input"
                          style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                          value={editStepSubtitle}
                          onChange={e => setEditStepSubtitle(e.target.value)}
                          placeholder="Aşama açıklaması..."
                        />
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <button
                            type="button"
                            className="btn-dental btn-dental-primary btn-dental-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleSaveStepTitle(idx)}
                          >
                            <Check size={12} />
                            <span>Kaydet</span>
                          </button>
                          <button
                            type="button"
                            className="btn-dental btn-dental-secondary btn-dental-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => setEditingStepIdx(null)}
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{step.name}</span>
                          <button
                            type="button"
                            className="btn-dental btn-dental-secondary"
                            style={{ padding: '2px 5px', border: 'none', background: 'transparent' }}
                            onClick={() => openEditStep(step, idx)}
                            title="Aşama Başlığını Düzenle"
                          >
                            <Edit2 size={13} color="var(--text-muted)" />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          {step.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rozet ve Aşamayı Sil Butonu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge-pill badge-${step.status}`}>
                    {isDone && 'Tamamlandı ✓'}
                    {isInProgress && 'İşlemde ⚙️'}
                    {isRevision && 'Revizyon ⚠️'}
                    {step.status === 'pending' && 'Bekliyor'}
                  </span>

                  <button
                    type="button"
                    className="btn-dental btn-dental-danger btn-dental-sm"
                    style={{ padding: '5px 7px' }}
                    onClick={() => {
                      if (window.confirm(`"${step.name}" aşaması bu iş emrinden çıkarılsın mı?`)) {
                        removeStepFromOrder(order.id, idx);
                      }
                    }}
                    title="Bu Aşamayı Çıkar / Sil"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Teknisyen ve Durum Düzenleme Paneli */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Sorumlu Teknisyen:</label>
                  <select
                    className="dental-input"
                    style={{ width: '100%', fontSize: '0.82rem', padding: '6px 10px' }}
                    value={curLocal.technician || ''}
                    onChange={(e) => handleFieldChange(idx, 'technician', e.target.value)}
                  >
                    <option value="">Teknisyen Ata...</option>
                    {technicians.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Durum:</label>
                  <select
                    className="dental-input"
                    style={{ width: '100%', fontSize: '0.82rem', padding: '6px 10px' }}
                    value={curLocal.status || 'pending'}
                    onChange={(e) => handleFieldChange(idx, 'status', e.target.value)}
                  >
                    <option value="pending">Bekliyor</option>
                    <option value="in_progress">İşleme Al (İşlemde)</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="revision">Revizyon Talebi</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Aşama Notu / Rapor:</label>
                  <input
                    type="text"
                    className="dental-input"
                    style={{ width: '100%', fontSize: '0.82rem', padding: '6px 10px' }}
                    placeholder="Örn: 920 derecede sinterlendi, çatlak ve pürüz yok..."
                    value={curLocal.notes || ''}
                    onChange={(e) => handleFieldChange(idx, 'notes', e.target.value)}
                  />
                </div>
              </div>

              {/* Aksiyon Butonları & Zaman */}
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                  {step.completedAt ? `Bitiş: ${step.completedAt}` : (step.startedAt ? `Başlama: ${step.startedAt}` : 'Henüz başlanmadı')}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {!isDone ? (
                    <button
                      type="button"
                      className="btn-dental btn-dental-primary btn-dental-sm"
                      onClick={() => handleQuickComplete(idx)}
                    >
                      Bu Aşamayı Tamamla ✓
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-dental btn-dental-secondary btn-dental-sm"
                      onClick={() => handleSaveStep(idx)}
                    >
                      Güncelle
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
