import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { Sparkles, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';

export const MaterialsView = () => {
  const { materials } = useDental();
  // İlk materyal açık başlasın, diğerleri derli toplu olsun
  const [expandedMatIds, setExpandedMatIds] = useState(() => ({
    [Object.keys(materials)[0] || 'porcelain']: true
  }));

  const toggleExpand = (id) => {
    setExpandedMatIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.values(materials).map(mat => {
          const isExpanded = !!expandedMatIds[mat.id];
          const totalHours = (mat.steps || []).reduce((acc, s) => acc + (s.estimatedHours || 0), 0);

          return (
            <div
              key={mat.id}
              className={`dental-card ${isExpanded ? 'is-expanded' : ''}`}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease', padding: isExpanded ? '20px' : '16px 20px' }}
              onClick={() => toggleExpand(mat.id)}
              title="Aşamaları görmek / kapatmak için tıklayın"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge-pill ${mat.badgeClass}`} style={{ fontSize: '0.95rem', padding: '5px 12px' }}>
                    {mat.name}
                  </span>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    {mat.steps.length} Üretim Aşaması • ~{totalHours} Saat
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="card-toggle-pill">
                    {isExpanded ? 'Aşamaları Gizle' : 'Aşamaları İncele'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 10, marginBottom: isExpanded ? 16 : 0, lineHeight: 1.5 }}>
                {mat.description}
              </p>

              {isExpanded && (
                <div
                  className="job-card-details-drawer"
                  onClick={e => e.stopPropagation()}
                  style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}
                >
                  {mat.steps.map(step => (
                    <div
                      key={step.order}
                      style={{
                        padding: '12px 16px',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: 'var(--bg-surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontFamily: 'JetBrains Mono',
                            fontSize: '0.85rem',
                            color: mat.color,
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {step.order}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{step.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {step.description}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <User size={13} />
                          <span>{step.defaultTechnician}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={13} />
                          <span>~{step.estimatedHours} saat</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
