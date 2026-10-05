import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MessageChannel {
  EMAIL = 'email',
  SMS = 'sms',
}

export type MessageTemplateDocument = HydratedDocument<MessageTemplate>;

@Schema({ timestamps: true })
export class MessageTemplate {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ enum: MessageChannel, required: true })
  channel!: MessageChannel;

  @Prop({ trim: true })
  subject?: string;

  @Prop({ required: true, trim: true })
  body!: string;
}

export const MessageTemplateSchema = SchemaFactory.createForClass(MessageTemplate);
MessageTemplateSchema.index({ companyId: 1, channel: 1, name: 1 }, { unique: true });