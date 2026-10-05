import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CRMOrderStatus } from '../schemas/crm-order.schema';
import { CustomerActivityType } from '../schemas/customer-activity.schema';
import { LeadStage } from '../schemas/lead.schema';
import { MessageChannel } from '../schemas/message-template.schema';

export class CreateLeadDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsEnum(LeadStage) stage?: LeadStage;
  @IsOptional() @IsNumber() @Min(0) estimatedValue?: number;
  @IsOptional() @IsDateString() nextFollowUp?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateLeadDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsEnum(LeadStage) stage?: LeadStage;
  @IsOptional() @IsNumber() @Min(0) estimatedValue?: number;
  @IsOptional() @IsDateString() nextFollowUp?: string;
  @IsOptional() @IsString() notes?: string;
}

export class CreateCustomerActivityDto {
  @IsEnum(CustomerActivityType) type!: CustomerActivityType;
  @IsString() @IsNotEmpty() content!: string;
}

export class CreateCRMOrderDto {
  @IsString() @IsNotEmpty() customerId!: string;
  @IsString() @IsNotEmpty() description!: string;
  @IsNumber() @Min(0) total!: number;
  @IsOptional() @IsEnum(CRMOrderStatus) status?: CRMOrderStatus;
  @IsOptional() @IsDateString() expectedAt?: string;
}

export class UpdateCRMOrderDto {
  @IsOptional() @IsEnum(CRMOrderStatus) status?: CRMOrderStatus;
  @IsOptional() @IsDateString() expectedAt?: string;
}

export class CreateMessageTemplateDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsEnum(MessageChannel) channel!: MessageChannel;
  @IsOptional() @IsString() subject?: string;
  @IsString() @IsNotEmpty() body!: string;
}

export class UpdateMessageTemplateDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsEnum(MessageChannel) channel?: MessageChannel;
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() @IsNotEmpty() body?: string;
}