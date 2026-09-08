import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const todayIso = () => new Date().toISOString().split('T')[0];

export const StepDateModal = ({
  title = 'Aşama tarihi',
  subtitle = 'Bu aşamanın tamamlandığı tarihi seçin.',
  confirmLabel = 'Kaydet ve ilerle',
  onConfirm,
  onCancel
}) => {
  const [date, setDate] = useState(todayIso);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'var(--status-inprogress-bg)',
              color: 'var(--dental-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{title}</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{subtitle}</span>
            </div>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!date) return;
            onConfirm(date);
          }}
        >
          <div className="modal-dialog-body">
            <div className="form-item">
              <label>Tarih *</label>
              <input
                type="date"
                className="dental-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
          <div className="modal-dialog-footer">
            <button type="button" className="btn-dental btn-dental-secondary" onClick={onCancel}>
              Vazgeç
            </button>
            <button type="submit" className="btn-dental btn-dental-primary">
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
