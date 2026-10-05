import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/roles.constant';
import { ClockInDto, ClockOutDto, CreateLeaveRequestDto, ReviewLeaveRequestDto } from './dto/hr.dto';
import { HRService } from './hr.service';

const teamRoles = [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.HR];

@ApiTags('HR')
@ApiBearerAuth()
@Controller('hr')
export class HRController {
  constructor(private readonly hr: HRService) {}

  @Get('team')
  @Roles(...teamRoles)
  @ApiOperation({ summary: 'List active employees for task assignment' })
  team(@CurrentUser() user: any) {
    return this.hr.team(user.companyId);
  }

  @Post('attendance/clock-in')
  @ApiOperation({ summary: 'Start today’s attendance shift' })
  clockIn(@CurrentUser() user: any, @Body() dto: ClockInDto) {
    return this.hr.clockIn(user.companyId, user.sub, dto);
  }

  @Post('attendance/clock-out')
  @ApiOperation({ summary: 'End today’s attendance shift' })
  clockOut(@CurrentUser() user: any, @Body() dto: ClockOutDto) {
    return this.hr.clockOut(user.companyId, user.sub, dto);
  }

  @Get('attendance/mine')
  @ApiOperation({ summary: 'List my attendance records' })
  myAttendance(@CurrentUser() user: any, @Query('month') month?: string) {
    return this.hr.myAttendance(user.companyId, user.sub, month);
  }

  @Get('attendance/team')
  @Roles(...teamRoles)
  @ApiOperation({ summary: 'List company attendance records for a month' })
  teamAttendance(@CurrentUser() user: any, @Query('month') month?: string) {
    return this.hr.teamAttendance(user.companyId, month);
  }

  @Post('leaves')
  @ApiOperation({ summary: 'Submit a leave request' })
  createLeave(@CurrentUser() user: any, @Body() dto: CreateLeaveRequestDto) {
    return this.hr.createLeave(user.companyId, user.sub, dto);
  }

  @Get('leaves/mine')
  @ApiOperation({ summary: 'List my leave requests' })
  myLeaves(@CurrentUser() user: any) {
    return this.hr.myLeaves(user.companyId, user.sub);
  }

  @Get('leaves/team')
  @Roles(...teamRoles)
  @ApiOperation({ summary: 'List company leave requests' })
  teamLeaves(@CurrentUser() user: any) {
    return this.hr.teamLeaves(user.companyId);
  }

  @Patch('leaves/:id/review')
  @Roles(...teamRoles)
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  reviewLeave(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: ReviewLeaveRequestDto) {
    return this.hr.reviewLeave(user.companyId, user.sub, id, dto);
  }

  @Get('payroll')
  @Roles(...teamRoles)
  @ApiOperation({ summary: 'Aggregate monthly hours and gross hourly payroll' })
  payroll(@CurrentUser() user: any, @Query('month') month: string) {
    return this.hr.payroll(user.companyId, month);
  }
}