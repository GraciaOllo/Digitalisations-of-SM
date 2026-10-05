import { IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { UserRole } from '../../common/constants/roles.constant';

export class CreateEmployeeDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsArray() @IsString({ each: true }) permissions?: string[];
  @IsOptional() @IsNumber() @Min(0) hourlyRate?: number;
}

export class UpdateEmployeeDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsArray() @IsString({ each: true }) permissions?: string[];
  @IsOptional() isActive?: boolean;
  @IsOptional() @IsNumber() @Min(0) hourlyRate?: number;
}

export class UpdateOwnProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
}
