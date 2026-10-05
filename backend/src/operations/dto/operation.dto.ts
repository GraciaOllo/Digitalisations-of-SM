import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';
import { OperationEventType, OperationKind, OperationPriority, OperationStatus } from '../schemas/operation.schema';

export class CreateOperationDto {
  @IsEnum(OperationKind) kind!: OperationKind;
  @IsString() @MinLength(1) title!: string;
  @IsOptional() @IsMongoId() assignedTo?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(OperationStatus) status?: OperationStatus;
  @IsOptional() @IsEnum(OperationPriority) priority?: OperationPriority;
  @IsOptional() @IsEnum(OperationEventType) eventType?: OperationEventType;
  @IsOptional() @IsDateString() dueAt?: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
}

export class UpdateOperationDto {
  @IsOptional() @IsString() @MinLength(1) title?: string;
  @IsOptional() @IsString() assignedTo?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(OperationStatus) status?: OperationStatus;
  @IsOptional() @IsEnum(OperationPriority) priority?: OperationPriority;
  @IsOptional() @IsEnum(OperationEventType) eventType?: OperationEventType;
  @IsOptional() @IsDateString() dueAt?: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
}