import React, { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useDental } from '../context/DentalContext';
import { Plus, Trash2, KeyRound, Shield, User, Building2, X, Lock } from 'lucide-react';

export const UsersView = () => {
  const { users, saveUser, deleteUser, currentUser } = useAuth();
  const { companies, showToast } = useDental();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.operator);

  const openNew = () => {
    setEditingId(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole(ROLES.operator);
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    if (user.role === ROLES.admin) {
      showToast('Yönetici bilgileri sabittir, değiştirilemez.', 'warning');
      return;
    }
    setEditingId(user.id);
    setName(user.name || '');
    setUsername(user.username || '');
    setPassword('');
    setRole(user.role);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const result = saveUser({
      id: editingId,
      name,
      username,
      password,
      role: editingId ? role : ROLES.operator
    });
    if (!result.ok) {
      showToast(result.error, 'error');
      return;
    }
    showToast(editingId ? 'Kullanıcı güncellendi.' : 'Kullanıcı eklendi.', 'success');
    setIsModalOpen(false);
  };

  const handleDelete = (user) => {
    if (!window.confirm(`${user.username} kullanıcısı silinsin mi?`)) return;
    const result = deleteUser(user.id);
    if (!result.ok) showToast(result.error, 'error');
    else showToast('Kullanıcı silindi.', 'warning');
  };

  const roleLabel = (r) => {
    if (r === ROLES.admin) return 'Yönetici';
    if (r === ROLES.company) return 'Firma';
    return 'Kullanıcı';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Kullanıcılar & Yetkiler</h2>
          <p className="page-subtitle">
            Yönetici her şeyi ayarlar. Kullanıcı yalnızca iş emri başlatır. Firma hesabı kendi üretim durumunu görür.
          </p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn-dental btn-dental-primary" onClick={openNew}>
            <Plus size={16} />
            <span>Yeni Kullanıcı</span>
          </button>
        </div>
      </div>

      <div className="dental-card" style={{ overflowX: 'auto' }}>
        <table className="dental-table">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Kullanıcı adı</th>
              <th>Rol</th>
              <th>Bağlı firma</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const company = companies.find(c => c.id === user.companyId);
              return (
                <tr key={user.id}>
                  <td style={{ fontWeight: 700 }}>{user.name}</td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>{user.username}</td>
                  <td>
                    <span className={`badge-pill ${user.role === ROLES.admin ? 'badge-inprogress' : user.role === ROLES.company ? 'badge-completed' : 'badge-pending'}`}>
                      {user.role === ROLES.admin ? <Shield size={12} /> : user.role === ROLES.company ? <Building2 size={12} /> : <User size={12} />}
                      {' '}{roleLabel(user.role)}
                    </span>
                  </td>
                  <td>{company?.name || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      {user.role === ROLES.admin ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 6, fontWeight: 600 }}>
                          <Lock size={12} color="var(--dental-blue)" />
                          <span>Sabit Yönetici</span>
                        </span>
                      ) : (
                        <>
                          <button type="button" className="btn-dental btn-dental-secondary btn-dental-sm" onClick={() => openEdit(user)}>
                            <KeyRound size={13} />
                            <span>Düzenle</span>
                          </button>
                          {user.id !== currentUser?.id && (
                            <button type="button" className="btn-dental btn-dental-danger btn-dental-sm" onClick={() => handleDelete(user)} title="Kullanıcıyı Sil">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-dialog-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {editingId ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
              </h3>
              <button type="button" className="btn-dental btn-dental-secondary" style={{ padding: 6, borderRadius: '50%' }} onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-dialog-body">
                <div className="form-item" style={{ marginBottom: 12 }}>
                  <label>Ad Soyad</label>
                  <input className="dental-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-item" style={{ marginBottom: 12 }}>
                  <label>Kullanıcı adı *</label>
                  <input className="dental-input" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="form-item" style={{ marginBottom: 12 }}>
                  <label>{editingId ? 'Yeni şifre (boş bırakılırsa değişmez)' : 'Şifre *'}</label>
                  <input
                    type="text"
                    className="dental-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required={!editingId}
                    placeholder={editingId ? 'Değiştirmek için yazın' : 'Şifre'}
                  />
                </div>
              </div>
              <div className="modal-dialog-footer">
                <button type="button" className="btn-dental btn-dental-secondary" onClick={() => setIsModalOpen(false)}>İptal</button>
                <button type="submit" className="btn-dental btn-dental-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
