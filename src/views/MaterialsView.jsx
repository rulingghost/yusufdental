import React from 'react';
import { useDental } from '../context/DentalContext';
import { Sparkles, Clock, User } from 'lucide-react';

export const MaterialsView = () => {
  const { materials } = useDental();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Dental Materyal & Üretim Aşamaları Rehberi
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Porselen, Zirkonyum, E-Max ve İmplant sistemlerinin detaylı laboratuvar iş akış şablonları
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {Object.values(materials).map(mat => (
          <div key={mat.id} className="dental-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`badge-pill ${mat.badgeClass}`} style={{ fontSize: '1rem', padding: '6px 14px' }}>
                  {mat.name}
                </span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {mat.steps.length} Üretim Aşaması
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              {mat.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mat.steps.map(step => (
                <div
                  key={step.order}
                  style={{
                    padding: '14px 18px',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid ${mat.color}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--bg-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontFamily: 'JetBrains Mono',
                        color: mat.color,
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {step.order}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{step.name}</div>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {step.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} />
                      <span>{step.defaultTechnician}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} />
                      <span>~{step.estimatedHours} saat</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
