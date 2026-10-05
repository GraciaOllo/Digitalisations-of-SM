import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum OperationKind {
  TASK = 'task',
  PROJECT = 'project',
  NOTE = 'note',
  EVENT = 'event',
}

export enum OperationStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum OperationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export enum OperationEventType {
  APPOINTMENT = 'appointment',
  DELIVERY = 'delivery',
  MEETING = 'meeting',
}

export type OperationDocument = HydratedDocument<Operation>;

@Schema({ timestamps: true })
export class Operation {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ required: true, enum: OperationKind, index: true })
  kind!: OperationKind;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ enum: OperationStatus, default: OperationStatus.TODO })
  status!: OperationStatus;

  @Prop({ enum: OperationPriority, default: OperationPriority.NORMAL })
  priority!: OperationPriority;

  @Prop({ enum: OperationEventType })
  eventType?: OperationEventType;

  @Prop()
  dueAt?: Date;

  @Prop()
  scheduledAt?: Date;
}

export const OperationSchema = SchemaFactory.createForClass(Operation);
OperationSchema.index({ companyId: 1, kind: 1, dueAt: 1, scheduledAt: 1 });