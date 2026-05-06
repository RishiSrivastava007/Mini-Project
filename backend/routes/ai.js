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

  // Robust AI Extraction Logic
  const extractField = (keywords, textStr) => {
    const keywordPattern = keywords.join('|');
    const allKeywords = '(?:Client Name|Client|Customer|Bill To|Date|Item|Service|Amount|Total|Quantity|Email|Phone|Address)';
    const regex = new RegExp(`(?:${keywordPattern})\\s*[:\\-]?\\s*([\\s\\S]*?)(?=${allKeywords}\\s*[:\\-]|$)`, 'i');
    const match = textStr.match(regex);
    return match ? match[1].trim() : null;
  };

  const clientMatch = extractField(['Client Name', 'Client', 'Bill To', 'Customer'], text);
  if (clientMatch) {
    result.client_name = clientMatch.replace(/^[:\-]\s*/, '');
  } else {
    // Fallback logic
    const parts = text.split('-');
    if (parts.length >= 2) {
      result.client_name = parts[0].trim().replace(/client/i, '').replace(/^[:\-]\s*/, '');
    }
  }

  const serviceMatch = extractField(['Item', 'Service', 'Description', 'Task', 'Service Details'], text);
  if (serviceMatch) {
    result.service_details = serviceMatch.replace(/^[:\-]\s*/, '');
  } else {
    const parts = text.split('-');
    if (parts.length >= 3) {
      result.service_details = parts[1].trim();
    }
  }

  const amountMatchExp = extractField(['Amount', 'Total', 'Cost', 'Price', 'Fee'], text);
  if (amountMatchExp) {
    result.amount = parseFloat(amountMatchExp.replace(/[^\d.]/g, '')) || 0;
  } else {
    // Fallback amount matching
    const fallbackAmountMatch = text.match(/[\$₹€£]?\s?(\d+(?:,\d+)?)/);
    if (fallbackAmountMatch) result.amount = parseInt(fallbackAmountMatch[1].replace(/,/g, ''), 10);
  }
  
  if (result.client_name === '' || result.client_name.length > 50) {
    result.client_name = 'Unknown Client';
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
