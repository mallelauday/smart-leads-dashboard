import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lead, LeadFilters } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { exportToCSV } from '../utils/exportCsv';
import api from '../api/axiosInstance';

const statusColors: Record<string, { bg: string; color: string; dot: string }> = {
  New:       { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', dot: '#6366f1' },
  Contacted: { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', dot: '#f59e0b' },
  Qualified: { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', dot: '#10b981' },
  Lost:      { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', dot: '#ef4444' },
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState<LeadFilters>({ search: '', status: '', source: '', sort: 'latest', page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({ name: '', email: '', status: 'New', source: 'Website' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(filters.page), sort: filters.sort || 'latest' };
      if (debouncedSearch) params.search = debouncedSearch as string;
      if (filters.status) params.status = filters.status;
      if (filters.source) params.source = filters.source;
      const res = await api.get('/leads', { params });
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status, filters.source, filters.sort, filters.page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const openCreate = () => {
    setEditLead(null);
    setForm({ name: '', email: '', status: 'New', source: 'Website' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setForm({ name: lead.name, email: lead.email, status: lead.status, source: lead.source });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { setFormError('Name and email are required'); return; }
    try {
      setFormLoading(true);
      if (editLead) await api.put(`/leads/${editLead._id}`, form);
      else await api.post('/leads', form);
      setShowModal(false);
      fetchLeads();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch {
      alert('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    const res = await api.get('/leads', { params: { limit: 1000 } });
    exportToCSV(res.data.data);
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>⚡</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' }}>SmartLeads</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 20, padding: '6px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
            <span style={{ fontSize: 13, color: '#a5b4fc' }}>{user?.name}</span>
            <span style={{
              background: 'rgba(99,102,241,0.3)', color: '#818cf8',
              fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>{user?.role}</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', borderRadius: 8, padding: '8px 16px',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Leads', value: pagination.total, color: '#6366f1', icon: '👥' },
            { label: 'New', value: leads.filter(l => l.status === 'New').length, color: '#818cf8', icon: '🆕' },
            { label: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length, color: '#10b981', icon: '✅' },
            { label: 'Lost', value: leads.filter(l => l.status === 'Lost').length, color: '#ef4444', icon: '❌' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '20px 24px',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, fontFamily: "'Syne', sans-serif" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: '#fff', margin: 0 }}>All Leads</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '4px 0 0' }}>Manage and track your leads</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleExport} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0', borderRadius: 10, padding: '10px 18px',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>📥 Export CSV</button>
            <button onClick={openCreate} style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', color: '#fff', borderRadius: 10, padding: '10px 18px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
            }}>+ Add Lead</button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 20,
          display: 'flex', gap: 12, flexWrap: 'wrap',
        }}>
          <input
            type="text"
            placeholder="🔍  Search name or email..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
            style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          />
          {[
            { key: 'status', options: ['', 'New', 'Contacted', 'Qualified', 'Lost'], labels: ['All Status', 'New', 'Contacted', 'Qualified', 'Lost'] },
            { key: 'source', options: ['', 'Website', 'Instagram', 'Referral'], labels: ['All Sources', 'Website', 'Instagram', 'Referral'] },
            { key: 'sort', options: ['latest', 'oldest'], labels: ['Latest First', 'Oldest First'] },
          ].map(f => (
            <select
              key={f.key}
              value={(filters as any)[f.key]}
              onChange={e => setFilters({ ...filters, [f.key]: e.target.value, page: 1 })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {f.options.map((opt, i) => (
                <option key={opt} value={opt} style={{ background: '#1a1d2e' }}>{f.labels[i]}</option>
              ))}
            </select>
          ))}
        </div>

        {/* Table */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p>Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>No leads found</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting filters or add a new lead</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Name', 'Email', 'Status', 'Source', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '14px 20px',
                      fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      background: 'rgba(255,255,255,0.02)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={lead._id} style={{
                    borderBottom: i < leads.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{lead.name}</div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{lead.email}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: statusColors[lead.status]?.bg,
                        color: statusColors[lead.status]?.color,
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[lead.status]?.dot }} />
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{lead.source}</td>
                    <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(lead)} style={{
                          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)',
                          color: '#818cf8', borderRadius: 8, padding: '6px 14px',
                          fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        }}>Edit</button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(lead._id)}
                            disabled={deletingId === lead._id}
                            style={{
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                              color: '#f87171', borderRadius: 8, padding: '6px 14px',
                              fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: deletingId === lead._id ? 0.5 : 1,
                            }}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#e2e8f0', borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer',
                opacity: filters.page === 1 ? 0.4 : 1,
              }}>← Prev</button>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              Page {filters.page} of {pagination.totalPages}
            </span>
            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#e2e8f0', borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer',
                opacity: filters.page === pagination.totalPages ? 0.4 : 1,
              }}>Next →</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#13151f', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440,
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
          }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', margin: '0 0 24px' }}>
              {editLead ? '✏️ Edit Lead' : '➕ Add New Lead'}
            </h3>

            {formError && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16,
              }}>{formError}</div>
            )}

            <form onSubmit={handleFormSubmit}>
              {[
                { label: 'Name', key: 'name', type: 'text', placeholder: 'Lead name' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'lead@example.com' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              ))}

              {[
                { label: 'Status', key: 'status', options: ['New', 'Contacted', 'Qualified', 'Lost'] },
                { label: 'Source', key: 'source', options: ['Website', 'Instagram', 'Referral'] },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                  <select
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
                  >
                    {f.options.map(o => <option key={o} value={o} style={{ background: '#13151f' }}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}>Cancel</button>
                <button type="submit" disabled={formLoading} style={{
                  flex: 1, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', color: '#fff', borderRadius: 10, padding: '12px',
                  fontSize: 14, fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer',
                  opacity: formLoading ? 0.7 : 1, boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                }}>{formLoading ? 'Saving...' : editLead ? 'Update Lead' : 'Create Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
