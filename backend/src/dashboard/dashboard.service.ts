import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument, InvoiceStatus, InvoiceType } from '../invoicing/schemas/invoice.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async getBusinessHealth(companyId: string) {
    const companyObjectId = new Types.ObjectId(companyId);

    const [overdueCount, unpaidAmount, totalInvoices, paidLast30Days] = await Promise.all([
      this.invoiceModel.countDocuments({
        companyId: companyObjectId,
        type: InvoiceType.INVOICE,
        status: InvoiceStatus.OVERDUE,
        isDeleted: false,
      }),
      this.invoiceModel.aggregate([
        {
          $match: {
            companyId: companyObjectId,
            type: InvoiceType.INVOICE,
            status: { $in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
            isDeleted: false,
          },
        },
        { $group: { _id: null, total: { $sum: '$amountDue' } } },
      ]),
      this.invoiceModel.countDocuments({
        companyId: companyObjectId,
        type: InvoiceType.INVOICE,
        isDeleted: false,
      }),
      this.invoiceModel.aggregate([
        {
          $match: {
            companyId: companyObjectId,
            type: InvoiceType.INVOICE,
            status: InvoiceStatus.PAID,
            updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            isDeleted: false,
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const unpaid = unpaidAmount[0]?.total || 0;
    const paid30 = paidLast30Days[0]?.total || 0;

    // Score simple mais parlant (0-100)
    let score = 100;
    if (overdueCount > 0) score -= Math.min(overdueCount * 8, 40);
    if (unpaid > 500000) score -= 15;
    if (unpaid > 1500000) score -= 15;
    if (totalInvoices === 0) score = 50;
    if (paid30 > 0) score += 5;

    score = Math.max(0, Math.min(100, score));

    let label = 'Excellent';
    let color = 'emerald';
    if (score < 40) { label = 'Critique'; color = 'red'; }
    else if (score < 60) { label = 'À surveiller'; color = 'amber'; }
    else if (score < 80) { label = 'Correct'; color = 'blue'; }

    return {
      score,
      label,
      color,
      overdueInvoices: overdueCount,
      unpaidAmount: unpaid,
      paidLast30Days: paid30,
    };
  }

  // Génère le lien WhatsApp pour une facture
  generateWhatsAppLink(phone: string, message: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('237') ? cleanPhone : `237${cleanPhone}`;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  }
}