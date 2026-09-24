import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument, InvoiceType, InvoiceStatus } from './schemas/invoice.schema';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class InvoicingService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  // ─── Customers ───────────────────────────────────────────────

  async createCustomer(companyId: string, dto: CreateCustomerDto) {
    return this.customerModel.create({
      ...dto,
      companyId: new Types.ObjectId(companyId),
    });
  }

  async findAllCustomers(companyId: string) {
    return this.customerModel
      .find({ companyId: new Types.ObjectId(companyId), isDeleted: false })
      .sort({ name: 1 })
      .lean();
  }

  async findCustomer(companyId: string, id: string) {
    const customer = await this.customerModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
      isDeleted: false,
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async updateCustomer(companyId: string, id: string, dto: CreateCustomerDto) {
    const customer = await this.customerModel.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId), isDeleted: false },
      dto,
      { new: true, runValidators: true },
    );
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async deleteCustomer(companyId: string, id: string) {
    const customer = await this.customerModel.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId), isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!customer) throw new NotFoundException('Customer not found');
    return { message: 'Customer deleted' };
  }

  // ─── Numbering ───────────────────────────────────────────────

  private async generateNumber(companyId: string, type: InvoiceType): Promise<string> {
    const year = new Date().getFullYear();
    const prefixMap = {
      [InvoiceType.QUOTE]: 'QUO',
      [InvoiceType.INVOICE]: 'INV',
      [InvoiceType.CREDIT_NOTE]: 'CN',
    };
    const prefix = `${prefixMap[type]}-${year}-`;

    const last = await this.invoiceModel
      .findOne({
        companyId,
        type,
        number: { $regex: `^${prefix}` },
      })
      .sort({ number: -1 })
      .select('number')
      .lean();

    let nextSeq = 1;
    if (last?.number) {
      const parts = last.number.split('-');
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) nextSeq = seq + 1;
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  // ─── Calculations ────────────────────────────────────────────

  private calculateItems(items: CreateInvoiceDto['items']) {
    let subtotal = 0;
    let taxTotal = 0;

    const calculatedItems = items.map((item) => {
      const taxRate = item.taxRate ?? 19.25;
      const lineSubtotal = item.quantity * item.unitPrice;
      const lineTax = (lineSubtotal * taxRate) / 100;
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      taxTotal += lineTax;

      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate,
        subtotal: Math.round(lineSubtotal),
        taxAmount: Math.round(lineTax),
        total: Math.round(lineTotal),
      };
    });

    const total = subtotal + taxTotal;

    return {
      items: calculatedItems,
      subtotal: Math.round(subtotal),
      taxTotal: Math.round(taxTotal),
      total: Math.round(total),
      amountDue: Math.round(total),
    };
  }

  // ─── Invoices / Quotes / Credit Notes ────────────────────────

  async create(companyId: string, userId: string, dto: CreateInvoiceDto) {
    // Validate customer belongs to company
    await this.findCustomer(companyId, dto.customerId);

    const number = await this.generateNumber(companyId, dto.type);
    const calc = this.calculateItems(dto.items);

    const doc = await this.invoiceModel.create({
      companyId: new Types.ObjectId(companyId),
      customerId: new Types.ObjectId(dto.customerId),
      type: dto.type,
      number,
      status: dto.status || InvoiceStatus.DRAFT,
      issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      items: calc.items,
      subtotal: calc.subtotal,
      taxTotal: calc.taxTotal,
      total: calc.total,
      amountPaid: 0,
      amountDue: calc.amountDue,
      currency: 'XAF',
      notes: dto.notes,
      terms: dto.terms,
      relatedInvoiceId: dto.relatedInvoiceId
        ? new Types.ObjectId(dto.relatedInvoiceId)
        : undefined,
      createdBy: new Types.ObjectId(userId),
    });

    return doc;
  }

  async findAll(
    companyId: string,
    filters: { type?: InvoiceType; status?: InvoiceStatus; page?: number; limit?: number } = {},
  ) {
    const query: any = { companyId, isDeleted: false };
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.invoiceModel
        .find(query)
        .populate('customerId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.invoiceModel.countDocuments(query),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(companyId: string, id: string) {
    const doc = await this.invoiceModel
      .findOne({ _id: id, companyId, isDeleted: false })
      .populate('customerId', 'name email phone address city taxId type')
      .lean();

    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(companyId: string, id: string, dto: UpdateInvoiceDto) {
    const doc = await this.invoiceModel.findOne({ _id: id, companyId, isDeleted: false });
    if (!doc) throw new NotFoundException('Document not found');

    if (doc.status === InvoiceStatus.PAID || doc.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a paid or cancelled document');
    }

    if (dto.items) {
      const calc = this.calculateItems(dto.items);
      doc.items = calc.items as any;
      doc.subtotal = calc.subtotal;
      doc.taxTotal = calc.taxTotal;
      doc.total = calc.total;
      doc.amountDue = calc.total - (doc.amountPaid || 0);
    }

    if (dto.status) doc.status = dto.status;
    if (dto.dueDate) doc.dueDate = new Date(dto.dueDate);
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.terms !== undefined) doc.terms = dto.terms;

    await doc.save();
    return doc;
  }

  async softDelete(companyId: string, id: string) {
    const doc = await this.invoiceModel.findOneAndUpdate(
      { _id: id, companyId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Document not found');
    return { message: 'Deleted successfully' };
  }

  async getStats(companyId: string) {
    const [invoices, quotes, creditNotes] = await Promise.all([
      this.invoiceModel.countDocuments({ companyId, type: InvoiceType.INVOICE, isDeleted: false }),
      this.invoiceModel.countDocuments({ companyId, type: InvoiceType.QUOTE, isDeleted: false }),
      this.invoiceModel.countDocuments({ companyId, type: InvoiceType.CREDIT_NOTE, isDeleted: false }),
    ]);

    const paidAgg = await this.invoiceModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId), type: InvoiceType.INVOICE, status: InvoiceStatus.PAID, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const pendingAgg = await this.invoiceModel.aggregate([
      {
        $match: {
          companyId: new Types.ObjectId(companyId),
          type: InvoiceType.INVOICE,
          status: { $in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
          isDeleted: false,
        },
      },
      { $group: { _id: null, total: { $sum: '$amountDue' } } },
    ]);

    return {
      invoicesCount: invoices,
      quotesCount: quotes,
      creditNotesCount: creditNotes,
      totalPaid: paidAgg[0]?.total || 0,
      totalPending: pendingAgg[0]?.total || 0,
    };
  }
}
