import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InvoiceList from '../components/InvoiceList';
import InvoiceForm from '../components/InvoiceForm';

export default function InvoicesPage({ isNew }) {
  const [invoices, setInvoices] = useState([]);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/invoices', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [isNew]);

  useEffect(() => {
    if (isNew) setEditingInvoice(null);
  }, [isNew]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  if (isNew || editingInvoice) {
    return (
      <InvoiceForm 
        invoice={editingInvoice} 
        onClose={() => {
          setEditingInvoice(null);
          window.location.href = '/invoices';
        }} 
        onSave={() => {
          window.location.href = '/invoices';
        }} 
      />
    );
  }

  return (
    <InvoiceList 
      invoices={invoices} 
      onEdit={setEditingInvoice} 
      onDelete={handleDelete} 
    />
  );
}
