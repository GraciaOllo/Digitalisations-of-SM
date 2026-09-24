import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../../common/constants/roles.constant';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ required: true, trim: true }) firstName!: string;
  @Prop({ required: true, trim: true }) lastName!: string;
  @Prop({ required: true, lowercase: true, trim: true }) email!: string;
  @Prop({ required: true }) password!: string;

  @Prop({ enum: UserRole, default: UserRole.EMPLOYEE })
  role!: UserRole;

  @Prop({ type: [String], default: [] }) permissions!: string[];
  @Prop({ default: true }) isActive!: boolean;
  @Prop({ default: false }) isDeleted!: boolean;
  @Prop() deletedAt?: Date;
  @Prop() refreshTokenHash?: string;
  @Prop() lastLoginAt?: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ companyId: 1, email: 1 }, { unique: true });
