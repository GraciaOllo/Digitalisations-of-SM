import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { LeaveRequest, LeaveRequestSchema } from './schemas/leave-request.schema';
import { HRController } from './hr.controller';
import { HRService } from './hr.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
    ]),
  ],
  controllers: [HRController],
  providers: [HRService],
})
export class HRModule {}