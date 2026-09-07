import React from 'react';

const TEETH_MAP = {
  upperRight: ['18', '17', '16', '15', '14', '13', '12', '11'],
  upperLeft:  ['21', '22', '23', '24', '25', '26', '27', '28'],
  lowerRight: ['48', '47', '46', '45', '44', '43', '42', '41'],
  lowerLeft:  ['31', '32', '33', '34', '35', '36', '37', '38']
};

const getToothType = (number) => {
  const last = parseInt(number.toString().slice(-1), 10);
  if (last === 1 || last === 2) return 'incisor';
  if (last === 3) return 'canine';
  if (last === 4 || last === 5) return 'premolar';
  return 'molar';
};

const ToothSvg = ({ type, isUpper }) => {
  const transform = isUpper ? '' : 'rotate(180 12 16)';

  if (type === 'incisor') {
    return (
      <svg viewBox="0 0 24 32" transform={transform}>
        <path d="M7 4 C8 2, 16 2, 17 4 C18 10, 19 18, 18 27 C18 29, 6 29, 6 27 C5 18, 6 10, 7 4 Z" />
        <path d="M8 26 L16 26" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
      </svg>
    );
  } else if (type === 'canine') {
    return (
      <svg viewBox="0 0 24 32" transform={transform}>
        <path d="M7 6 C10 1, 14 1, 17 6 C19 14, 18 22, 17 28 C12 31, 12 31, 7 28 C6 22, 5 14, 7 6 Z" />
        <circle cx="12" cy="18" r="1.5" fill="rgba(255,255,255,0.3)" />
      </svg>
    );
  } else if (type === 'premolar') {
    return (
      <svg viewBox="0 0 24 32" transform={transform}>
        <path d="M5 6 C8 2, 16 2, 19 6 C20 13, 20 20, 18 27 C15 29, 9 29, 6 27 C4 20, 4 13, 5 6 Z" />
        <path d="M8 20 C12 18, 12 18, 16 20" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 32" transform={transform}>
      <path d="M4 8 C6 2, 18 2, 20 8 C21 16, 21 21, 19 28 C16 30, 8 30, 5 28 C3 21, 3 16, 4 8 Z" />
      <path d="M8 22 C12 20, 12 20, 16 22" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
      <path d="M12 16 L12 24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
    </svg>
  );
};

export const Odontogram = ({ selectedTeeth = [], onChange = () => {}, readOnly = false }) => {
  const isSelected = (toothNum) => selectedTeeth.includes(toothNum.toString());

  const toggleTooth = (toothNum) => {
    if (readOnly) return;
    const str = toothNum.toString();
    if (isSelected(str)) {
      onChange(selectedTeeth.filter(t => t !== str));
    } else {
      onChange([...selectedTeeth, str]);
    }
  };

  const handleQuickAction = (action) => {
    if (readOnly) return;
    const allUpper = [...TEETH_MAP.upperRight, ...TEETH_MAP.upperLeft];
    const allLower = [...TEETH_MAP.lowerRight, ...TEETH_MAP.lowerLeft];
    const anterior = ['13', '12', '11', '21', '22', '23', '43', '42', '41', '31', '32', '33'];

    if (action === 'all') {
      onChange([...allUpper, ...allLower]);
    } else if (action === 'upper') {
      onChange(Array.from(new Set([...selectedTeeth, ...allUpper])));
    } else if (action === 'lower') {
      onChange(Array.from(new Set([...selectedTeeth, ...allLower])));
    } else if (action === 'anterior') {
      onChange(Array.from(new Set([...selectedTeeth, ...anterior])));
    } else if (action === 'posterior') {
      const posterior = [...allUpper, ...allLower].filter(t => !anterior.includes(t));
      onChange(Array.from(new Set([...selectedTeeth, ...posterior])));
    } else if (action === 'clear') {
      onChange([]);
    }
  };

  return (
    <div className="odontogram-panel">
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Hızlı Bölge Seçiciler:
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button type="button" className="btn-dental btn-dental-secondary btn-dental-sm" onClick={() => handleQuickAction('all')}>Tüm Çene</button>
            <button type="button" className="btn-dental btn-dental-secondary btn-dental-sm" onClick={() => handleQuickAction('upper')}>Üst Çene</button>
            <button type="button" className="btn-dental btn-dental-secondary btn-dental-sm" onClick={() => handleQuickAction('lower')}>Alt Çene</button>
            <button type="button" className="btn-dental btn-dental-secondary btn-dental-sm" onClick={() => handleQuickAction('anterior')}>Ön Bölge</button>
            <button type="button" className="btn-dental btn-dental-secondary btn-dental-sm" onClick={() => handleQuickAction('posterior')}>Arka Bölge</button>
            <button type="button" className="btn-dental btn-dental-danger btn-dental-sm" onClick={() => handleQuickAction('clear')}>Temizle</button>
          </div>
        </div>
      )}

      {/* ÜST ÇENE (MAKSİLLA) */}
      <div className="jaw-block">
        <div className="jaw-badge-title">ÜST ÇENE (MAKSİLLA)</div>
        <div className="teeth-grid-row">
          <div className="quadrant-set right-border">
            {TEETH_MAP.upperRight.map(num => (
              <div
                key={num}
                className={`tooth-unit ${isSelected(num) ? 'is-active' : ''}`}
                onClick={() => toggleTooth(num)}
              >
                <ToothSvg type={getToothType(num)} isUpper={true} />
                <span className="tooth-id">{num}</span>
              </div>
            ))}
          </div>
          <div className="quadrant-set">
            {TEETH_MAP.upperLeft.map(num => (
              <div
                key={num}
                className={`tooth-unit ${isSelected(num) ? 'is-active' : ''}`}
                onClick={() => toggleTooth(num)}
              >
                <ToothSvg type={getToothType(num)} isUpper={true} />
                <span className="tooth-id">{num}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ALT ÇENE (MANDİBULA) */}
      <div className="jaw-block" style={{ marginBottom: 0 }}>
        <div className="teeth-grid-row">
          <div className="quadrant-set right-border">
            {TEETH_MAP.lowerRight.map(num => (
              <div
                key={num}
                className={`tooth-unit ${isSelected(num) ? 'is-active' : ''}`}
                onClick={() => toggleTooth(num)}
              >
                <ToothSvg type={getToothType(num)} isUpper={false} />
                <span className="tooth-id">{num}</span>
              </div>
            ))}
          </div>
          <div className="quadrant-set">
            {TEETH_MAP.lowerLeft.map(num => (
              <div
                key={num}
                className={`tooth-unit ${isSelected(num) ? 'is-active' : ''}`}
                onClick={() => toggleTooth(num)}
              >
                <ToothSvg type={getToothType(num)} isUpper={false} />
                <span className="tooth-id">{num}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="jaw-badge-title" style={{ marginTop: 10, marginBottom: 0 }}>ALT ÇENE (MANDİBULA)</div>
      </div>

      {/* SEÇİLİ DİŞLER ÖZETİ */}
      <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, border: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          Seçilen Dişler ({selectedTeeth.length} Adet):
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {selectedTeeth.length === 0 ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Henüz diş seçilmedi</span>
          ) : (
            selectedTeeth
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(t => (
                <span
                  key={t}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.78rem'
                  }}
                >
                  #{t}
                </span>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
