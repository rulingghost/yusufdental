/**
 * DENTAL LAB PRO - İnteraktif FDI Diş Şeması (Odontogram)
 * Uluslararası 2 haneli FDI numaralandırma ve anatomik vektörel diş seçimi
 */

class Odontogram {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = Object.assign({
      readOnly: false,
      initialSelected: [],
      onChange: () => {}
    }, options);

    this.selectedTeeth = new Set(this.options.initialSelected);
    this.init();
  }

  // FDI Diş Grupları
  static TEETH_MAP = {
    // Üst Çene (Maksilla)
    upperRight: ['18', '17', '16', '15', '14', '13', '12', '11'],
    upperLeft:  ['21', '22', '23', '24', '25', '26', '27', '28'],
    // Alt Çene (Mandibula)
    lowerRight: ['48', '47', '46', '45', '44', '43', '42', '41'],
    lowerLeft:  ['31', '32', '33', '34', '35', '36', '37', '38']
  };

  // Diş Anatomik Tipini Belirleme (SVG şekli için)
  static getToothType(number) {
    const lastDigit = parseInt(number.toString().slice(-1), 10);
    if (lastDigit === 1 || lastDigit === 2) return 'incisor'; // Kesici
    if (lastDigit === 3) return 'canine';                     // Köpek dişi
    if (lastDigit === 4 || lastDigit === 5) return 'premolar';// Küçük azı
    return 'molar';                                           // Büyük azı (6, 7, 8)
  }

  // Diş Tipine Göre Anatomik SVG İkonu
  static getToothSvg(type, isUpper = true) {
    // Döndürme: Üst çene ve alt çene kök yönleri
    const transform = isUpper ? '' : 'transform="rotate(180 12 16)"';

    if (type === 'incisor') {
      return `
        <svg viewBox="0 0 24 32" class="tooth-icon-svg" ${transform}>
          <path d="M7 4 C8 2, 16 2, 17 4 C18 10, 19 18, 18 27 C18 29, 6 29, 6 27 C5 18, 6 10, 7 4 Z" />
          <path d="M8 26 L16 26" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" fill="none" />
        </svg>
      `;
    } else if (type === 'canine') {
      return `
        <svg viewBox="0 0 24 32" class="tooth-icon-svg" ${transform}>
          <path d="M7 6 C10 1, 14 1, 17 6 C19 14, 18 22, 17 28 C12 31, 12 31, 7 28 C6 22, 5 14, 7 6 Z" />
          <circle cx="12" cy="18" r="1.5" fill="rgba(255,255,255,0.3)" />
        </svg>
      `;
    } else if (type === 'premolar') {
      return `
        <svg viewBox="0 0 24 32" class="tooth-icon-svg" ${transform}>
          <path d="M5 6 C8 2, 16 2, 19 6 C20 13, 20 20, 18 27 C15 29, 9 29, 6 27 C4 20, 4 13, 5 6 Z" />
          <path d="M8 20 C12 18, 12 18, 16 20" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" fill="none" />
        </svg>
      `;
    } else { // molar
      return `
        <svg viewBox="0 0 24 32" class="tooth-icon-svg" ${transform}>
          <path d="M4 8 C6 2, 18 2, 20 8 C21 16, 21 21, 19 28 C16 30, 8 30, 5 28 C3 21, 3 16, 4 8 Z" />
          <path d="M8 22 C12 20, 12 20, 16 22" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" fill="none" />
          <path d="M12 16 L12 24" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" fill="none" />
        </svg>
      `;
    }
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  render() {
    let html = `
      <div class="odontogram-wrapper">
        ${!this.options.readOnly ? `
        <div class="odontogram-header">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
            Hızlı Bölge Seçimi:
          </span>
          <div class="odontogram-quick-btns">
            <button type="button" class="btn btn-secondary btn-sm" data-action="all">Tüm Çene</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="upper">Üst Çene</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="lower">Alt Çene</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="anterior">Ön Bölge (Anterior)</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="posterior">Arka Bölge</button>
            <button type="button" class="btn btn-outline-danger btn-sm" data-action="clear">Temizle</button>
          </div>
        </div>
        ` : ''}

        <!-- ÜST ÇENE (MAKSİLLA) -->
        <div class="jaw-section">
          <div class="jaw-title">ÜST ÇENE (MAKSİLLA)</div>
          <div class="teeth-row">
            <!-- 1. Kadran (Üst Sağ) -->
            <div class="tooth-quadrant divider-right">
              ${Odontogram.TEETH_MAP.upperRight.map(num => this.renderToothItem(num, true)).join('')}
            </div>
            <!-- 2. Kadran (Üst Sol) -->
            <div class="tooth-quadrant">
              ${Odontogram.TEETH_MAP.upperLeft.map(num => this.renderToothItem(num, true)).join('')}
            </div>
          </div>
        </div>

        <!-- ALT ÇENE (MANDİBULA) -->
        <div class="jaw-section" style="margin-bottom: 0;">
          <div class="teeth-row">
            <!-- 4. Kadran (Alt Sağ) -->
            <div class="tooth-quadrant divider-right">
              ${Odontogram.TEETH_MAP.lowerRight.map(num => this.renderToothItem(num, false)).join('')}
            </div>
            <!-- 3. Kadran (Alt Sol) -->
            <div class="tooth-quadrant">
              ${Odontogram.TEETH_MAP.lowerLeft.map(num => this.renderToothItem(num, false)).join('')}
            </div>
          </div>
          <div class="jaw-title" style="margin-top: 12px; margin-bottom: 0;">ALT ÇENE (MANDİBULA)</div>
        </div>

        <!-- SEÇİLİ DİŞLER ÖZETİ -->
        <div class="selected-teeth-summary">
          <div style="font-size: 0.85rem; font-weight: 600;">
            İşlem Yapılacak Dişler (${this.selectedTeeth.size} adet):
          </div>
          <div class="selected-pills-list">
            ${this.renderSelectedPills()}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderToothItem(num, isUpper) {
    const isSelected = this.selectedTeeth.has(num.toString());
    const type = Odontogram.getToothType(num);
    const svg = Odontogram.getToothSvg(type, isUpper);

    return `
      <div class="tooth-item ${isSelected ? 'selected' : ''}" data-tooth="${num}">
        ${svg}
        <span class="tooth-number">${num}</span>
      </div>
    `;
  }

  renderSelectedPills() {
    if (this.selectedTeeth.size === 0) {
      return `<span style="color: var(--text-muted); font-size: 0.8rem;">Henüz diş seçilmedi</span>`;
    }
    const sorted = Array.from(this.selectedTeeth).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    return sorted.map(t => `<span class="selected-pill">#${t}</span>`).join('');
  }

  bindEvents() {
    // Tıklama ile diş seçimi
    this.container.querySelectorAll('.tooth-item').forEach(el => {
      el.addEventListener('click', () => {
        if (this.options.readOnly) return;
        const toothNum = el.getAttribute('data-tooth');
        this.toggleTooth(toothNum);
      });
    });

    // Hızlı seçim butonları
    this.container.querySelectorAll('.odontogram-quick-btns button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        this.handleQuickAction(action);
      });
    });
  }

  toggleTooth(toothNum) {
    if (this.selectedTeeth.has(toothNum)) {
      this.selectedTeeth.delete(toothNum);
    } else {
      this.selectedTeeth.add(toothNum);
    }
    this.updateUI();
    this.options.onChange(Array.from(this.selectedTeeth));
  }

  handleQuickAction(action) {
    const allUpper = [...Odontogram.TEETH_MAP.upperRight, ...Odontogram.TEETH_MAP.upperLeft];
    const allLower = [...Odontogram.TEETH_MAP.lowerRight, ...Odontogram.TEETH_MAP.lowerLeft];
    const anterior = ['13', '12', '11', '21', '22', '23', '43', '42', '41', '31', '32', '33'];

    if (action === 'all') {
      [...allUpper, ...allLower].forEach(t => this.selectedTeeth.add(t));
    } else if (action === 'upper') {
      allUpper.forEach(t => this.selectedTeeth.add(t));
    } else if (action === 'lower') {
      allLower.forEach(t => this.selectedTeeth.add(t));
    } else if (action === 'anterior') {
      anterior.forEach(t => this.selectedTeeth.add(t));
    } else if (action === 'posterior') {
      [...allUpper, ...allLower].forEach(t => {
        if (!anterior.includes(t)) this.selectedTeeth.add(t);
      });
    } else if (action === 'clear') {
      this.selectedTeeth.clear();
    }

    this.updateUI();
    this.options.onChange(Array.from(this.selectedTeeth));
  }

  updateUI() {
    this.container.querySelectorAll('.tooth-item').forEach(el => {
      const num = el.getAttribute('data-tooth');
      if (this.selectedTeeth.has(num)) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });

    const summaryList = this.container.querySelector('.selected-pills-list');
    if (summaryList) {
      summaryList.innerHTML = this.renderSelectedPills();
    }

    const titleCount = this.container.querySelector('.selected-teeth-summary div');
    if (titleCount) {
      titleCount.innerText = `İşlem Yapılacak Dişler (${this.selectedTeeth.size} adet):`;
    }
  }

  getSelectedTeeth() {
    return Array.from(this.selectedTeeth);
  }

  setSelectedTeeth(teethArray) {
    this.selectedTeeth = new Set(teethArray.map(t => t.toString()));
    this.updateUI();
  }
}

window.Odontogram = Odontogram;
