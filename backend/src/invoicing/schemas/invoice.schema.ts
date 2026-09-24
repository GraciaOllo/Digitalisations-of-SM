import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InvoiceDocument = HydratedDocument<Invoice>;

export enum InvoiceType {
  QUOTE = 'quote',
  INVOICE = 'invoice',
  CREDIT_NOTE = 'credit_note',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Schema({ _id: false })
export class InvoiceItem {
  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true, min: 0 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  unitPrice!: number;

  @Prop({ default: 0, min: 0 })
  taxRate!: number; // percentage e.g. 19.25

  @Prop({ required: true, min: 0 })
  subtotal!: number; // quantity * unitPrice

  @Prop({ required: true, min: 0 })
  taxAmount!: number;

  @Prop({ required: true, min: 0 })
  total!: number;
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId!: Types.ObjectId;

  @Prop({ enum: InvoiceType, required: true })
  type!: InvoiceType;

  @Prop({ required: true, trim: true })
  number!: string; // QUO-2026-000001 / INV-2026-000001 / CN-2026-000001

  @Prop({ enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status!: InvoiceStatus;

  @Prop({ type: Date, default: Date.now })
  issueDate!: Date;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: [InvoiceItem], default: [] })
  items!: InvoiceItem[];

  @Prop({ default: 0 })
  subtotal!: number;

  @Prop({ default: 0 })
  taxTotal!: number;

  @Prop({ default: 0 })
  total!: number;

  @Prop({ default: 0 })
  amountPaid!: number;

  @Prop({ default: 0 })
  amountDue!: number;

  @Prop({ default: 'XAF' })
  currency!: string;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ trim: true })
  terms?: string;

  @Prop({ type: Types.ObjectId, ref: 'Invoice' })
  relatedInvoiceId?: Types.ObjectId; // for credit notes linked to invoice

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop()
  deletedAt?: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ companyId: 1, number: 1 }, { unique: true });
InvoiceSchema.index({ companyId: 1, type: 1, status: 1 });
InvoiceSchema.index({ companyId: 1, customerId: 1 });
