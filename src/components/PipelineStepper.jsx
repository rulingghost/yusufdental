import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { useAuth } from '../context/AuthContext';
import { StepDateModal } from './StepDateModal';
import { CheckCircle2, Plus, Trash2, Edit2, X, Check, Clock, ArrowRight, User, Info, ChevronDown } from 'lucide-react';

export const PipelineStepper = ({ order }) => {
  const {
    updateStepStatus,
    addStepToOrder,
    removeStepFromOrder,
    editStepInOrder,
    technicians,
    assignTechnicianToStep,
    toggleStepCompletion,
    convertImplantToMdp,
    setIsTeamModalOpen
  } = useDental();
  const { isCompany, isOperator } = useAuth();
  const isLocked = isCompany || isOperator || order.status === 'rejected';

  const [localSteps, setLocalSteps] = useState(order.steps || []);
  const [openInfoIdx, setOpenInfoIdx] = useState(null);

  // Yeni Aşama Ekleme State'leri
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepTech, setNewStepTech] = useState(technicians[0] || '');

  // Mevcut Aşamayı Düzenleme State'i
  const [editingStepIdx, setEditingStepIdx] = useState(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editStepSubtitle, setEditStepSubtitle] = useState('');

  const [dateModal, setDateModal] = useState(null);

  const completedCount = (order.steps || []).filter(s => s.status === 'completed').length;
  const totalCount = (order.steps || []).length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentStepIdx = (order.steps || []).findIndex(s => s.status === 'in_progress');
  const activeStep = currentStepIdx !== -1 ? order.steps[currentStepIdx] : null;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;
  const isImplantLastStage = order.materialId === 'implant' && currentStepIdx === totalCount - 1 && !!activeStep;

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
    setDateModal({ mode: 'next', stepIndex, stepName: s?.name || 'Aşama' });
  };

  const confirmDateModal = (date) => {
    if (!dateModal) return;
    if (dateModal.mode === 'toMdp') {
      convertImplantToMdp(order.id, date);
    } else if (dateModal.mode === 'toggle') {
      const s = localSteps[dateModal.stepIndex] || order.steps[dateModal.stepIndex];
      if (s?.status === 'completed') {
        updateStepStatus(order.id, dateModal.stepIndex, 'in_progress', s.technician, s.notes);
      } else {
        updateStepStatus(order.id, dateModal.stepIndex, 'completed', s?.technician || '', s?.notes || '', date);
      }
    } else {
      const s = localSteps[dateModal.stepIndex] || order.steps[dateModal.stepIndex];
      updateStepStatus(order.id, dateModal.stepIndex, 'completed', s?.technician || '', s?.notes || '', date);
    }
    setDateModal(null);
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
      <div style={{ padding: '16px 20px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: 14 }}>
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

            {!isLocked && (
            <button
              type="button"
              className="btn-dental btn-dental-primary btn-dental-sm"
              onClick={() => setIsAddingStep(prev => !prev)}
            >
              <Plus size={15} />
              <span>+ Yeni Aşama Ekle</span>
            </button>
            )}
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

      {/* 1-TIKLA HIZLI AŞAMA İLERLETME KARTI (Frictionless Quick Advance) */}
      {activeStep && !isAllCompleted && !isLocked && (
        <div className="quick-advance-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="pulse-indicator" />
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--dental-blue)', letterSpacing: '0.05em' }}>
                Şu Anki İstasyon:
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {activeStep.order}. {activeStep.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 1 }}>
                Sorumlu: <strong>{activeStep.technician || 'Atanmadı'}</strong>
              </div>
            </div>
          </div>

          {isImplantLastStage ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-dental btn-dental-primary"
                style={{ padding: '10px 18px', fontSize: '0.92rem' }}
                onClick={() => handleQuickComplete(currentStepIdx)}
              >
                <span>✓ Bitir</span>
              </button>
              <button
                type="button"
                className="btn-dental btn-dental-primary"
                style={{
                  padding: '10px 18px',
                  fontSize: '0.92rem',
                  background: 'linear-gradient(135deg, #e11d48, #be123c)',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
                }}
                onClick={() => setDateModal({ mode: 'toMdp', stepName: 'Glaze' })}
              >
                <span>MDP'ye geç</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-dental btn-dental-primary"
              style={{ padding: '10px 18px', fontSize: '0.92rem', boxShadow: '0 4px 14px var(--dental-primary-glow)' }}
              onClick={() => handleQuickComplete(currentStepIdx)}
            >
              <span>✓ Bu Aşamayı Tamamla ve Sonrakine Geç</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

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

      {/* AŞAMALAR LİSTESİ: KÜÇÜK TAMAMLANDI KUTUCUKLARI & İŞLEM HAKKINDA ÇEKMECESİ */}
      <div className="stepper-compact-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(order.steps || []).map((step, idx) => {
          const isDone = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          const isRevision = step.status === 'revision';
          const curLocal = localSteps[idx] || step;
          const isEditingThisTitle = editingStepIdx === idx;
          const isInfoOpen = openInfoIdx === idx;

          return (
            <div
              key={idx}
              className={`stepper-compact-card ${isDone ? 'is-done' : ''} ${isInProgress ? 'is-active' : ''}`}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid',
                borderColor: isInProgress ? 'var(--dental-blue)' : (isDone ? 'rgba(5, 150, 105, 0.3)' : 'var(--border-subtle)'),
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                transition: 'var(--transition)',
                boxShadow: isInProgress ? '0 0 0 2px rgba(2, 132, 199, 0.15)' : 'none'
              }}
            >
              {/* ANA SATIR: Küçük Tamamlandı Kutucuğu + Aşama İsmi + Sorumlu + 'İşlem Hakkında' Butonu */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                {/* Sol Grup: Küçük Tamamlandı Kutucuğu + Numara & İsim */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  {/* KÜÇÜK TAMAMLANDI KUTUCUĞU */}
                  <button
                    type="button"
                    className={`step-compact-checkbox ${isDone ? 'is-checked' : ''}`}
                    onClick={() => {
                      if (isLocked) return;
                      const s = order.steps[idx];
                      if (s?.status === 'completed') {
                        toggleStepCompletion(order.id, idx);
                        return;
                      }
                      setDateModal({ mode: 'toggle', stepIndex: idx, stepName: s?.name || 'Aşama' });
                    }}
                    disabled={isLocked}
                    title={isLocked ? 'Bu aşama yalnızca görüntülenir' : (isDone ? 'Tamamlandı (İşlemde yapmak için tıkla)' : 'Tamamlandı olarak işaretle (1 tıkla bitir)')}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      border: '2px solid',
                      borderColor: isDone ? 'var(--status-completed)' : 'var(--border-subtle)',
                      background: isDone ? 'var(--status-completed)' : 'var(--bg-surface-elevated)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isLocked ? 'default' : 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isDone ? <Check size={16} strokeWidth={3} /> : null}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: isDone ? 'var(--status-completed)' : (isInProgress ? 'var(--dental-blue)' : 'var(--text-muted)'),
                        fontFamily: 'JetBrains Mono'
                      }}
                    >
                      {step.order}.
                    </span>

                    <span
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: isDone ? 'line-through' : 'none'
                      }}
                    >
                      {step.name}
                    </span>

                    {/* Durum Rozeti */}
                    {isDone && (
                      <span className="badge-pill badge-completed" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                        ✓ Tamamlandı
                      </span>
                    )}
                    {isInProgress && (
                      <span className="badge-pill badge-inprogress" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                        ⚙️ İşlemde
                      </span>
                    )}
                    {isRevision && (
                      <span className="badge-pill badge-revision" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                        ⚠️ Revizyon
                      </span>
                    )}
                  </div>
                </div>

                {/* Sağ Grup: Sorumlu Teknisyen + 'İşlem Hakkında' Butonu + Sil */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Sorumlu Teknisyen Seçici Dropdown */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      padding: '3px 8px'
                    }}
                  >
                    <User size={12} color="var(--dental-blue)" />
                    {isLocked ? (
                      <span style={{ fontSize: '0.76rem', fontWeight: 600 }}>{step.technician || 'Atanmamış'}</span>
                    ) : (
                    <select
                      value={step.technician || ''}
                      onChange={(e) => assignTechnicianToStep(order.id, idx, e.target.value)}
                      title="Sorumlu Teknisyeni Belirle"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="">Sorumlu Ata...</option>
                      {technicians.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    )}
                  </div>

                  {/* 'İşlem Hakkında' Açılır Detay Butonu */}
                  <button
                    type="button"
                    className={`btn-dental btn-dental-sm ${isInfoOpen ? 'btn-dental-primary' : 'btn-dental-secondary'}`}
                    style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                    onClick={() => setOpenInfoIdx(isInfoOpen ? null : idx)}
                    title="Aşama açıklaması, talimatlar ve notları gör/düzenle"
                  >
                    <Info size={13} />
                    <span>İşlem Hakkında</span>
                    <ChevronDown
                      size={13}
                      style={{
                        transform: isInfoOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                      }}
                    />
                  </button>

                  {!isLocked && (
                  <button
                    type="button"
                    className="btn-dental btn-dental-danger btn-dental-sm"
                    style={{ padding: '5px 7px' }}
                    onClick={() => {
                      if (window.confirm(`"${step.name}" aşaması bu iş emrinden çıkarılsın mı?`)) {
                        removeStepFromOrder(order.id, idx);
                      }
                    }}
                    title="Bu Aşamayı Çıkar"
                  >
                    <Trash2 size={13} />
                  </button>
                  )}
                </div>
              </div>

              {/* AÇILIR 'İŞLEM HAKKINDA' ÇEKMECESİ */}
              {isInfoOpen && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-subtle)',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  {/* Başlık Düzenleme Modu */}
                  {isEditingThisTitle ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      <input
                        type="text"
                        className="dental-input"
                        style={{ fontWeight: 700, fontSize: '0.9rem' }}
                        value={editStepTitle}
                        onChange={e => setEditStepTitle(e.target.value)}
                      />
                      <input
                        type="text"
                        className="dental-input"
                        style={{ fontSize: '0.8rem' }}
                        value={editStepSubtitle}
                        onChange={e => setEditStepSubtitle(e.target.value)}
                        placeholder="Aşama açıklaması..."
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn-dental btn-dental-primary btn-dental-sm"
                          onClick={() => handleSaveStepTitle(idx)}
                        >
                          <Check size={12} />
                          <span>Kaydet</span>
                        </button>
                        <button
                          type="button"
                          className="btn-dental btn-dental-secondary btn-dental-sm"
                          onClick={() => setEditingStepIdx(null)}
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* 1. Aşama Teknik Açıklaması & Talimatlar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--dental-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        📋 İstasyon Talimatı & Detay:
                      </span>
                      {!isEditingThisTitle && !isLocked && (
                        <button
                          type="button"
                          className="btn-dental btn-dental-secondary btn-dental-sm"
                          style={{ padding: '2px 7px', fontSize: '0.72rem' }}
                          onClick={() => openEditStep(step, idx)}
                          title="Aşama Başlığı ve Talimatını Düzenle"
                        >
                          <Edit2 size={11} />
                          <span>Düzenle</span>
                        </button>
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-surface-elevated)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        lineHeight: 1.5
                      }}
                    >
                      {step.description || 'Bu aşama için özel bir klinik talimat girilmemiş.'}
                    </p>
                  </div>

                  {!isLocked && (
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      ✍️ Aşama Notu / Raporu:
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        className="dental-input"
                        style={{ flex: 1, fontSize: '0.82rem', padding: '6px 10px' }}
                        placeholder="Örn: 920 derecede sinterlendi, çatlak ve pürüz yok..."
                        value={curLocal.notes || ''}
                        onChange={(e) => handleFieldChange(idx, 'notes', e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-dental btn-dental-primary btn-dental-sm"
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleSaveStep(idx)}
                      >
                        Notu Kaydet
                      </button>
                    </div>
                  </div>
                  )}
                  {isLocked && step.notes && (
                    <div style={{ marginBottom: 10, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      ✍️ {step.notes}
                    </div>
                  )}

                  {/* 3. Zamanlama Bilgileri */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 6,
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      paddingTop: 8,
                      borderTop: '1px dashed var(--border-subtle)'
                    }}
                  >
                    <span>
                      {step.completedDate
                        ? `✓ Tamamlanma tarihi: ${step.completedDate}`
                        : (step.completedAt ? `✓ Tamamlanma Zamanı: ${step.completedAt}` : (step.startedAt ? `⚙️ Başlama Zamanı: ${step.startedAt}` : 'Henüz başlanmadı'))}
                    </span>
                    {!isLocked && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--dental-blue)', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => {
                        if (setIsTeamModalOpen) setIsTeamModalOpen(true);
                      }}
                    >
                      👥 Ekip / Teknisyen Ekle-Çıkar
                    </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {dateModal && (
        <StepDateModal
          title={dateModal.mode === 'toMdp' ? 'MDP işine geç' : 'Aşama tarihi'}
          subtitle={`"${dateModal.stepName || 'Bu aşama'}" için tarihi girin.`}
          confirmLabel={dateModal.mode === 'toMdp' ? 'MDP ye geç' : 'Kaydet ve ilerle'}
          onConfirm={confirmDateModal}
          onCancel={() => setDateModal(null)}
        />
      )}
    </div>
  );
};
