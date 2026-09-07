/**
 * DENTAL LAB PRO - Ana Uygulama Mantığı & Arayüz Kontrolcüsü
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Uygulama Nesnesi
  window.App = new DentalLabApp();
});

class DentalLabApp {
  constructor() {
    this.currentView = 'dashboard';
    this.modalOrderOdontogram = null;
    this.activeModalOrderId = null;
    this.activeSearchQuery = '';

    this.initTheme();
    this.initNavigation();
    this.initModals();
    this.initSearch();
    this.renderCurrentView();
  }

  // --- Tema Yönetimi ---
  initTheme() {
    const savedTheme = localStorage.getItem('dental_lab_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButton(savedTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('dental_lab_theme', next);
        this.updateThemeButton(next);
      });
    }
  }

  updateThemeButton(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    btn.innerHTML = theme === 'light' 
      ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
      : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>`;
  }

  // --- Navigasyon & Sayfa Değişimi ---
  initNavigation() {
    const navButtons = document.querySelectorAll('.nav-link-btn[data-view]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        this.switchView(targetView);
      });
    });

    // Mobil hamburger menü
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Demo Sıfırla ve Veri İçe/Dışa Aktarma Butonları
    const btnResetDemo = document.getElementById('btnResetDemo');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => {
        if (confirm('Tüm veriler varsayılan zengin demo verilerine sıfırlansın mı?')) {
          window.DentalDB.resetToDemo();
          this.showToast('Veriler başarıyla demo haline sıfırlandı.', 'success');
          this.renderCurrentView();
        }
      });
    }

    const btnExportData = document.getElementById('btnExportData');
    if (btnExportData) {
      btnExportData.addEventListener('click', () => {
        const json = window.DentalDB.exportDataJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dental_lab_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Yedek dosyası indirildi.', 'success');
      });
    }

    const btnImportData = document.getElementById('btnImportData');
    const importFileInput = document.getElementById('importFileInput');
    if (btnImportData && importFileInput) {
      btnImportData.addEventListener('click', () => importFileInput.click());
      importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const success = window.DentalDB.importDataJson(ev.target.result);
          if (success) {
            this.showToast('Veriler başarıyla yüklendi!', 'success');
            this.renderCurrentView();
          } else {
            this.showToast('Geçersiz yedek JSON dosyası!', 'error');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.nav-link-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${viewName}`);
    });

    // Mobil menü açıksa kapat
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    this.renderCurrentView();
  }

  // ==========================================================================
  // VIEW: DASHBOARD (Genel Bakış)
  // ==========================================================================
  renderDashboard() {
    const orders = window.DentalDB.getOrders();
    const companies = window.DentalDB.getCompanies();
    const doctors = window.DentalDB.getDoctors();
    const patients = window.DentalDB.getPatients();

    const activeOrders = orders.filter(o => o.status === 'in_progress');
    const completedOrders = orders.filter(o => o.status === 'completed');
    const urgentOrders = orders.filter(o => o.priority === 'urgent' && o.status !== 'completed');

    // KPI Kartları
    const kpiContainer = document.getElementById('dashboardKpis');
    if (kpiContainer) {
      kpiContainer.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-icon-box cyan">
            <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="kpi-info">
            <div class="kpi-label">Üretimdeki Aktif İşler</div>
            <div class="kpi-value">${activeOrders.length}</div>
            <div class="kpi-sub">Toplam ${orders.length} iş emri kaydı</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-box amber">
            <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path></svg>
          </div>
          <div class="kpi-info">
            <div class="kpi-label">Acil / VIP Siparişler</div>
            <div class="kpi-value" style="color: var(--status-urgent);">${urgentOrders.length}</div>
            <div class="kpi-sub">Öncelikli fırın ve teslimat</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-box emerald">
            <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"></path></svg>
          </div>
          <div class="kpi-info">
            <div class="kpi-label">Tamamlanan İşler</div>
            <div class="kpi-value">${completedOrders.length}</div>
            <div class="kpi-sub">Kliniklere sevk edilmiş</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-box rose">
            <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="kpi-info">
            <div class="kpi-label">Klinik & Hekim Ağı</div>
            <div class="kpi-value">${companies.length} / ${doctors.length}</div>
            <div class="kpi-sub">${patients.length} kayıtlı hasta</div>
          </div>
        </div>
      `;
    }

    // Dashboard Ek Analiz Kartları (Materyal Dağılımı & Teknisyen İş Dağılımı)
    const analyticsGrid = document.getElementById('dashboardAnalyticsGrid');
    if (analyticsGrid) {
      // Materyal sayıları
      const matCounts = {
        porcelain: orders.filter(o => o.materialId === 'porcelain').length,
        zirconia: orders.filter(o => o.materialId === 'zirconia').length,
        emax: orders.filter(o => o.materialId === 'emax').length,
        implant: orders.filter(o => o.materialId === 'implant').length
      };
      const totalOrders = orders.length || 1;

      // Teknisyenlerin üzerindeki aktif işler
      const techCounts = {};
      window.TECHNICIANS.forEach(t => techCounts[t] = 0);
      orders.forEach(o => {
        const cur = o.steps[o.currentStepIndex];
        if (cur && cur.technician) {
          techCounts[cur.technician] = (techCounts[cur.technician] || 0) + 1;
        }
      });

      analyticsGrid.innerHTML = `
        <div class="kpi-card" style="flex-direction: column; align-items: flex-start;">
          <div style="font-size: 1rem; font-weight: 700; margin-bottom: 12px; width: 100%; display: flex; justify-content: space-between;">
            <span>🔬 Materyal Üretim Payı</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${orders.length} Toplam</span>
          </div>

          <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                <span>Zirkonyum (CAD/CAM)</span>
                <strong>${matCounts.zirconia} (%${Math.round(matCounts.zirconia / totalOrders * 100)})</strong>
              </div>
              <div class="progress-mini"><div class="progress-mini-fill" style="width: ${matCounts.zirconia / totalOrders * 100}%; background: var(--accent-cyan);"></div></div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                <span>Porselen (PFM Seramik)</span>
                <strong>${matCounts.porcelain} (%${Math.round(matCounts.porcelain / totalOrders * 100)})</strong>
              </div>
              <div class="progress-mini"><div class="progress-mini-fill" style="width: ${matCounts.porcelain / totalOrders * 100}%; background: var(--mat-porcelain);"></div></div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                <span>İmplant Üstü Protez</span>
                <strong>${matCounts.implant} (%${Math.round(matCounts.implant / totalOrders * 100)})</strong>
              </div>
              <div class="progress-mini"><div class="progress-mini-fill" style="width: ${matCounts.implant / totalOrders * 100}%; background: var(--status-completed);"></div></div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                <span>E-Max Tam Seramik</span>
                <strong>${matCounts.emax} (%${Math.round(matCounts.emax / totalOrders * 100)})</strong>
              </div>
              <div class="progress-mini"><div class="progress-mini-fill" style="width: ${matCounts.emax / totalOrders * 100}%; background: var(--mat-emax);"></div></div>
            </div>
          </div>
        </div>

        <div class="kpi-card" style="flex-direction: column; align-items: flex-start;">
          <div style="font-size: 1rem; font-weight: 700; margin-bottom: 12px; width: 100%; display: flex; justify-content: space-between;">
            <span>👷 Teknisyen İş Dağılımı</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Anlık İstasyon Yükü</span>
          </div>

          <div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
            ${window.TECHNICIANS.slice(0, 4).map(t => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--bg-surface-elevated); border-radius: var(--radius-sm);">
                <span style="font-size: 0.82rem;">${t.split('(')[0]}</span>
                <span class="badge badge-inprogress" style="font-size: 0.72rem;">${techCounts[t] || 0} aktif iş</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Son Aktiviteler / Aktif Siparişler Tablosu
    const tableBody = document.getElementById('dashboardRecentOrders');
    if (tableBody) {
      const recent = [...orders].slice(0, 5);
      if (recent.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">Henüz sipariş kaydı yok.</td></tr>`;
      } else {
        tableBody.innerHTML = recent.map(o => this.renderOrderTableRow(o)).join('');
      }
    }
  }

  renderCurrentView() {
    this.updateBadges();

    switch (this.currentView) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'kanban':
        this.renderKanban();
        break;
      case 'orders':
        this.renderOrders();
        break;
      case 'companies':
        this.renderCompanies();
        break;
      case 'doctors':
        this.renderDoctors();
        break;
      case 'patients':
        this.renderPatients();
        break;
      case 'materials':
        this.renderMaterials();
        break;
    }
  }

  updateBadges() {
    const orders = window.DentalDB.getOrders();
    const activeCount = orders.filter(o => o.status === 'in_progress').length;
    const badgeEl = document.getElementById('activeOrdersBadge');
    if (badgeEl) badgeEl.innerText = activeCount;
  }

  // --- Arama ---
  initSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.activeSearchQuery = e.target.value.toLowerCase().trim();
        this.renderCurrentView();
      });
    }
  }



  // ==========================================================================
  // VIEW: KANBAN BOARD (Üretim Hattı)
  // ==========================================================================
  renderKanban() {
    const kanbanWrapper = document.getElementById('kanbanBoard');
    if (!kanbanWrapper) return;

    // Üretim Hattı Ana Kolon Grupları
    const columns = [
      { id: 'col-model', title: '1. Model & Hazırlık', filter: s => s.name.includes('Model') || s.name.includes('Tarama') },
      { id: 'col-cad', title: '2. Mum & CAD Dizayn', filter: s => s.name.includes('Mum') || s.name.includes('CAD') || s.name.includes('Dayanak') },
      { id: 'col-metal', title: '3. Altyapı & CAM Freze', filter: s => s.name.includes('Alt Yapı') || s.name.includes('Frezeleme') || s.name.includes('Presleme') || s.name.includes('Bar') },
      { id: 'col-build', title: '4. Katmanlama & Seramik', filter: s => s.name.includes('Katmanlama') || s.name.includes('Opak') || s.name.includes('Divestment') },
      { id: 'col-furnace', title: '5. Fırınlama & Sinter', filter: s => s.name.includes('Fırınlama') || s.name.includes('Sinterleme') || s.name.includes('Kristalizasyon') },
      { id: 'col-morph', title: '6. Morfoloji & Uyum', filter: s => s.name.includes('Morfoloji') || s.name.includes('Rötuş') || s.name.includes('Pasif Uyum') || s.name.includes('Vida') },
      { id: 'col-glaze', title: '7. Glaze, Renk & Cila', filter: s => s.name.includes('Glaze') || s.name.includes('Karakterizasyon') },
      { id: 'col-delivery', title: '8. Kalite & Sevkiyat', filter: s => s.name.includes('Kalite') || s.name.includes('Sevkiyat') }
    ];

    const orders = window.DentalDB.getOrders();

    let html = '';
    columns.forEach(col => {
      // Bu kolonda işlemde olan işleri bul
      const matchingOrders = orders.filter(o => {
        if (o.status === 'completed' && col.id !== 'col-delivery') return false;
        const curStep = o.steps[o.currentStepIndex];
        return curStep && col.filter(curStep);
      });

      html += `
        <div class="kanban-col" id="${col.id}">
          <div class="kanban-col-header">
            <div class="col-title-group">
              <strong style="font-size: 0.95rem;">${col.title}</strong>
              <span class="col-badge">${matchingOrders.length}</span>
            </div>
          </div>
          <div class="kanban-cards-area">
            ${matchingOrders.length === 0 
              ? `<div style="text-align:center; padding: 24px 0; color: var(--text-muted); font-size: 0.8rem;">Bu aşamada iş yok</div>`
              : matchingOrders.map(o => this.renderKanbanCard(o)).join('')
            }
          </div>
        </div>
      `;
    });

    kanbanWrapper.innerHTML = html;
  }

  renderKanbanCard(order) {
    const patient = window.DentalDB.getPatient(order.patientId);
    const doctor = window.DentalDB.getDoctor(order.doctorId);
    const company = window.DentalDB.getCompany(order.companyId);
    const curStep = order.steps[order.currentStepIndex];

    const completedSteps = order.steps.filter(s => s.status === 'completed').length;
    const progressPct = Math.round((completedSteps / order.steps.length) * 100);

    return `
      <div class="kanban-card" data-order-id="${order.id}" data-priority="${order.priority}" onclick="window.App.openOrderDetailModal('${order.id}')">
        <div class="card-top">
          <span class="card-code">${order.id}</span>
          <span class="badge ${order.status === 'completed' ? 'badge-completed' : (order.status === 'revision' ? 'badge-revision' : 'badge-inprogress')}">
            ${order.shade}
          </span>
        </div>
        <div class="card-patient">${patient ? patient.name : 'İsimsiz'}</div>
        <div class="card-doctor">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          ${doctor ? doctor.name : (company ? company.name : '-')}
        </div>

        <div class="card-teeth-badge">
          🦷 FDI: ${(order.teeth || []).join(', ') || '-'}
        </div>

        <div style="margin-top: 10px; font-size: 0.78rem; color: var(--text-secondary);">
          <strong style="color: var(--primary-light);">Adım:</strong> ${curStep ? curStep.name : 'Tamamlandı'}
        </div>

        <div class="progress-mini">
          <div class="progress-mini-fill" style="width: ${progressPct}%;"></div>
        </div>

        <div class="card-footer">
          <span>${curStep && curStep.technician ? curStep.technician.split(' ')[0] : 'Atanmadı'}</span>
          <span>📅 ${order.deliveryDate}</span>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW: ORDERS (İş Emirleri Listesi)
  // ==========================================================================
  renderOrders() {
    let orders = window.DentalDB.getOrders();

    // Filtreleme
    const filterMat = document.getElementById('filterOrderMaterial')?.value;
    const filterStatus = document.getElementById('filterOrderStatus')?.value;

    if (filterMat) orders = orders.filter(o => o.materialId === filterMat);
    if (filterStatus) orders = orders.filter(o => o.status === filterStatus);

    if (this.activeSearchQuery) {
      const q = this.activeSearchQuery;
      orders = orders.filter(o => {
        const p = window.DentalDB.getPatient(o.patientId);
        const d = window.DentalDB.getDoctor(o.doctorId);
        const c = window.DentalDB.getCompany(o.companyId);
        return o.id.toLowerCase().includes(q) ||
          (p && p.name.toLowerCase().includes(q)) ||
          (d && d.name.toLowerCase().includes(q)) ||
          (c && c.name.toLowerCase().includes(q)) ||
          (o.teeth && o.teeth.join(',').includes(q));
      });
    }

    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">Kayıtlı iş emri bulunamadı.</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders.map(o => this.renderOrderTableRow(o)).join('');
  }

  renderOrderTableRow(order) {
    const patient = window.DentalDB.getPatient(order.patientId);
    const doctor = window.DentalDB.getDoctor(order.doctorId);
    const company = window.DentalDB.getCompany(order.companyId);
    const matInfo = window.DEFAULT_MATERIAL_PIPELINES[order.materialId] || { name: order.materialId, badgeClass: 'badge-pending' };
    const curStep = order.steps[order.currentStepIndex];

    const completedSteps = order.steps.filter(s => s.status === 'completed').length;
    const progressPct = Math.round((completedSteps / order.steps.length) * 100);

    return `
      <tr>
        <td>
          <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--primary-light);">
            ${order.id}
          </span>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${order.orderDate}</div>
        </td>
        <td>
          <strong>${patient ? patient.name : '-'}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${patient ? patient.chartNumber : ''}</div>
        </td>
        <td>
          <div>${doctor ? doctor.name : '-'}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${company ? company.name : '-'}</div>
        </td>
        <td>
          <span class="badge ${matInfo.badgeClass || 'badge-pending'}">${matInfo.name.split('(')[0]}</span>
          <span class="badge" style="background: var(--bg-surface-elevated); margin-left: 4px; font-weight: bold;">
            ${order.shade}
          </span>
          <div style="font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; margin-top: 4px;">
            Dişler: ${(order.teeth || []).join(', ')}
          </div>
        </td>
        <td>
          <div style="font-size: 0.85rem; font-weight: 600;">${curStep ? curStep.name : 'Bitti'}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
            <div class="progress-mini" style="flex: 1; height: 5px; margin: 0;">
              <div class="progress-mini-fill" style="width: ${progressPct}%;"></div>
            </div>
            <span style="font-size: 0.75rem; font-family: 'JetBrains Mono', monospace;">%${progressPct}</span>
          </div>
        </td>
        <td>
          <div style="font-weight: 600; color: ${new Date(order.deliveryDate) < new Date() ? 'var(--status-urgent)' : 'inherit'};">
            ${order.deliveryDate}
          </div>
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted);">${order.priority}</div>
        </td>
        <td>
          <span class="badge badge-${order.status}">
            ${order.status === 'in_progress' ? 'İşlemde' : (order.status === 'completed' ? 'Tamamlandı' : order.status)}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm" onclick="window.App.openOrderDetailModal('${order.id}')" title="Aşama Takibi & Detay">
              Aşamalar ➔
            </button>
            <button class="btn btn-icon btn-sm" onclick="window.App.printOrderSlip('${order.id}')" title="Yazdır">
              🖨️
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // ==========================================================================
  // VIEW: COMPANIES (Firmalar / Klinikler)
  // ==========================================================================
  renderCompanies() {
    let list = window.DentalDB.getCompanies();
    if (this.activeSearchQuery) {
      list = list.filter(c => c.name.toLowerCase().includes(this.activeSearchQuery) || (c.contactPerson && c.contactPerson.toLowerCase().includes(this.activeSearchQuery)));
    }

    const container = document.getElementById('companiesGrid');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Kayıtlı klinik bulunamadı.</div>`;
      return;
    }

    container.innerHTML = list.map(c => {
      const docs = window.DentalDB.getDoctors(c.id);
      const orders = window.DentalDB.getOrders().filter(o => o.companyId === c.id);

      return `
        <div class="kpi-card" style="flex-direction: column; align-items: flex-start; gap: 14px;">
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <div style="font-size: 1.15rem; font-weight: 700;">${c.name}</div>
            <button class="btn btn-outline-danger btn-sm" onclick="window.App.deleteCompany('${c.id}')">Sil</button>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); width: 100%;">
            <div><strong>Yetkili:</strong> ${c.contactPerson || '-'}</div>
            <div><strong>Telefon:</strong> ${c.phone || '-'}</div>
            <div><strong>E-posta:</strong> ${c.email || '-'}</div>
            <div style="margin-top: 4px; font-size: 0.8rem; color: var(--text-muted);">${c.address || ''}</div>
          </div>
          <div style="display: flex; justify-content: space-between; width: 100%; border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 0.82rem;">
            <span>👨‍⚕️ <strong>${docs.length}</strong> Hekim</span>
            <span>📦 <strong>${orders.length}</strong> Sipariş</span>
            <span style="font-weight: 700; color: var(--accent-cyan); font-family: 'JetBrains Mono', monospace;">${(c.balance || 0).toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // VIEW: DOCTORS (Hekimler)
  // ==========================================================================
  renderDoctors() {
    let list = window.DentalDB.getDoctors();
    if (this.activeSearchQuery) {
      list = list.filter(d => d.name.toLowerCase().includes(this.activeSearchQuery) || (d.specialty && d.specialty.toLowerCase().includes(this.activeSearchQuery)));
    }

    const container = document.getElementById('doctorsGrid');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Kayıtlı hekim bulunamadı.</div>`;
      return;
    }

    container.innerHTML = list.map(d => {
      const comp = window.DentalDB.getCompany(d.companyId);
      const pats = window.DentalDB.getPatients(d.id);
      const orders = window.DentalDB.getOrders().filter(o => o.doctorId === d.id);

      return `
        <div class="kpi-card" style="flex-direction: column; align-items: flex-start; gap: 12px;">
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <div>
              <div style="font-size: 1.1rem; font-weight: 700;">${d.name}</div>
              <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600;">${d.specialty || 'Diş Hekimi'}</div>
            </div>
            <button class="btn btn-outline-danger btn-sm" onclick="window.App.deleteDoctor('${d.id}')">Sil</button>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            <div><strong>Klinik:</strong> ${comp ? comp.name : 'Bağımsız'}</div>
            <div><strong>Telefon:</strong> ${d.phone || '-'}</div>
            <div><strong>E-posta:</strong> ${d.email || '-'}</div>
          </div>
          <div style="display: flex; justify-content: space-between; width: 100%; border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 0.82rem;">
            <span>👥 ${pats.length} Hasta</span>
            <span>📦 ${orders.length} İş Emri</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // VIEW: PATIENTS (Hastalar)
  // ==========================================================================
  renderPatients() {
    let list = window.DentalDB.getPatients();
    if (this.activeSearchQuery) {
      list = list.filter(p => p.name.toLowerCase().includes(this.activeSearchQuery) || (p.chartNumber && p.chartNumber.toLowerCase().includes(this.activeSearchQuery)));
    }

    const container = document.getElementById('patientsGrid');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Kayıtlı hasta bulunamadı.</div>`;
      return;
    }

    container.innerHTML = list.map(p => {
      const doc = window.DentalDB.getDoctor(p.doctorId);
      const orders = window.DentalDB.getOrders().filter(o => o.patientId === p.id);

      return `
        <div class="kpi-card" style="flex-direction: column; align-items: flex-start; gap: 12px;">
          <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <div>
              <div style="font-size: 1.1rem; font-weight: 700;">${p.name}</div>
              <div style="font-size: 0.78rem; font-family: 'JetBrains Mono', monospace; color: var(--primary-light);">
                ${p.chartNumber || 'PROT-YOK'} • ${p.age} Yaş (${p.gender})
              </div>
            </div>
            <button class="btn btn-outline-danger btn-sm" onclick="window.App.deletePatient('${p.id}')">Sil</button>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            <div><strong>Hekim:</strong> ${doc ? doc.name : '-'}</div>
            ${p.notes ? `<div style="margin-top: 4px; font-size: 0.8rem; background: var(--bg-surface); padding: 6px 10px; border-radius: var(--radius-sm);">📝 ${p.notes}</div>` : ''}
          </div>
          <div style="display: flex; justify-content: space-between; width: 100%; border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 0.82rem;">
            <span>Geçmiş İşlemler: <strong>${orders.length}</strong></span>
            <button class="btn btn-secondary btn-sm" onclick="window.App.openNewOrderModalWithPatient('${p.id}')">+ Yeni İş Emri</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // VIEW: MATERIALS (Materyaller & Üretim Aşamaları Kılavuzu)
  // ==========================================================================
  renderMaterials() {
    const container = document.getElementById('materialsAccordion');
    if (!container) return;

    const materials = window.DEFAULT_MATERIAL_PIPELINES;
    let html = '';

    Object.values(materials).forEach(mat => {
      html += `
        <div class="kpi-card" style="flex-direction: column; align-items: flex-start; margin-bottom: 24px; padding: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="badge ${mat.badgeClass}" style="font-size: 0.95rem; padding: 6px 14px;">${mat.name}</span>
              <span style="font-size: 0.82rem; color: var(--text-muted);">${mat.steps.length} Üretim Aşaması</span>
            </div>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 18px;">${mat.description}</p>

          <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
            ${mat.steps.map(s => `
              <div style="padding: 12px 16px; background-color: var(--bg-surface-elevated); border-radius: var(--radius-md); border-left: 3px solid ${mat.color}; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <strong style="font-family: 'JetBrains Mono', monospace; color: ${mat.color};">${s.order}.</strong>
                  <div>
                    <strong style="font-size: 0.92rem;">${s.name}</strong>
                    <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">${s.description}</div>
                  </div>
                </div>
                <div style="text-align: right; flex-shrink: 0; font-size: 0.78rem; color: var(--text-muted);">
                  <div>👷 ${s.defaultTechnician}</div>
                  <div>⏳ Tahmini: ~${s.estimatedHours} saat</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ==========================================================================
  // MODAL VE FORM YÖNETİMİ
  // ==========================================================================
  initModals() {
    // Modal Kapatma Düğmeleri
    document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
        }
      });
    });

    // Yeni Sipariş Başlat Butonları
    document.querySelectorAll('.btn-open-new-order').forEach(btn => {
      btn.addEventListener('click', () => this.openNewOrderModal());
    });

    // Form: Yeni Sipariş
    const newOrderForm = document.getElementById('newOrderForm');
    if (newOrderForm) {
      newOrderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveNewOrder();
      });

      // Dinamik Firma -> Doktor -> Hasta Değişimi
      const selComp = document.getElementById('orderFormCompany');
      const selDoc = document.getElementById('orderFormDoctor');
      const selPat = document.getElementById('orderFormPatient');

      if (selComp) {
        selComp.addEventListener('change', () => {
          const compId = selComp.value;
          this.populateDoctorSelect(compId, selDoc);
          this.populatePatientSelect('', selPat);
        });
      }

      if (selDoc) {
        selDoc.addEventListener('change', () => {
          const docId = selDoc.value;
          this.populatePatientSelect(docId, selPat);
        });
      }
    }

    // Form: Firma Ekle
    const newCompanyForm = document.getElementById('newCompanyForm');
    if (newCompanyForm) {
      newCompanyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const comp = {
          name: document.getElementById('compName').value,
          contactPerson: document.getElementById('compContact').value,
          phone: document.getElementById('compPhone').value,
          email: document.getElementById('compEmail').value,
          address: document.getElementById('compAddress').value,
          balance: parseFloat(document.getElementById('compBalance').value) || 0
        };
        window.DentalDB.saveCompany(comp);
        document.getElementById('modalNewCompany').classList.remove('active');
        newCompanyForm.reset();
        this.showToast('Klinik başarıyla kaydedildi!', 'success');
        this.renderCurrentView();
      });
    }

    // Form: Doktor Ekle
    const newDoctorForm = document.getElementById('newDoctorForm');
    if (newDoctorForm) {
      newDoctorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const doc = {
          companyId: document.getElementById('docCompany').value,
          name: document.getElementById('docName').value,
          specialty: document.getElementById('docSpecialty').value,
          phone: document.getElementById('docPhone').value,
          email: document.getElementById('docEmail').value
        };
        window.DentalDB.saveDoctor(doc);
        document.getElementById('modalNewDoctor').classList.remove('active');
        newDoctorForm.reset();
        this.showToast('Hekim başarıyla eklendi!', 'success');
        this.renderCurrentView();
      });
    }

    // Form: Hasta Ekle
    const newPatientForm = document.getElementById('newPatientForm');
    if (newPatientForm) {
      newPatientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pat = {
          companyId: document.getElementById('patCompany').value,
          doctorId: document.getElementById('patDoctor').value,
          name: document.getElementById('patName').value,
          chartNumber: document.getElementById('patChart').value || ('PRT-' + Math.floor(1000 + Math.random() * 9000)),
          age: parseInt(document.getElementById('patAge').value, 10) || 30,
          gender: document.getElementById('patGender').value,
          notes: document.getElementById('patNotes').value
        };
        window.DentalDB.savePatient(pat);
        document.getElementById('modalNewPatient').classList.remove('active');
        newPatientForm.reset();
        this.showToast('Hasta başarıyla eklendi!', 'success');
        this.renderCurrentView();
      });
    }
  }

  // --- Yeni Sipariş Modalı Açılışı ---
  openNewOrderModal() {
    const modal = document.getElementById('modalNewOrder');
    if (!modal) return;

    // Firma listesini doldur
    const selComp = document.getElementById('orderFormCompany');
    const selDoc = document.getElementById('orderFormDoctor');
    const selPat = document.getElementById('orderFormPatient');
    const selShade = document.getElementById('orderFormShade');

    const companies = window.DentalDB.getCompanies();
    selComp.innerHTML = `<option value="">Klinik Seçin...</option>` + companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    selDoc.innerHTML = `<option value="">Önce Klinik Seçin...</option>`;
    selPat.innerHTML = `<option value="">Önce Hekim Seçin...</option>`;

    // VITA Renkleri doldur
    if (selShade) {
      selShade.innerHTML = window.VITA_SHADES.map(s => `<option value="${s}" ${s === 'A2' ? 'selected' : ''}>${s}</option>`).join('');
    }

    // Teslim ve Prova tarihleri varsayılan olarak 5 gün ve 3 gün sonrası
    const today = new Date();
    const trialDate = new Date(today);
    trialDate.setDate(today.getDate() + 3);
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5);

    document.getElementById('orderFormTrialDate').value = trialDate.toISOString().split('T')[0];
    document.getElementById('orderFormDeliveryDate').value = deliveryDate.toISOString().split('T')[0];

    // İnteraktif Odontogram oluştur
    this.modalOrderOdontogram = new window.Odontogram('newOrderOdontogramContainer', {
      initialSelected: ['11', '21'],
      onChange: (teeth) => {
        // İsteğe bağlı etkileşim
      }
    });

    modal.classList.add('active');
  }

  openNewOrderModalWithPatient(patientId) {
    const pat = window.DentalDB.getPatient(patientId);
    if (!pat) return;

    this.openNewOrderModal();

    const selComp = document.getElementById('orderFormCompany');
    const selDoc = document.getElementById('orderFormDoctor');
    const selPat = document.getElementById('orderFormPatient');

    if (selComp && pat.companyId) {
      selComp.value = pat.companyId;
      this.populateDoctorSelect(pat.companyId, selDoc);
    }
    if (selDoc && pat.doctorId) {
      selDoc.value = pat.doctorId;
      this.populatePatientSelect(pat.doctorId, selPat);
    }
    if (selPat) {
      selPat.value = pat.id;
    }
  }

  openNewDoctorModal() {
    const modal = document.getElementById('modalNewDoctor');
    const selComp = document.getElementById('docCompany');
    if (selComp) {
      const comps = window.DentalDB.getCompanies();
      selComp.innerHTML = comps.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
    if (modal) modal.classList.add('active');
  }

  openNewPatientModal() {
    const modal = document.getElementById('modalNewPatient');
    const patCompSel = document.getElementById('patCompany');
    const patDocSel = document.getElementById('patDoctor');
    if (patCompSel && patDocSel) {
      const comps = window.DentalDB.getCompanies();
      patCompSel.innerHTML = `<option value="">Klinik Seçin...</option>` + comps.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      patDocSel.innerHTML = `<option value="">Önce Klinik Seçin...</option>`;
      patCompSel.onchange = () => {
        const docs = window.DentalDB.getDoctors(patCompSel.value);
        patDocSel.innerHTML = `<option value="">Hekim Seçin...</option>` + docs.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
      };
    }
    if (modal) modal.classList.add('active');
  }

  populateDoctorSelect(companyId, selectEl) {
    if (!selectEl) return;
    const docs = window.DentalDB.getDoctors(companyId);
    selectEl.innerHTML = `<option value="">Hekim Seçin...</option>` + docs.map(d => `<option value="${d.id}">${d.name} (${d.specialty || 'Hekim'})</option>`).join('');
  }

  populatePatientSelect(doctorId, selectEl) {
    if (!selectEl) return;
    const pats = window.DentalDB.getPatients(doctorId);
    selectEl.innerHTML = `<option value="">Hasta Seçin...</option>` + pats.map(p => `<option value="${p.id}">${p.name} (#${p.chartNumber})</option>`).join('');
  }

  handleSaveNewOrder() {
    const compId = document.getElementById('orderFormCompany').value;
    const docId = document.getElementById('orderFormDoctor').value;
    const patId = document.getElementById('orderFormPatient').value;
    const matId = document.getElementById('orderFormMaterial').value;
    const shade = document.getElementById('orderFormShade').value;
    const priority = document.getElementById('orderFormPriority').value;
    const trialDate = document.getElementById('orderFormTrialDate').value;
    const deliveryDate = document.getElementById('orderFormDeliveryDate').value;
    const price = parseFloat(document.getElementById('orderFormPrice').value) || 0;
    const notes = document.getElementById('orderFormNotes').value;

    const selectedTeeth = this.modalOrderOdontogram ? this.modalOrderOdontogram.getSelectedTeeth() : [];

    if (!compId || !docId || !patId) {
      alert('Lütfen Klinik, Hekim ve Hasta alanlarını eksiksiz seçin.');
      return;
    }

    if (selectedTeeth.length === 0) {
      if (!confirm('Herhangi bir diş seçmediniz. Diş seçilmeden devam edilsin mi?')) {
        return;
      }
    }

    // Seçilen materyalin hazır adımlarını kopyala
    const matTemplate = window.DEFAULT_MATERIAL_PIPELINES[matId] || window.DEFAULT_MATERIAL_PIPELINES.porcelain;
    const steps = matTemplate.steps.map((s, index) => ({
      order: s.order,
      name: s.name,
      description: s.description,
      status: index === 0 ? 'in_progress' : 'pending',
      technician: s.defaultTechnician,
      startedAt: index === 0 ? new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : null,
      notes: ''
    }));

    const newOrder = {
      companyId: compId,
      doctorId: docId,
      patientId: patId,
      materialId: matId,
      teeth: selectedTeeth,
      shade: shade,
      priority: priority,
      status: 'in_progress',
      orderDate: new Date().toISOString().split('T')[0],
      trialDate: trialDate,
      deliveryDate: deliveryDate,
      price: price,
      notes: notes,
      currentStepIndex: 0,
      steps: steps
    };

    const saved = window.DentalDB.saveOrder(newOrder);
    document.getElementById('modalNewOrder').classList.remove('active');
    document.getElementById('newOrderForm').reset();

    this.showToast(`Yeni iş emri (#${saved.id}) başarıyla oluşturuldu ve üretim hattına alındı!`, 'success');
    this.renderCurrentView();

    // Hemen detayını ve aşama stepper'ını aç
    setTimeout(() => {
      this.openOrderDetailModal(saved.id);
    }, 400);
  }

  // --- İŞ EMRİ DETAY & AŞAMA TAKİP MODALI ---
  openOrderDetailModal(orderId) {
    this.activeModalOrderId = orderId;
    const modal = document.getElementById('modalOrderDetail');
    if (!modal) return;

    const order = window.DentalDB.getOrder(orderId);
    if (!order) return;

    const patient = window.DentalDB.getPatient(order.patientId);
    const doctor = window.DentalDB.getDoctor(order.doctorId);
    const company = window.DentalDB.getCompany(order.companyId);
    const matInfo = window.DEFAULT_MATERIAL_PIPELINES[order.materialId] || { name: order.materialId };

    document.getElementById('detailOrderTitle').innerHTML = `
      <span>İş Emri: <strong style="color: var(--primary-light);">${order.id}</strong></span>
      <span class="badge ${matInfo.badgeClass || 'badge-pending'}" style="margin-left: 10px;">${matInfo.name}</span>
    `;

    document.getElementById('detailOrderMeta').innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; padding: 14px; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 20px; font-size: 0.85rem;">
        <div><strong>Hasta:</strong> ${patient ? patient.name : '-'} (${patient ? patient.chartNumber : '-'})</div>
        <div><strong>Hekim:</strong> ${doctor ? doctor.name : '-'}</div>
        <div><strong>Klinik:</strong> ${company ? company.name : '-'}</div>
        <div><strong>VITA Rengi:</strong> <span style="font-weight: 800; color: var(--accent-cyan); font-size: 1rem;">${order.shade}</span></div>
        <div><strong>İşlem Dişleri:</strong> <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--primary-light);">${(order.teeth || []).join(', ') || '-'}</span></div>
        <div><strong>Teslim Tarihi:</strong> <span style="color: var(--status-urgent); font-weight: 700;">${order.deliveryDate}</span></div>
      </div>
    `;

    // Steppers Render
    const stepperContainer = document.getElementById('detailOrderSteps');
    stepperContainer.innerHTML = window.PipelineEngine.renderOrderSteps(order);

    // Stepper Butonlarını Dinle
    this.bindStepEvents(orderId);

    modal.classList.add('active');
  }

  bindStepEvents(orderId) {
    const container = document.getElementById('detailOrderSteps');
    if (!container) return;

    // Tek tıkla "Bu Aşamayı Tamamla"
    container.querySelectorAll('.btn-quick-complete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stepIdx = parseInt(e.currentTarget.getAttribute('data-step-index'), 10);
        const card = container.querySelector(`.step-card[data-step-index="${stepIdx}"]`);
        const tech = card.querySelector('.step-tech-select').value;
        const note = card.querySelector('.step-notes-input').value;

        window.DentalDB.updateStepStatus(orderId, stepIdx, 'completed', tech, note);
        this.showToast(`${stepIdx + 1}. Aşama başarıyla onaylandı ve tamamlandı!`, 'success');
        this.openOrderDetailModal(orderId); // UI yenile
        this.renderCurrentView();
      });
    });

    // "Güncelle" butonu
    container.querySelectorAll('.btn-save-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stepIdx = parseInt(e.currentTarget.getAttribute('data-step-index'), 10);
        const card = container.querySelector(`.step-card[data-step-index="${stepIdx}"]`);
        const tech = card.querySelector('.step-tech-select').value;
        const status = card.querySelector('.step-status-select').value;
        const note = card.querySelector('.step-notes-input').value;

        window.DentalDB.updateStepStatus(orderId, stepIdx, status, tech, note);
        this.showToast('Aşama bilgileri güncellendi.', 'success');
        this.openOrderDetailModal(orderId);
        this.renderCurrentView();
      });
    });
  }

  // --- İŞ EMRİ FİŞİ YAZDIRMA ---
  printOrderSlip(orderId) {
    const order = window.DentalDB.getOrder(orderId);
    if (!order) return;

    const company = window.DentalDB.getCompany(order.companyId);
    const doctor = window.DentalDB.getDoctor(order.doctorId);
    const patient = window.DentalDB.getPatient(order.patientId);

    const printArea = document.getElementById('printArea');
    if (!printArea) return;

    printArea.innerHTML = window.PipelineEngine.generatePrintSlip(order, company, doctor, patient);

    window.print();
  }

  // --- SİLME İŞLEMLERİ ---
  deleteCompany(id) {
    if (confirm('Bu kliniği ve kayıtlarını silmek istediğinize emin misiniz?')) {
      window.DentalDB.deleteCompany(id);
      this.showToast('Klinik silindi.', 'warning');
      this.renderCurrentView();
    }
  }

  deleteDoctor(id) {
    if (confirm('Bu doktor kaydını silmek istediğinize emin misiniz?')) {
      window.DentalDB.deleteDoctor(id);
      this.showToast('Hekim silindi.', 'warning');
      this.renderCurrentView();
    }
  }

  deletePatient(id) {
    if (confirm('Bu hasta kaydını silmek istediğinize emin misiniz?')) {
      window.DentalDB.deletePatient(id);
      this.showToast('Hasta kaydı silindi.', 'warning');
      this.renderCurrentView();
    }
  }

  // --- TOAST BİLDİRİMLERİ ---
  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : (type === 'warning' ? '⚠️' : (type === 'error' ? '✕' : 'ℹ'))}</span>
      <div>${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
}
