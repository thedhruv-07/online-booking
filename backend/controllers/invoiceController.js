const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const User = require('../models/User');
const path = require('path');

/**
 * Internal helper to generate PDF
 */
const generatePDF = async (doc, booking, invoice) => {
  // Header with Logo
  const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'company-logo.png');
  try {
    doc.image(logoPath, 50, 45, { height: 40 });
  } catch (err) {
    console.error('Logo not found for PDF, using text fallback');
    doc.fillColor('#4f46e5').fontSize(20).text('Absolute Veritas', 50, 50);
  }
  
  doc.fillColor('#444444').fontSize(20).text('INVOICE', { align: 'right' });
  doc.fontSize(10).text('Global Inspection Services', 50, 90);
  doc.text('support@absoluteveritas.com', 50, 105);
  doc.moveDown();

  // Horizontal Line
  doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, 130).lineTo(550, 130).stroke();
  doc.moveDown(2);

  // Invoice Meta
  doc.fontSize(10).fillColor('#666666');
  doc.text(`Invoice ID:`, 50, 150);
  doc.fillColor('#000000').text(invoice.invoiceId, 150, 150);
  
  doc.fillColor('#666666').text(`Date:`, 50, 165);
  doc.fillColor('#000000').text(new Date(invoice.createdAt).toLocaleDateString(), 150, 165);
  
  doc.fillColor('#666666').text(`Booking ID:`, 50, 180);
  doc.fillColor('#000000').text(booking._id.toString(), 150, 180);

  // Customer Details
  doc.moveDown(2);
  doc.fontSize(12).fillColor('#4f46e5').text('CUSTOMER DETAILS', 50, 210);
  doc.fontSize(10).fillColor('#000000');
  doc.text(`Name: ${booking.userId.name}`, 50, 230);
  doc.text(`Email: ${booking.userId.email}`, 50, 245);
  doc.text(`Phone: ${booking.userId.phone || 'N/A'}`, 50, 260);

  // Booking Section
  doc.fontSize(12).fillColor('#4f46e5').text('BOOKING SUMMARY', 300, 210);
  doc.fontSize(10).fillColor('#000000');
  doc.text(`Service: ${booking.service?.name || 'Inspection'}`, 300, 230);
  doc.text(`Product: ${booking.product?.name || 'N/A'}`, 300, 245);
  doc.text(`Status: ${booking.status.toUpperCase()}`, 300, 260);

  // Table Header
  doc.moveDown(4);
  const tableTop = 300;
  doc.fillColor('#f8fafc').rect(50, tableTop, 500, 25).fill();
  doc.fillColor('#64748b').fontSize(10).text('DESCRIPTION', 60, tableTop + 8);
  doc.text('DETAILS', 200, tableTop + 8);
  doc.text('AMOUNT', 480, tableTop + 8);

  // Table Content
  let currentY = tableTop + 35;
  
  // Service
  doc.fillColor('#000000').text(booking.service?.name || 'Inspection Service', 60, currentY);
  doc.text('Base Inspection Fee', 200, currentY);
  doc.text(`$${booking.service?.price?.toFixed(2) || '0.00'}`, 480, currentY);
  
  // AQL Details
  currentY += 25;
  doc.fontSize(8).fillColor('#666666').text('Lot Size:', 200, currentY);
  doc.fillColor('#000000').text(`${booking.aql?.lotSize || 'N/A'} units`, 280, currentY);
  
  currentY += 15;
  doc.fillColor('#666666').text('Strictness:', 200, currentY);
  doc.fillColor('#000000').text(booking.aql?.strictnessMode || 'Standard', 280, currentY);
  
  currentY += 15;
  doc.fillColor('#666666').text('Sample Size:', 200, currentY);
  doc.fillColor('#000000').text(`${booking.aql?.sampleSize || 'N/A'} units to be checked`, 280, currentY);

  // Total
  currentY += 40;
  doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, currentY).lineTo(550, currentY).stroke();
  currentY += 15;
  doc.fontSize(12).fillColor('#000000').text('TOTAL AMOUNT', 350, currentY);
  doc.fontSize(16).fillColor('#4f46e5').text(`$${booking.totalAmount?.toFixed(2)}`, 470, currentY - 3);

  // Footer
  const bottomY = 700;
  doc.fontSize(8).fillColor('#999999').text('This is a computer-generated invoice and does not require a signature.', 50, bottomY, { align: 'center', width: 500 });
  doc.text('Absolute Veritas Ltd. © 2026', 50, bottomY + 15, { align: 'center', width: 500 });

  doc.end();
};

/**
 * Generate and download PDF Invoice (Authenticated)
 * GET /api/invoice/:bookingId
 */
exports.downloadInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('userId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let invoice = await Invoice.findOne({ bookingId });
    if (!invoice) {
      const year = new Date().getFullYear();
      const count = await Invoice.countDocuments();
      const invoiceId = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;
      invoice = await Invoice.create({
        invoiceId,
        userId: booking.userId._id,
        bookingId: booking._id,
        amount: booking.totalAmount,
        paymentStatus: booking.paymentStatus === 'paid' ? 'COMPLETED' : 'PENDING'
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceId}.pdf`);
    doc.pipe(res);

    await generatePDF(doc, booking, invoice);
  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
};

/**
 * Direct Download for Email Links (Public with validation)
 * GET /api/invoice/download/:bookingId
 */
exports.directDownload = async (req, res) => {
  try {
    const { bookingId } = req.params;
    // Note: In a production app, you might want to verify a token here
    // for now we'll allow direct download via bookingId as requested.

    const booking = await Booking.findById(bookingId).populate('userId');
    if (!booking) return res.status(404).send('Invoice not found');

    let invoice = await Invoice.findOne({ bookingId });
    if (!invoice) {
      const year = new Date().getFullYear();
      const count = await Invoice.countDocuments();
      const invoiceId = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;
      invoice = await Invoice.create({
        invoiceId,
        userId: booking.userId._id,
        bookingId: booking._id,
        amount: booking.totalAmount,
        paymentStatus: booking.paymentStatus === 'paid' ? 'COMPLETED' : 'PENDING'
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceId}.pdf`);
    doc.pipe(res);

    await generatePDF(doc, booking, invoice);
  } catch (error) {
    console.error('Direct download error:', error);
    res.status(500).send('Internal Server Error');
  }
};
