import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum CustomerActivityType {
  NOTE = 'note',
  CALL = 'call',
  EMAIL = 'email',
  SMS = 'sms',
  MEETING = 'meeting',
}

export type CustomerActivityDocument = HydratedDocument<CustomerActivity>;

@Schema({ timestamps: true })
export class CustomerActivity {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ enum: CustomerActivityType, default: CustomerActivityType.NOTE })
  type!: CustomerActivityType;

  @Prop({ required: true, trim: true })
  content!: string;
}

export const CustomerActivitySchema = SchemaFactory.createForClass(CustomerActivity);
CustomerActivitySchema.index({ companyId: 1, customerId: 1, createdAt: -1 });