/**
 * SUPABASE BULUT VERİTABANI İSTEMCİSİ
 * DentalLab Pro - PostgreSQL Entegrasyonu
 */

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) 
  || 'https://naoraqzmhjvtoewmgjyq.supabase.co';
const SUPABASE_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hb3JhcXptaGp2dG9ld21nanlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODY2NTEsImV4cCI6MjEwNDM2MjY1MX0.cYoqUV25XQSZWnRu6qdPeD-mNyNpD7howik7op9oDrc';

const getHeaders = () => ({
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=representation'
});

// Güvenli ISO Tarih Dönüştürücü
function safeIso(val) {
  if (!val) return null;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch (e) {
    return null;
  }
}

// 1. TÜM VERİLERİ SUPABASE'DEN ÇEK
export async function fetchAllFromSupabase() {
  try {
    const headers = getHeaders();
    const [compRes, docRes, patRes, ordRes, stepRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/companies?select=*&order=created_at.desc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/doctors?select=*&order=created_at.desc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/patients?select=*&order=created_at.desc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/order_steps?select=*&order=step_order.asc`, { headers })
    ]);

    if (!compRes.ok || !docRes.ok || !patRes.ok || !ordRes.ok) {
      console.warn('Supabase fetch failed or RLS blocked');
      return null;
    }

    const [compData, docData, patData, ordData, stepData] = await Promise.all([
      compRes.json(),
      docRes.json(),
      patRes.json(),
      ordRes.json(),
      stepRes.ok ? stepRes.json() : []
    ]);

    // Snake_case -> camelCase dönüşümü
    const companies = (compData || []).map(c => ({
      id: c.id,
      name: c.name,
      contactPerson: c.contact_person,
      phone: c.phone,
      email: c.email,
      address: c.address,
      balance: c.balance || 0,
      createdAt: c.created_at
    }));

    const doctors = (docData || []).map(d => ({
      id: d.id,
      companyId: d.company_id,
      name: d.name,
      specialty: d.specialty,
      phone: d.phone,
      email: d.email,
      createdAt: d.created_at
    }));

    const patients = (patData || []).map(p => ({
      id: p.id,
      companyId: p.company_id,
      doctorId: p.doctor_id,
      name: p.name,
      chartNumber: p.chart_number,
      age: p.age,
      gender: p.gender,
      notes: p.notes,
      createdAt: p.created_at
    }));

    // Siparişler ve aşamalarını birleştir
    const orders = (ordData || []).map(o => {
      const relatedSteps = (stepData || [])
        .filter(s => s.order_id === o.id)
        .sort((a, b) => a.step_order - b.step_order)
        .map(s => ({
          order: s.step_order,
          name: s.name,
          description: s.description || '',
          status: s.status || 'pending',
          technician: s.technician || '',
          startedAt: s.started_at,
          completedAt: s.completed_at,
          notes: s.notes || ''
        }));

      return {
        id: o.id,
        companyId: o.company_id,
        doctorId: o.doctor_id,
        patientId: o.patient_id,
        materialId: o.material_id,
        teeth: Array.isArray(o.teeth) ? o.teeth : [],
        shade: o.shade,
        priority: o.priority || 'normal',
        status: o.status || 'in_progress',
        orderDate: o.order_date,
        trialDate: o.trial_date,
        deliveryDate: o.delivery_date,
        price: o.price || 0,
        notes: o.notes || '',
        currentStepIndex: o.current_step_index || 0,
        createdAt: o.created_at,
        steps: relatedSteps
      };
    });

    return { companies, doctors, patients, orders };
  } catch (error) {
    console.error('Supabase fetch error:', error);
    return null;
  }
}

// 2. SİPARİŞİ VE AŞAMALARINI KAYDET / GÜNCELLE
export async function saveOrderToSupabase(order) {
  try {
    const headers = getHeaders();
    const orderPayload = {
      id: order.id,
      company_id: order.companyId || null,
      doctor_id: order.doctorId || null,
      patient_id: order.patientId || null,
      material_id: order.materialId || 'porcelain',
      teeth: Array.isArray(order.teeth) ? order.teeth : [],
      shade: order.shade || 'A2',
      priority: order.priority || 'normal',
      status: order.status || 'in_progress',
      order_date: order.orderDate || new Date().toISOString().split('T')[0],
      trial_date: order.trialDate || null,
      delivery_date: order.deliveryDate || new Date().toISOString().split('T')[0],
      price: Number(order.price) || 0,
      notes: order.notes || '',
      current_step_index: order.currentStepIndex || 0
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderPayload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Supabase saveOrder error:', err);
    }

    // Aşamaları kaydet
    if (Array.isArray(order.steps) && order.steps.length > 0) {
      // Önce bu siparişin eski adımlarını sil
      await fetch(`${SUPABASE_URL}/rest/v1/order_steps?order_id=eq.${order.id}`, {
        method: 'DELETE',
        headers
      });

      const stepsPayload = order.steps.map((st, idx) => ({
        order_id: order.id,
        step_order: st.order || (idx + 1),
        name: st.name,
        description: st.description || '',
        status: st.status || 'pending',
        technician: st.technician || '',
        started_at: safeIso(st.startedAt),
        completed_at: safeIso(st.completedAt),
        notes: st.notes || ''
      }));

      await fetch(`${SUPABASE_URL}/rest/v1/order_steps`, {
        method: 'POST',
        headers,
        body: JSON.stringify(stepsPayload)
      });
    }

    return true;
  } catch (error) {
    console.error('saveOrderToSupabase error:', error);
    return false;
  }
}

// 3. SİPARİŞİ SİL
export async function deleteOrderFromSupabase(orderId) {
  try {
    const headers = getHeaders();
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'DELETE',
      headers
    });
    return true;
  } catch (error) {
    console.error('deleteOrderFromSupabase error:', error);
    return false;
  }
}

// 4. FİRMA / KLİNİK KAYDET
export async function saveCompanyToSupabase(company) {
  try {
    const headers = getHeaders();
    const payload = {
      id: company.id,
      name: company.name,
      contact_person: company.contactPerson || '',
      phone: company.phone || '',
      email: company.email || '',
      address: company.address || '',
      balance: Number(company.balance) || 0
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/companies`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (error) {
    console.error('saveCompanyToSupabase error:', error);
    return false;
  }
}

// 5. FİRMA SİL
export async function deleteCompanyFromSupabase(companyId) {
  try {
    const headers = getHeaders();
    await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${companyId}`, {
      method: 'DELETE',
      headers
    });
    return true;
  } catch (error) {
    console.error('deleteCompanyFromSupabase error:', error);
    return false;
  }
}

// 6. DOKTOR / HEKİM KAYDET
export async function saveDoctorToSupabase(doctor) {
  try {
    const headers = getHeaders();
    const payload = {
      id: doctor.id,
      company_id: doctor.companyId || null,
      name: doctor.name,
      specialty: doctor.specialty || '',
      phone: doctor.phone || '',
      email: doctor.email || ''
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/doctors`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (error) {
    console.error('saveDoctorToSupabase error:', error);
    return false;
  }
}

// 7. DOKTOR SİL
export async function deleteDoctorFromSupabase(doctorId) {
  try {
    const headers = getHeaders();
    await fetch(`${SUPABASE_URL}/rest/v1/doctors?id=eq.${doctorId}`, {
      method: 'DELETE',
      headers
    });
    return true;
  } catch (error) {
    console.error('deleteDoctorFromSupabase error:', error);
    return false;
  }
}

// 8. HASTA KAYDET
export async function savePatientToSupabase(patient) {
  try {
    const headers = getHeaders();
    const payload = {
      id: patient.id,
      company_id: patient.companyId || null,
      doctor_id: patient.doctorId || null,
      name: patient.name,
      chart_number: patient.chartNumber || '',
      age: Number(patient.age) || null,
      gender: patient.gender || '',
      notes: patient.notes || ''
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/patients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (error) {
    console.error('savePatientToSupabase error:', error);
    return false;
  }
}

// 9. HASTA SİL
export async function deletePatientFromSupabase(patientId) {
  try {
    const headers = getHeaders();
    await fetch(`${SUPABASE_URL}/rest/v1/patients?id=eq.${patientId}`, {
      method: 'DELETE',
      headers
    });
    return true;
  } catch (error) {
    console.error('deletePatientFromSupabase error:', error);
    return false;
  }
}
