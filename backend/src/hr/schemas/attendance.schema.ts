import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  employeeId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  workDate!: Date;

  @Prop({ required: true })
  checkedInAt!: Date;

  @Prop()
  checkedOutAt?: Date;

  @Prop({ min: 0, default: 0 })
  breakMinutes!: number;

  @Prop({ min: 0, default: 0 })
  workedMinutes!: number;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ companyId: 1, employeeId: 1, workDate: 1 }, { unique: true });