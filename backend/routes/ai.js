const express = require('express');
const router = express.Router();

router.post('/extract', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  // Naive Mock AI Extraction matching the new DB fields
  const result = {
    invoice_number: 'INV-' + Math.floor(1000 + Math.random() * 9000),
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // 7 days from now
    bill_from_name: 'GammaFlow Solutions',
    bill_from_email: 'billing@gammaflow.example.org',
    bill_from_address: '300 Creative Street, Placeholder City, NY',
    bill_from_phone: '123-456-7890',
    client_name: 'Unknown Client',
    client_email: 'client@example.com',
    client_address: '123 Client Rd',
    client_phone: '098-765-4321',
    amount: 0,
    service_details: text
  };

  // Extract amount
  const amountMatch = text.match(/[\$₹€£]?\s?(\d+(?:,\d+)?)/);
  if (amountMatch) result.amount = parseInt(amountMatch[1].replace(/,/g, ''), 10);

  // Extract client name
  const clientMatch = text.match(/client\s+([a-zA-Z0-9\s]+?)\s*-/i);
  if (clientMatch) {
    result.client_name = clientMatch[1].trim();
  } else {
    let firstPart = text.split('-')[0];
    if (firstPart) {
      firstPart = firstPart.replace(/client/i, '');
      firstPart = firstPart.replace(/am[m]?ount.*/i, '');
      if (amountMatch) {
        firstPart = firstPart.replace(amountMatch[0], '');
      }
      result.client_name = firstPart.trim();
    }
  }

  // Extract service details
  const parts = text.split('-');
  if (parts.length >= 3) {
    result.service_details = parts[1].trim();
  } else {
    let desc = text.replace(/am[m]?ount.*/i, '');
    if (amountMatch) {
      desc = desc.replace(amountMatch[0], '');
    }
    result.service_details = desc.trim();
  }

  setTimeout(() => {
    res.json(result);
  }, 1000); 
});

router.post('/reminder', (req, res) => {
  const { invoice } = req.body;
  if (!invoice) return res.status(400).json({ error: 'Invoice data required' });
  const draft = `Subject: Payment Reminder - Invoice #${invoice.invoice_number} for ${invoice.service_details}\n\nDear ${invoice.client_name},\n\nThis is a gentle reminder that the payment of ₹${invoice.amount} for "${invoice.service_details}" is due on ${invoice.due_date}.\n\nPlease arrange the payment at your earliest convenience.\n\nBest regards,\n${invoice.bill_from_name || 'Your Account Team'}`;
  setTimeout(() => res.json({ emailDraft: draft }), 1000);
});

module.exports = router;
