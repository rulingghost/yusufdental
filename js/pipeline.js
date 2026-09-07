/**
 * DENTAL LAB PRO - Üretim Aşamaları Motoru & Yazdırma Servisi
 */

class PipelineEngine {
  /**
   * Sipariş için detaylı Aşama Takip Listesini (Steppers) HTML olarak oluşturur
   */
  static renderOrderSteps(order, onUpdateCallback) {
    if (!order || !order.steps) return '<p>Aşama bilgisi bulunamadı.</p>';

    const completedCount = order.steps.filter(s => s.status === 'completed').length;
    const progressPct = Math.round((completedCount / order.steps.length) * 100);

    let html = `
      <div class="pipeline-header-bar" style="margin-bottom: 20px; padding: 16px; background-color: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">Genel Üretim Durumu:</span>
            <strong style="margin-left: 8px; font-size: 1rem; color: var(--primary-light);">
              ${completedCount} / ${order.steps.length} Aşama Tamamlandı
            </strong>
          </div>
          <span style="font-size: 1.1rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--accent-cyan);">
            %${progressPct}
          </span>
        </div>
        <div class="progress-mini" style="height: 8px;">
          <div class="progress-mini-fill" style="width: ${progressPct}%;"></div>
        </div>
      </div>

      <div class="pipeline-stepper-container">
    `;

    order.steps.forEach((step, index) => {
      const isCurrent = order.currentStepIndex === index;
      const statusClass = step.status; // 'pending', 'in_progress', 'completed', 'revision'

      let statusBadge = `<span class="badge badge-pending">Bekliyor</span>`;
      if (step.status === 'in_progress') {
        statusBadge = `<span class="badge badge-inprogress">İşlemde ⚙️</span>`;
      } else if (step.status === 'completed') {
        statusBadge = `<span class="badge badge-completed">Tamamlandı ✓</span>`;
      } else if (step.status === 'revision') {
        statusBadge = `<span class="badge badge-revision">Revizyon ⚠️</span>`;
      }

      html += `
        <div class="step-card ${statusClass} ${isCurrent ? 'current-active' : ''}" data-step-index="${index}">
          <div class="step-header">
            <div class="step-title-box">
              <div class="step-order-badge">${step.order}</div>
              <div>
                <div class="step-name">${step.name}</div>
                <div class="step-desc">${step.description}</div>
              </div>
            </div>
            <div>
              ${statusBadge}
            </div>
          </div>

          <div class="step-body">
            <div>
              <label style="font-size: 0.75rem; color: var(--text-muted); display: block;">Sorumlu Teknisyen:</label>
              <select class="form-control form-control-sm step-tech-select" style="margin-top: 4px; padding: 6px 10px; font-size: 0.82rem;">
                <option value="">Teknisyen Seçin</option>
                ${window.TECHNICIANS.map(t => `<option value="${t}" ${step.technician === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size: 0.75rem; color: var(--text-muted); display: block;">Aşama Durumu:</label>
              <select class="form-control form-control-sm step-status-select" style="margin-top: 4px; padding: 6px 10px; font-size: 0.82rem;">
                <option value="pending" ${step.status === 'pending' ? 'selected' : ''}>Bekliyor</option>
                <option value="in_progress" ${step.status === 'in_progress' ? 'selected' : ''}>İşleme Al (İşlemde)</option>
                <option value="completed" ${step.status === 'completed' ? 'selected' : ''}>Tamamlandı</option>
                <option value="revision" ${step.status === 'revision' ? 'selected' : ''}>Revizyon İste</option>
              </select>
            </div>

            <div style="grid-column: 1 / -1;">
              <label style="font-size: 0.75rem; color: var(--text-muted); display: block;">Aşama Notu / İşlem Özeti:</label>
              <input type="text" class="form-control form-control-sm step-notes-input" value="${step.notes || ''}" placeholder="Örn: 920 derecede sinterlendi, çatlak yok..." style="margin-top: 4px; padding: 6px 10px; font-size: 0.82rem;">
            </div>
          </div>

          <div class="step-actions-row" style="margin-top: 12px; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">
              ${step.completedAt ? `Tamamlanma: ${step.completedAt}` : (step.startedAt ? `Başlama: ${step.startedAt}` : 'Henüz başlanmadı')}
            </div>

            <div style="display: flex; gap: 8px;">
              ${step.status !== 'completed' ? `
                <button type="button" class="btn btn-primary btn-sm btn-quick-complete" data-step-index="${index}">
                  Bu Aşamayı Tamamla ✓
                </button>
              ` : `
                <button type="button" class="btn btn-secondary btn-sm btn-save-step" data-step-index="${index}">
                  Güncelle
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    return html;
  }

  /**
   * Yazdırılabilir Medikal Laboratuvar Fişi (Print Slip) HTML oluşturucu
   */
  static generatePrintSlip(order, company, doctor, patient) {
    const matInfo = window.DEFAULT_MATERIAL_PIPELINES[order.materialId] || { name: order.materialId };

    return `
      <div class="print-slip">
        <div class="print-header">
          <div>
            <h2 style="font-size: 18pt; font-weight: 800; margin-bottom: 4px;">DENTAL LAB ÜRETİM & İŞ EMRİ FİŞİ</h2>
            <div style="font-size: 10pt; color: #555;">Laboratuvar Takip ve Klinik Reçete Formu</div>
          </div>
          <div style="text-align: right;">
            <div class="print-barcode">${order.id}</div>
            <div style="font-size: 9pt; margin-top: 4px;">Sipariş Tarihi: ${order.orderDate}</div>
          </div>
        </div>

        <table class="print-table">
          <tr>
            <th style="width: 25%;">Klinik / Firma:</th>
            <td style="width: 25%; font-weight: bold;">${company ? company.name : '-'}</td>
            <th style="width: 25%;">Hekim / Doktor:</th>
            <td style="width: 25%; font-weight: bold;">${doctor ? doctor.name : '-'}</td>
          </tr>
          <tr>
            <th>Hasta Adı Soyadı:</th>
            <td style="font-weight: bold;">${patient ? patient.name : '-'} (${patient ? patient.age : '-'} Yaş)</td>
            <th>Protokol No:</th>
            <td>${patient ? patient.chartNumber : '-'}</td>
          </tr>
          <tr>
            <th>Restorasyon / Materyal:</th>
            <td style="font-weight: bold; color: #000;">${matInfo.name}</td>
            <th>VITA Renk Skalası:</th>
            <td style="font-weight: bold; font-size: 13pt;">${order.shade}</td>
          </tr>
          <tr>
            <th>Prova Tarihi:</th>
            <td>${order.trialDate || 'Belirtilmedi'}</td>
            <th>Teslim Tarihi:</th>
            <td style="font-weight: bold; color: #b91c1c;">${order.deliveryDate}</td>
          </tr>
          <tr>
            <th>Öncelik / Aciliyet:</th>
            <td style="text-transform: uppercase; font-weight: bold;">${order.priority}</td>
            <th>İşlem Tutarı:</th>
            <td>${order.price ? order.price.toLocaleString('tr-TR') + ' ₺' : '-'}</td>
          </tr>
        </table>

        <div class="print-teeth-box">
          İŞLEM YAPILACAK DİŞ NUMARALARI (FDI): 
          <span style="letter-spacing: 2px; text-decoration: underline;">
            ${(order.teeth || []).join(' , ') || 'Belirtilmedi'}
          </span>
        </div>

        ${order.notes ? `
          <div style="margin: 12px 0; padding: 10px; background: #f5f5f5; border-left: 3px solid #333; font-size: 10pt;">
            <strong>Klinik / Hekim Özel Notu:</strong> ${order.notes}
          </div>
        ` : ''}

        <h4 style="margin: 16px 0 8px; font-size: 11pt; border-bottom: 1px solid #000; padding-bottom: 4px;">
          ÜRETİM AŞAMALARI KONTROL ÇİZELGESİ:
        </h4>

        <div>
          ${(order.steps || []).map(step => `
            <div class="print-checklist-item">
              <div class="print-checkbox" style="${step.status === 'completed' ? 'background: #000;' : ''}"></div>
              <div style="flex: 1;">
                <strong>${step.order}. ${step.name}</strong> 
                <span style="font-size: 9pt; color: #444;">(${step.description.substring(0, 75)}...)</span>
              </div>
              <div style="width: 140px; font-size: 9pt; text-align: right;">
                ${step.technician ? step.technician.split(' ')[0] : 'Teknisyen: _____'}
              </div>
              <div style="width: 70px; font-size: 9pt; text-align: right; font-weight: bold;">
                [ ${step.status === 'completed' ? 'ONAY' : 'BEKLİYOR'} ]
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #000;">
          <div style="text-align: center; width: 200px;">
            <div style="font-size: 9pt;">Laboratuvar Şefi Onayı</div>
            <div style="height: 45px;"></div>
            <div style="border-top: 1px dashed #000; font-size: 9pt;">İmza / Kaşe</div>
          </div>
          <div style="text-align: center; width: 200px;">
            <div style="font-size: 9pt;">Klinik / Hekim Teslim Alan</div>
            <div style="height: 45px;"></div>
            <div style="border-top: 1px dashed #000; font-size: 9pt;">İmza / Kaşe</div>
          </div>
        </div>
      </div>
    `;
  }
}

window.PipelineEngine = PipelineEngine;
