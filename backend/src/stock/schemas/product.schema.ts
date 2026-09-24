import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  sku?: string;

  @Prop({ trim: true })
  category?: string;

  @Prop({ default: 0, min: 0 })
  quantity!: number;

  @Prop({ default: 0, min: 0 })
  lowStockThreshold!: number;

  @Prop({ default: 0, min: 0 })
  unitPrice!: number;

  @Prop({ default: 'unit' })
  unit!: string;

  @Prop({ default: 'XAF' })
  currency!: string;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop()
  deletedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ companyId: 1, sku: 1 }, { unique: true, sparse: true });
ProductSchema.index({ companyId: 1, name: 1 });
