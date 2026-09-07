import React from 'react';
import { useDental } from '../context/DentalContext';

export const PrintSlip = ({ order }) => {
  const { companies, doctors, patients, materials } = useDental();
  if (!order) return null;

  const company = companies.find(c => c.id === order.companyId);
  const doctor = doctors.find(d => d.id === order.doctorId);
  const patient = patients.find(p => p.id === order.patientId);
  const material = materials[order.materialId] || { name: order.materialId };

  return (
    <div id="printableSlipArea" style={{ display: 'none' }}>
      <div style={{ border: '2px solid #000', padding: 24, borderRadius: 8, maxWidth: 800, margin: '0 auto', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: 14, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '18pt', margin: 0, fontWeight: 800 }}>DENTAL LAB PRO - İŞ EMRİ FİŞİ</h2>
            <div style={{ fontSize: '10pt', color: '#444' }}>Diş Protez Üretim & Klinik Takip Formu</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ border: '2px solid #000', padding: '6px 16px', fontSize: '16pt', fontWeight: 800, fontFamily: 'monospace' }}>
              {order.id}
            </div>
            <div style={{ fontSize: '9pt', marginTop: 4 }}>Kayıt: {order.orderDate}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <tbody>
            <tr>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#f0f0f0', width: '25%', textAlign: 'left' }}>Klinik / Firma:</th>
              <td style={{ border: '1px solid #333', padding: '6px 10px', width: '25%', fontWeight: 'bold' }}>{company?.name || '-'}</td>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#f0f0f0', width: '25%', textAlign: 'left' }}>Hekim / Doktor:</th>
              <td style={{ border: '1px solid #333', padding: '6px 10px', width: '25%', fontWeight: 'bold' }}>{doctor?.name || '-'}</td>
            </tr>
            <tr>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#f0f0f0', textAlign: 'left' }}>Hasta Adı Soyadı:</th>
              <td style={{ border: '1px solid #333', padding: '6px 10px', fontWeight: 'bold' }}>{patient?.name || '-'} ({patient?.age} Yaş)</td>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#f0f0f0', textAlign: 'left' }}>Protokol No:</th>
              <td style={{ border: '1px solid #333', padding: '6px 10px' }}>{patient?.chartNumber || '-'}</td>
            </tr>
            <tr>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#f0f0f0', textAlign: 'left' }}>Restorasyon Türü:</th>
              <td style={{ border: '1px solid #333', padding: '6px 10px', fontWeight: 'bold' }}>{material.name}</td>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#f0f0f0', textAlign: 'left' }}>VITA Diş Rengi:</th>
              <td style={{ border: '1px solid #333', padding: '6px 10px', fontWeight: 'bold', fontSize: '13pt', color: '#0284c7' }}>{order.shade}</td>
            </tr>
            <tr>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#f0f0f0', textAlign: 'left' }}>Prova Tarihi:</th>
              <td style={{ border: '1px solid #333', padding: '6px 10px' }}>{order.trialDate || 'Belirtilmedi'}</td>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#f0f0f0', textAlign: 'left' }}>Teslim Tarihi:</th>
              <td style={{ border: '1px solid #333', padding: '6px 10px', fontWeight: 'bold', color: '#b91c1c' }}>{order.deliveryDate}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '2px dashed #000', padding: 12, textAlign: 'center', margin: '14px 0', fontSize: '13pt', fontWeight: 800 }}>
          İŞLEM DİŞLERİ (FDI): <span style={{ textDecoration: 'underline', letterSpacing: 2 }}>{(order.teeth || []).join(' , ') || '-'}</span>
        </div>

        {order.notes && (
          <div style={{ padding: 10, background: '#f9f9f9', borderLeft: '3px solid #000', margin: '12px 0', fontSize: '10pt' }}>
            <strong>Hekim / Laboratuvar Özel Notu:</strong> {order.notes}
          </div>
        )}

        <h4 style={{ margin: '16px 0 8px', borderBottom: '1px solid #000', paddingBottom: 4, fontSize: '11pt' }}>
          ÜRETİM AŞAMALARI İMZA & KONTROL ÇİZELGESİ:
        </h4>

        <div>
          {(order.steps || []).map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px dotted #ccc', fontSize: '9.5pt' }}>
              <div style={{ width: 16, height: 16, border: '2px solid #000', background: step.status === 'completed' ? '#000' : '#fff' }} />
              <div style={{ flex: 1 }}>
                <strong>{step.order}. {step.name}</strong>
              </div>
              <div style={{ width: 140, textAlign: 'right', color: '#444' }}>
                Teknisyen: {step.technician ? step.technician.split(' ')[0] : '_________'}
              </div>
              <div style={{ width: 80, textAlign: 'right', fontWeight: 'bold' }}>
                [{step.status === 'completed' ? 'ONAY' : 'BEKLİYOR'}]
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 16, borderTop: '1px solid #000' }}>
          <div style={{ textAlign: 'center', width: 200 }}>
            <div style={{ fontSize: '9pt' }}>Laboratuvar Sorumlusu</div>
            <div style={{ height: 40 }} />
            <div style={{ borderTop: '1px dashed #000', fontSize: '9pt' }}>İmza / Kaşe</div>
          </div>
          <div style={{ textAlign: 'center', width: 200 }}>
            <div style={{ fontSize: '9pt' }}>Klinik / Hekim Teslim Alan</div>
            <div style={{ height: 40 }} />
            <div style={{ borderTop: '1px dashed #000', fontSize: '9pt' }}>İmza / Kaşe</div>
          </div>
        </div>
      </div>
    </div>
  );
};
