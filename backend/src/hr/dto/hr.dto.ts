import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { LeaveKind, LeaveStatus } from '../schemas/leave-request.schema';

export class ClockInDto {
  @IsOptional() @IsInt() @Min(0) @Max(720) breakMinutes?: number;
}

export class ClockOutDto {
  @IsOptional() @IsInt() @Min(0) @Max(720) breakMinutes?: number;
}

export class CreateLeaveRequestDto {
  @IsEnum(LeaveKind) kind!: LeaveKind;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsString() @IsNotEmpty() reason!: string;
}

export class ReviewLeaveRequestDto {
  @IsEnum(LeaveStatus) status!: LeaveStatus;
  @IsOptional() @IsString() reviewNote?: string;
}