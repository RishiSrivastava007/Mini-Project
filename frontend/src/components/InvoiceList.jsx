import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, Trash2, Mail, Sparkles } from 'lucide-react';

export default function InvoiceList({ invoices, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailModal, setEmailModal] = useState(null);
  const navigate = useNavigate();

  const getStatus = (inv) => {
    if (inv.amount > 0 && inv.amount_paid >= inv.amount) return 'Paid';
    if (inv.amount_paid > 0 && inv.amount_paid < inv.amount) return 'Partial';
    if (inv.is_paid) return 'Paid'; 
    return 'Unpaid';
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.client_name.toLowerCase().includes(search.toLowerCase()) || 
                        inv.invoice_number.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'Paid') return matchSearch && getStatus(inv) === 'Paid';
    if (statusFilter === 'Unpaid') return matchSearch && getStatus(inv) === 'Unpaid';
    if (statusFilter === 'Partially Paid') return matchSearch && getStatus(inv) === 'Partial';
    return matchSearch;
  });

  const handleMarkPaid = async (invoice) => {
    try {
      const isNowPaid = !invoice.is_paid;
      const payload = { 
        ...invoice, 
        is_paid: isNowPaid ? 1 : 0,
        amount_paid: isNowPaid ? invoice.amount : 0
      };
      await axios.put(`http://127.0.0.1:5000/api/invoices/${invoice.id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiText) return;
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/ai/extract', { text: aiText }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data) {
        navigate('/invoices/new', { state: { prefill: res.data } });
      }
    } catch (err) {
      alert('AI Extraction failed');
    } finally {
      setLoading(false);
      setShowAIModal(false);
    }
  };

  return (
    <div className="card">
      <div className="page-header" style={{padding:'1.5rem 1.5rem 0', marginBottom:0}}>
        <div>
          <h1 style={{fontSize:'1.5rem', fontWeight:'600'}}>All Invoices</h1>
          <p style={{marginTop:'0.25rem', color:'var(--text-muted)'}}>Manage all your invoices in one place.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowAIModal(true)}>
            <Sparkles size={16} /> Create with AI
          </button>
          <button className="btn-primary" onClick={() => navigate('/invoices/new')}>
            + Create Invoice
          </button>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-bar">
          <span style={{color:'var(--text-light)', paddingRight:'0.5rem'}}>⌕</span>
          <input 
            type="text" 
            placeholder="Search by invoice # or client..." 
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="input-field" style={{width:'auto', margin:0, background:'rgba(0,0,0,0.2)'}}
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
        >
          <option>All Statuses</option>
          <option>Paid</option>
          <option>Partially Paid</option>
          <option>Unpaid</option>
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>INVOICE #</th>
            <th>CLIENT</th>
            <th>AMOUNT</th>
            <th>DUE DATE</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map(inv => (
            <tr key={inv.id}>
              <td style={{fontWeight:500}}>{inv.invoice_number}</td>
              <td>{inv.client_name}</td>
              <td>${inv.amount.toFixed(2)}</td>
              <td>{inv.due_date}</td>
              <td>
                <span className={`status-badge ${getStatus(inv).toLowerCase()}`}>
                  {getStatus(inv) === 'Partial' ? 'Partially Paid' : getStatus(inv)}
                </span>
              </td>
              <td>
                <div className="action-row">
                  <button className="btn-secondary" onClick={() => handleMarkPaid(inv)} style={{padding:'0.4rem 0.75rem', fontSize:'0.75rem'}}>
                    {inv.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                  <button className="icon-btn" onClick={() => onEdit(inv)}><Edit size={16}/></button>
                  <button className="icon-btn danger" onClick={() => onDelete(inv.id)}><Trash2 size={16}/></button>
                  <button className="icon-btn" style={{color:'var(--primary-hover)'}} onClick={() => setEmailModal(inv)}><Mail size={16}/></button>
                </div>
              </td>
            </tr>
          ))}
          {filteredInvoices.length === 0 && (
            <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No invoices found</td></tr>
          )}
        </tbody>
      </table>

      {showAIModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Sparkles size={20} color="var(--primary-color)"/> Create Invoice with AI</h3>
              <button className="close-btn" onClick={() => setShowAIModal(false)}>✕</button>
            </div>
            <p style={{marginBottom:'1rem', fontSize:'0.875rem', color:'var(--text-muted)'}}>
              Paste any text that contains invoice details (like client name, items, quantities, and prices) and the AI will attempt to create an invoice from it.
            </p>
            <div style={{border:'1px solid var(--border-color)', borderRadius:'8px', padding:'1rem'}}>
              <label style={{fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:'0.5rem'}}>Paste Invoice Text Here</label>
              <textarea 
                className="input-field" 
                rows="6" 
                style={{border:'none', margin:0, padding:'0', resize:'none', width:'100%', outline:'none'}}
                value={aiText} onChange={e => setAiText(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAIModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleGenerateAI} disabled={loading} style={{width:'auto'}}>
                {loading ? 'Processing...' : '✨ Auto-Fill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {emailModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Mail size={20} color="var(--primary-color)"/> Email Invoice</h3>
              <button className="close-btn" onClick={() => setEmailModal(null)}>✕</button>
            </div>
            <p style={{marginBottom:'1rem', fontSize:'0.875rem', color:'var(--text-muted)'}}>
              Send Invoice #{emailModal.invoice_number} to {emailModal.client_name}
            </p>
            <div className="form-group">
              <label>Recipient Email</label>
              <input className="input-field" defaultValue="client@example.com" />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input className="input-field" defaultValue={`Invoice ${emailModal.invoice_number} from Your Company`} />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea className="input-field" rows="4" defaultValue={`Hi ${emailModal.client_name},\n\nPlease find your latest invoice attached.\n\nThank you!`}></textarea>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEmailModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                 alert("Success! The invoice email has been queued for sending. (Simulated)");
                 setEmailModal(null);
              }} style={{width:'auto'}}>
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
