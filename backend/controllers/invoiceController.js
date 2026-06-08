const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const User = require('../models/User');
const path = require('path');

const generatePDF = async (doc, booking, invoice) => {
  doc.font('Helvetica');

  const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'company-logo.png');
  try {
    doc.image(logoPath, 50, 45, { height: 40 });
  } catch (err) {
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(22).text('Absolute Veritas', 50, 50);
  }

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(28).text('INVOICE', 50, 45, { align: 'right' });
  doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('Global Inspection Services', 50, 90, { align: 'right' });
  doc.text('cs@absoluteveritas.com', 50, 105, { align: 'right' });

  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 135).lineTo(550, 135).stroke();

  const topInfoY = 160;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#94a3b8').text('INVOICE NO.', 50, topInfoY);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(invoice.invoiceId, 50, topInfoY + 14);

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#94a3b8').text('DATE ISSUED', 210, topInfoY);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 210, topInfoY + 14);

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#94a3b8').text('BOOKING STATUS', 400, topInfoY);
  const status = (booking.status || 'pending').replace('_', ' ').toUpperCase();
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(status, 400, topInfoY + 14);

  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 215).lineTo(550, 215).stroke();

  const billY = 235;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#94a3b8').text('BILLED TO', 50, billY);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(booking.userId?.name || 'N/A', 50, billY + 16);
  doc.font('Helvetica').fontSize(10).fillColor('#475569').text(booking.userId?.email || 'N/A', 50, billY + 32);
  if (booking.userId?.phone) {
    doc.text(booking.userId.phone, 50, billY + 47);
  }

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#94a3b8').text('SERVICE', 330, billY);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(booking.service?.name || 'Inspection Service', 330, billY + 16, { width: 220 });
  const serviceNameHeight = doc.heightOfString(booking.service?.name || 'Inspection Service', { width: 220 });
  doc.font('Helvetica').fontSize(10).fillColor('#475569').text(`Product: ${booking.product?.name || 'N/A'}`, 330, billY + 16 + serviceNameHeight + 4, { width: 220 });

  const tableTopY = 340;

  doc.rect(50, tableTopY, 500, 28).fill('#f1f5f9');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569');
  doc.text('DESCRIPTION', 65, tableTopY + 9);
  doc.text('QTY / DETAILS', 260, tableTopY + 9);
  doc.text('UNIT PRICE', 390, tableTopY + 9);
  doc.text('TOTAL', 480, tableTopY + 9, { width: 60, align: 'right' });

  let rowY = tableTopY + 40;

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text(booking.service?.name || 'Inspection Service', 65, rowY, { width: 185 });

  doc.font('Helvetica').fontSize(9).fillColor('#64748b');
  if (booking.aql?.lotSize) {
    doc.text(`Lot size: ${booking.aql.lotSize.toLocaleString()} units`, 260, rowY);
    rowY += 14;
  }
  if (booking.aql?.sampleSize) {
    doc.text(`Sample: ${booking.aql.sampleSize} units`, 260, rowY);
    rowY += 14;
  }
  if (booking.aql?.inspectionLevel) {
    doc.text(`Level: ${booking.aql.inspectionLevel}`, 260, rowY);
    rowY += 14;
  }
  if (booking.aql?.strictnessMode) {
    doc.text(`Mode: ${booking.aql.strictnessMode}`, 260, rowY);
    rowY += 14;
  }

  const lineItemY = tableTopY + 40;
  doc.font('Helvetica').fontSize(10).fillColor('#475569').text('—', 390, lineItemY);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text(
    `$${booking.service?.totalAmount?.toFixed(2) || '0.00'}`,
    480, lineItemY, { width: 60, align: 'right' }
  );

  const dividerY = Math.max(rowY, lineItemY + 20) + 10;
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, dividerY).lineTo(550, dividerY).stroke();

  const totalY = dividerY + 20;
  doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('Subtotal', 350, totalY);
  doc.font('Helvetica').fontSize(10).fillColor('#0f172a').text(
    `$${booking.service?.totalAmount?.toFixed(2) || '0.00'}`,
    480, totalY, { width: 60, align: 'right' }
  );

  doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('Tax (0%)', 350, totalY + 18);
  doc.font('Helvetica').fontSize(10).fillColor('#0f172a').text('$0.00', 480, totalY + 18, { width: 60, align: 'right' });

  const grandTotalY = totalY + 44;
  doc.rect(330, grandTotalY, 220, 34).fill('#0f172a');
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff').text('TOTAL DUE', 345, grandTotalY + 10);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#ffffff').text(
    `$${booking.service?.totalAmount?.toFixed(2) || '0.00'}`,
    345, grandTotalY + 8, { width: 190, align: 'right' }
  );

  const noteY = grandTotalY + 60;
  doc.rect(50, noteY, 500, 50).fill('#f8fafc');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569').text('DOSSIER REFERENCE', 65, noteY + 10);
  doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(booking._id.toString().toUpperCase(), 65, noteY + 24);

  const footerY = 730;
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, footerY).lineTo(550, footerY).stroke();
  doc.font('Helvetica').fontSize(8).fillColor('#94a3b8');
  doc.text('This is a computer-generated document and does not require a physical signature.', 50, footerY + 12, { align: 'center', width: 500 });
  doc.text(`Absolute Veritas Ltd.  ·  Global Inspection Services  ·  © ${new Date().getFullYear()}`, 50, footerY + 25, { align: 'center', width: 500 });

  doc.end();
};

const createInvoiceRecord = async (booking) => {
  let invoice = await Invoice.findOne({ bookingId: booking._id });
  if (!invoice) {
    const year = new Date().getFullYear();
    const count = await Invoice.countDocuments();
    const invoiceId = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;
    invoice = await Invoice.create({
      invoiceId,
      userId: booking.userId._id,
      bookingId: booking._id,
      amount: booking.service?.totalAmount,
      paymentStatus: booking.payment?.status === 'paid' ? 'COMPLETED' : 'PENDING',
    });
  }
  return invoice;
};

exports.downloadInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('userId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const invoice = await createInvoiceRecord(booking);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceId}.pdf`);
    doc.pipe(res);

    await generatePDF(doc, booking, invoice);
  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
};

exports.directDownload = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('userId');
    if (!booking) return res.status(404).send('Invoice not found');

    const invoice = await createInvoiceRecord(booking);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceId}.pdf`);
    doc.pipe(res);

    await generatePDF(doc, booking, invoice);
  } catch (error) {
    console.error('Direct download error:', error);
    res.status(500).send('Internal Server Error');
  }
};
