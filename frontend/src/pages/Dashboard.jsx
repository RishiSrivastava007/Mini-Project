import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Clock, FileText, PlusCircle, List, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 0, pending: 0, total: 0 });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const navigate = useNavigate();

  const getStatus = (inv) => {
    if (inv.amount > 0 && inv.amount_paid >= inv.amount) return 'Paid';
    if (inv.amount_paid > 0 && inv.amount_paid < inv.amount) return 'Partial';
    if (inv.is_paid) return 'Paid'; 
    return 'Unpaid';
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/invoices', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
      .then(res => {
        const invoices = res.data;
        const revenue = invoices.filter(i => i.is_paid).reduce((sum, curr) => sum + curr.amount, 0);
        const pending = invoices.filter(i => !i.is_paid).reduce((sum, curr) => sum + curr.amount, 0);
        setStats({ revenue, pending, total: invoices.length });
        
        // Sort by id descending
        const sorted = [...invoices].sort((a, b) => b.id - a.id);
        setRecentInvoices(sorted.slice(0, 5));
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Welcome back! Here's what's happening today.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/invoices')}>
            <List size={16} /> View All
          </button>
          <button className="btn-primary" onClick={() => navigate('/invoices/new')}>
            <PlusCircle size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="form-row">
         <div className="card" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--success-text)' }}>
           <div style={{ backgroundColor: 'var(--success-bg)', padding: '1rem', borderRadius: '12px', color: 'var(--success-text)' }}>
             <DollarSign size={28} />
           </div>
           <div>
             <h3 style={{ marginBottom: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Revenue</h3>
             <p style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: '700' }}>${stats.revenue.toFixed(2)}</p>
           </div>
         </div>
         
         <div className="card" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--warning-text)' }}>
           <div style={{ backgroundColor: 'var(--warning-bg)', padding: '1rem', borderRadius: '12px', color: 'var(--warning-text)' }}>
             <Clock size={28} />
           </div>
           <div>
             <h3 style={{ marginBottom: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Pending Payments</h3>
             <p style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: '700' }}>${stats.pending.toFixed(2)}</p>
           </div>
         </div>
         
         <div className="card" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--primary-hover)' }}>
           <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', padding: '1rem', borderRadius: '12px', color: 'var(--primary-hover)' }}>
             <FileText size={28} />
           </div>
           <div>
             <h3 style={{ marginBottom: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Invoices</h3>
             <p style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: '700' }}>{stats.total}</p>
           </div>
         </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Recent Invoices */}
        <div className="card" style={{ flex: 2, minWidth: '400px' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Recent Invoices</h2>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary-hover)', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => navigate('/invoices')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE #</th>
                <th>CLIENT</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 500 }}>{inv.invoice_number}</td>
                  <td>{inv.client_name}</td>
                  <td style={{ fontWeight: 600 }}>${inv.amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatus(inv).toLowerCase()}`}>
                      {getStatus(inv) === 'Partial' ? 'Partially Paid' : getStatus(inv)}
                    </span>
                  </td>
                </tr>
              ))}
              {recentInvoices.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No recent invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Recent Activity</h2>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {recentInvoices.length > 0 ? recentInvoices.map((inv, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getStatus(inv) === 'Paid' ? 'var(--success-text)' : (getStatus(inv) === 'Partial' ? 'var(--primary-color)' : 'var(--primary-hover)'), marginTop: '4px', flexShrink: 0 }}></div>
                 <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                       {getStatus(inv) === 'Paid' ? `Payment received from ${inv.client_name}` : (getStatus(inv) === 'Partial' ? `Partial payment from ${inv.client_name}` : `Invoice sent to ${inv.client_name}`)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                       Invoice #{inv.invoice_number} • ${inv.amount.toFixed(2)}
                    </p>
                 </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No activity yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
