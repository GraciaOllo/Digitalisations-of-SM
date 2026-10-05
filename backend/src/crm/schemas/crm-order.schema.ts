import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum CRMOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export type CRMOrderDocument = HydratedDocument<CRMOrder>;

@Schema({ timestamps: true })
export class CRMOrder {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  customerName!: string;

  @Prop({ required: true })
  number!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true, min: 0 })
  total!: number;

  @Prop({ enum: CRMOrderStatus, default: CRMOrderStatus.DRAFT })
  status!: CRMOrderStatus;

  @Prop()
  expectedAt?: Date;
}

export const CRMOrderSchema = SchemaFactory.createForClass(CRMOrder);
CRMOrderSchema.index({ companyId: 1, status: 1, createdAt: -1 });
CRMOrderSchema.index({ companyId: 1, number: 1 }, { unique: true });