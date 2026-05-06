const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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
    amount, amount_paid, service_details, is_paid,
    currency, tax_type, tax_rate, tax_amount
  } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO invoices (
        user_id, invoice_number, invoice_date, due_date,
        bill_from_name, bill_from_email, bill_from_address, bill_from_phone,
        client_name, client_email, client_address, client_phone,
        amount, amount_paid, service_details, is_paid,
        currency, tax_type, tax_rate, tax_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      req.user.id, invoice_number, invoice_date, due_date,
      bill_from_name || '', bill_from_email || '', bill_from_address || '', bill_from_phone || '',
      client_name || '', client_email || '', client_address || '', client_phone || '',
      amount || 0, amount_paid || 0, service_details || '', is_paid ? 1 : 0,
      currency || '$', tax_type || 'None', tax_rate || 0, tax_amount || 0
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
    amount, amount_paid, service_details, is_paid,
    currency, tax_type, tax_rate, tax_amount
  } = req.body;
  
  try {
    const stmt = db.prepare(`
      UPDATE invoices SET 
        invoice_number=?, invoice_date=?, due_date=?,
        bill_from_name=?, bill_from_email=?, bill_from_address=?, bill_from_phone=?,
        client_name=?, client_email=?, client_address=?, client_phone=?,
        amount=?, amount_paid=?, service_details=?, is_paid=?,
        currency=?, tax_type=?, tax_rate=?, tax_amount=?
      WHERE id = ? AND user_id = ?
    `);
    const info = stmt.run(
      invoice_number, invoice_date, due_date,
      bill_from_name || '', bill_from_email || '', bill_from_address || '', bill_from_phone || '',
      client_name || '', client_email || '', client_address || '', client_phone || '',
      amount || 0, amount_paid || 0, service_details || '', is_paid ? 1 : 0, 
      currency || '$', tax_type || 'None', tax_rate || 0, tax_amount || 0,
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

router.post('/:id/send', authenticate, async (req, res) => {
  const { to, subject, message } = req.body;
  
  try {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Using Ethereal for testing purposes since it requires no real credentials
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });

    const info = await transporter.sendMail({
      from: Object.hasOwn(invoice, 'bill_from_email') && invoice.bill_from_email ? invoice.bill_from_email : '"Invoice Generator" <no-reply@example.com>',
      to: to || invoice.client_email,
      subject: subject || `Invoice #${invoice.invoice_number} from ${invoice.bill_from_name || 'Your Company'}`,
      text: message || `Hi ${invoice.client_name},\n\nPlease find your latest invoice attached.\n\nThank you!`,
      html: `<div>
                <h2>Hello ${invoice.client_name},</h2>
                <p>${message ? message.replace(/\n/g, '<br/>') : 'Please find your latest invoice details below.'}</p>
                <div style="border: 1px solid #ddd; padding: 15px; margin-top: 15px;">
                  <h3>Invoice #${invoice.invoice_number}</h3>
                  <p><strong>Amount Due:</strong> $${invoice.amount}</p>
                  <p><strong>Due Date:</strong> ${invoice.due_date}</p>
                </div>
             </div>`
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.json({ message: 'Email queued for sending', previewUrl: nodemailer.getTestMessageUrl(info) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
