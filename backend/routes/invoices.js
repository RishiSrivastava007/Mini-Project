const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/', authenticate, (req, res) => {
  try {
    const invoices = db.prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, (req, res) => {
  const { 
    invoice_number, invoice_date, due_date, 
    bill_from_name, bill_from_email, bill_from_address, bill_from_phone,
    client_name, client_email, client_address, client_phone,
    amount, service_details, is_paid 
  } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO invoices (
        user_id, invoice_number, invoice_date, due_date,
        bill_from_name, bill_from_email, bill_from_address, bill_from_phone,
        client_name, client_email, client_address, client_phone,
        amount, service_details, is_paid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      req.user.id, invoice_number, invoice_date, due_date,
      bill_from_name || '', bill_from_email || '', bill_from_address || '', bill_from_phone || '',
      client_name || '', client_email || '', client_address || '', client_phone || '',
      amount || 0, service_details || '', is_paid ? 1 : 0
    );
    const newInvoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ invoice: newInvoice, message: 'Invoice created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, (req, res) => {
  const { 
    invoice_number, invoice_date, due_date, 
    bill_from_name, bill_from_email, bill_from_address, bill_from_phone,
    client_name, client_email, client_address, client_phone,
    amount, service_details, is_paid 
  } = req.body;
  
  try {
    const stmt = db.prepare(`
      UPDATE invoices SET 
        invoice_number=?, invoice_date=?, due_date=?,
        bill_from_name=?, bill_from_email=?, bill_from_address=?, bill_from_phone=?,
        client_name=?, client_email=?, client_address=?, client_phone=?,
        amount=?, service_details=?, is_paid=?
      WHERE id = ? AND user_id = ?
    `);
    const info = stmt.run(
      invoice_number, invoice_date, due_date,
      bill_from_name || '', bill_from_email || '', bill_from_address || '', bill_from_phone || '',
      client_name || '', client_email || '', client_address || '', client_phone || '',
      amount || 0, service_details || '', is_paid ? 1 : 0, 
      req.params.id, req.user.id
    );
    
    if (info.changes === 0) return res.status(404).json({ error: 'Invoice not found' });
    const updatedInvoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    res.json({ invoice: updatedInvoice, message: 'Invoice updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM invoices WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
