import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, trim: true }) name!: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) slug!: string;
  @Prop() email?: string;
  @Prop() phone?: string;
  @Prop() address?: string;
  @Prop({ default: 'CM' }) country!: string;
  @Prop({ default: 'XAF' }) currency!: string;
  @Prop({ enum: ['fr', 'en'], default: 'fr' }) defaultLanguage!: string;
  @Prop({ default: true }) isActive!: boolean;
  @Prop({ default: false }) isDeleted!: boolean;
  @Prop() deletedAt?: Date;
}
export const CompanySchema = SchemaFactory.createForClass(Company);
CompanySchema.index({ slug: 1 });
