import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

export default function InvoiceForm({ invoice, onClose, onSave }) {
  const location = useLocation();
  const prefill = location.state?.prefill || {};

  const [formData, setFormData] = useState({
    invoice_number: invoice?.invoice_number || prefill.invoice_number || `INV-${Math.floor(1000+Math.random()*9000)}`,
    invoice_date: invoice?.invoice_date || prefill.invoice_date || '',
    due_date: invoice?.due_date || prefill.due_date || '',
    bill_from_name: invoice?.bill_from_name || prefill.bill_from_name || '',
    bill_from_email: invoice?.bill_from_email || prefill.bill_from_email || '',
    bill_from_address: invoice?.bill_from_address || prefill.bill_from_address || '',
    bill_from_phone: invoice?.bill_from_phone || prefill.bill_from_phone || '',
    client_name: invoice?.client_name || prefill.client_name || '',
    client_email: invoice?.client_email || prefill.client_email || '',
    client_address: invoice?.client_address || prefill.client_address || '',
    client_phone: invoice?.client_phone || prefill.client_phone || '',
    amount: invoice?.amount || prefill.amount || '',
    amount_paid: invoice?.amount_paid || prefill.amount_paid || '',
    service_details: invoice?.service_details || prefill.service_details || '',
    is_paid: invoice?.is_paid ? true : false,
    currency: invoice?.currency || prefill.currency || '₹',
    tax_type: invoice?.tax_type || prefill.tax_type || 'None',
    tax_rate: invoice?.tax_rate || prefill.tax_rate || 0,
    tax_amount: invoice?.tax_amount || prefill.tax_amount || 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsedAmount = parseFloat(formData.amount || 0);
      const parsedRate = parseFloat(formData.tax_rate || 0);
      const calculatedTax = (parsedAmount * parsedRate) / 100;
      
      const payload = { 
        ...formData, 
        amount: parsedAmount, 
        amount_paid: parseFloat(formData.amount_paid || 0),
        tax_rate: parsedRate,
        tax_amount: calculatedTax
      };
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

      if (invoice) {
        await axios.put(`/api/invoices/${invoice.id}`, payload, config);
      } else {
        await axios.post('/api/invoices', payload, config);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('Failed to save invoice');
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
  
  const handleTaxChange = (e) => {
    const type = e.target.value;
    let rate = 0;
    if (type === 'GST' || type === 'IGST' || type === 'CGST + SGST') rate = 18;
    setFormData({...formData, tax_type: type, tax_rate: rate});
  };

  const currentAmount = parseFloat(formData.amount || 0);
  const currentTax = (currentAmount * parseFloat(formData.tax_rate || 0)) / 100;
  const currentTotal = currentAmount + currentTax;
  const amountPaid = parseFloat(formData.amount_paid || 0);
  const balanceDue = currentTotal - amountPaid;

  return (
    <div className="invoice-form-container" style={{background:'tranparent'}}>
      <form onSubmit={handleSubmit}>
        
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Invoice Number</label>
              <input className="input-field" name="invoice_number" value={formData.invoice_number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Invoice Date</label>
              <input className="input-field" type="date" name="invoice_date" value={formData.invoice_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input className="input-field" type="date" name="due_date" value={formData.due_date} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Currency</label>
              <select className="input-field" name="currency" value={formData.currency} onChange={handleChange}>
                <option value="₹">INR (₹)</option>
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tax Structure (India GST)</label>
              <select className="input-field" name="tax_type" value={formData.tax_type} onChange={handleTaxChange}>
                <option value="None">None (0%)</option>
                <option value="GST">GST (18%)</option>
                <option value="CGST + SGST">CGST + SGST (18%)</option>
                <option value="IGST">IGST (18%)</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div className="form-group">
              <label>Custom Tax Rate (%)</label>
              <input className="input-field" type="number" step="0.1" name="tax_rate" disabled={formData.tax_type !== 'Custom'} value={formData.tax_rate} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-section" style={{flex:1}}>
            <h3>Bill From</h3>
            <div className="form-group"><label>Business Name</label><input className="input-field" name="bill_from_name" value={formData.bill_from_name} onChange={handleChange}/></div>
            <div className="form-group"><label>Email</label><input className="input-field" type="email" name="bill_from_email" value={formData.bill_from_email} onChange={handleChange}/></div>
            <div className="form-group"><label>Address</label><textarea className="input-field" rows="3" name="bill_from_address" value={formData.bill_from_address} onChange={handleChange}/></div>
            <div className="form-group"><label>Phone</label><input className="input-field" name="bill_from_phone" value={formData.bill_from_phone} onChange={handleChange}/></div>
          </div>

          <div className="form-section" style={{flex:1}}>
            <h3>Bill To</h3>
            <div className="form-group"><label>Client Name</label><input className="input-field" name="client_name" value={formData.client_name} onChange={handleChange} required/></div>
            <div className="form-group"><label>Client Email</label><input className="input-field" type="email" name="client_email" value={formData.client_email} onChange={handleChange}/></div>
            <div className="form-group"><label>Client Address</label><textarea className="input-field" rows="3" name="client_address" value={formData.client_address} onChange={handleChange}/></div>
            <div className="form-group"><label>Client Phone</label><input className="input-field" name="client_phone" value={formData.client_phone} onChange={handleChange}/></div>
          </div>
        </div>

        <div className="form-section">
           <div className="form-row">
            <div className="form-group" style={{flex:2}}>
              <label>Service Description</label>
              <input className="input-field" name="service_details" value={formData.service_details} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label>Amount (Subtotal)</label>
              <input className="input-field" type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} required/>
            </div>
            <div className="form-group" style={{flex:1}}>
              <label>Amount Paid</label>
              <input className="input-field" type="number" step="0.01" name="amount_paid" value={formData.amount_paid} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', alignItems: 'flex-end', paddingRight: '1rem' }}>
             <div style={{ color: 'var(--text-muted)' }}>Subtotal: {formData.currency}{currentAmount.toFixed(2)}</div>
             {currentTax > 0 && <div style={{ color: 'var(--text-muted)' }}>Tax ({formData.tax_rate}%): {formData.currency}{currentTax.toFixed(2)}</div>}
             {amountPaid > 0 && <div style={{ color: 'var(--text-muted)' }}>Amount Paid: -{formData.currency}{amountPaid.toFixed(2)}</div>}
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance Due:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: balanceDue > 0 ? 'var(--warning-text)' : 'var(--success-text)', textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
              {formData.currency}{balanceDue.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-4" style={{justifyContent: 'flex-end', marginTop:'1rem', paddingBottom:'2rem'}}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save Invoice</button>
        </div>

      </form>
    </div>
  );
}
