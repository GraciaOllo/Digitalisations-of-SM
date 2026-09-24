import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { EmployeesController } from './employees.controller';

@Module({ imports: [UsersModule], controllers: [EmployeesController] })
export class EmployeesModule {}
