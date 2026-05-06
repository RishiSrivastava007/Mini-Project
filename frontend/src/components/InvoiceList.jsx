import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, Trash2, Mail, Sparkles, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
      await axios.put(`/api/invoices/${invoice.id}`, payload, {
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
      const res = await axios.post('/api/ai/extract', { text: aiText }, {
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

  const handleDownloadPDF = async (inv) => {
    const element = document.getElementById(`invoice-template-${inv.id}`);
    if (!element) return;
    
    // Temporarily show the hidden element
    element.style.display = 'block';
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${inv.invoice_number}.pdf`);
    
    // Hide it again
    element.style.display = 'none';
  };

  const handleSendEmailContext = async () => {
    if (!emailModal) return;
    try {
       const res = await axios.post(`/api/invoices/${emailModal.invoice_id}/send`, {
          to: emailModal.to,
          subject: emailModal.subject,
          message: emailModal.message
       }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
       });
       alert('Success! The invoice email has been queued for sending. Preview Link logged in Backend.');
    } catch (err) {
       console.error(err);
       alert('Failed to send email.');
    } finally {
       setEmailModal(null);
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
              <td>{inv.currency || '$'}{(inv.amount + (inv.tax_amount || 0)).toFixed(2)}</td>
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
                  <button className="icon-btn danger" title="Delete" onClick={() => onDelete(inv.id)}><Trash2 size={16}/></button>
                  <button className="icon-btn" title="Send Email" style={{color:'var(--primary-hover)'}} onClick={() => setEmailModal({
                    invoice_id: inv.id, invoice_number: inv.invoice_number, client_name: inv.client_name, 
                    to: inv.client_email || 'client@example.com', 
                    subject: `Invoice ${inv.invoice_number} from Your Company`, 
                    message: `Hi ${inv.client_name},\n\nPlease find your latest invoice details attached or within.\n\nThank you!`
                  })}><Mail size={16}/></button>
                  <button className="icon-btn" title="Download PDF" style={{color:'#10b981'}} onClick={() => handleDownloadPDF(inv)}>
                    <Download size={16}/>
                  </button>
                </div>

                {/* Hidden Template for PDF Generation */}
                <div id={`invoice-template-${inv.id}`} style={{ display: 'none', padding: '40px', background: '#fff', color: '#000', width: '800px', fontFamily: 'Arial, sans-serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                     <div>
                       <h1 style={{ fontSize: '36px', margin: '0 0 10px 0', color: '#333' }}>INVOICE</h1>
                       <p style={{ margin: 0, color: '#666' }}>Invoice #: <strong>{inv.invoice_number}</strong></p>
                       <p style={{ margin: 0, color: '#666' }}>Date: {inv.invoice_date}</p>
                       <p style={{ margin: 0, color: '#666' }}>Due Date: {inv.due_date}</p>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                       <h2 style={{ margin: '0 0 5px 0' }}>{inv.bill_from_name || 'Your Company'}</h2>
                       <p style={{ margin: 0 }}>{inv.bill_from_email}</p>
                       <p style={{ margin: 0 }}>{inv.bill_from_address}</p>
                       <p style={{ margin: 0 }}>{inv.bill_from_phone}</p>
                     </div>
                  </div>
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Bill To:</h3>
                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>{inv.client_name}</p>
                    <p style={{ margin: 0 }}>{inv.client_email}</p>
                    <p style={{ margin: 0 }}>{inv.client_address}</p>
                    <p style={{ margin: 0 }}>{inv.client_phone}</p>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '10px', textTransform:'uppercase', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description / Services</th>
                        <th style={{ padding: '10px', textTransform:'uppercase', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '15px 10px', borderBottom: '1px solid #ddd' }}>{inv.service_details}</td>
                        <td style={{ padding: '15px 10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{inv.currency || '$'}{inv.amount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <div style={{ width: '300px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ddd' }}>
                        <span>Subtotal:</span>
                        <span>{inv.currency || '$'}{inv.amount.toFixed(2)}</span>
                      </div>
                      {(inv.tax_amount > 0) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ddd' }}>
                          <span>Tax ({inv.tax_type || 'Custom'} - {inv.tax_rate}%):</span>
                          <span>{inv.currency || '$'}{inv.tax_amount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ddd' }}>
                        <span>Amount Paid:</span>
                        <span>{inv.currency || '$'}{(inv.amount_paid || 0).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontWeight: 'bold', fontSize: '18px' }}>
                        <span>Total Due:</span>
                        <span>{inv.currency || '$'}{Math.max((inv.amount + (inv.tax_amount || 0)) - (inv.amount_paid || 0), 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '50px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
                    Thank you for your business!
                  </div>
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
              <input className="input-field" value={emailModal.to} onChange={(e) => setEmailModal({...emailModal, to: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input className="input-field" value={emailModal.subject} onChange={(e) => setEmailModal({...emailModal, subject: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea className="input-field" rows="4" value={emailModal.message} onChange={(e) => setEmailModal({...emailModal, message: e.target.value})}></textarea>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEmailModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSendEmailContext} style={{width:'auto'}}>
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
