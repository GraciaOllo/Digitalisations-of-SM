import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum LeaveKind {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  UNPAID = 'unpaid',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export type LeaveRequestDocument = HydratedDocument<LeaveRequest>;

@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  employeeId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  decidedBy?: Types.ObjectId;

  @Prop({ enum: LeaveKind, required: true })
  kind!: LeaveKind;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ required: true, trim: true })
  reason!: string;

  @Prop({ enum: LeaveStatus, default: LeaveStatus.PENDING, index: true })
  status!: LeaveStatus;

  @Prop()
  decidedAt?: Date;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
LeaveRequestSchema.index({ companyId: 1, employeeId: 1, startDate: 1 });