import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum LeadStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  WON = 'won',
  LOST = 'lost',
}

export type LeadDocument = HydratedDocument<Lead>;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  companyName?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  source?: string;

  @Prop({ enum: LeadStage, default: LeadStage.NEW, index: true })
  stage!: LeadStage;

  @Prop({ min: 0 })
  estimatedValue?: number;

  @Prop()
  nextFollowUp?: Date;

  @Prop({ trim: true, default: '' })
  notes!: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ companyId: 1, stage: 1, nextFollowUp: 1 });