import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { ClockInDto, ClockOutDto, CreateLeaveRequestDto, ReviewLeaveRequestDto } from './dto/hr.dto';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { LeaveRequest, LeaveRequestDocument, LeaveStatus } from './schemas/leave-request.schema';

@Injectable()
export class HRService {
  constructor(
    @InjectModel(Attendance.name) private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(LeaveRequest.name) private readonly leaveModel: Model<LeaveRequestDocument>,
    private readonly users: UsersService,
  ) {}

  team(companyId: string) {
    return this.users.listCompanyUsers(companyId);
  }

  async clockIn(companyId: string, employeeId: string, data: ClockInDto) {
    const now = new Date();
    const workDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const query = { companyId: new Types.ObjectId(companyId), employeeId: new Types.ObjectId(employeeId), workDate };
    const existing = await this.attendanceModel.findOne(query);
    if (existing) throw new ConflictException('Attendance already exists for today');
    return this.attendanceModel.create({ ...query, checkedInAt: now, breakMinutes: data.breakMinutes || 0 });
  }

  async clockOut(companyId: string, employeeId: string, data: ClockOutDto) {
    const now = new Date();
    const workDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const entry = await this.attendanceModel.findOne({
      companyId: new Types.ObjectId(companyId),
      employeeId: new Types.ObjectId(employeeId),
      workDate,
      checkedOutAt: { $exists: false },
    });
    if (!entry) throw new NotFoundException('Open attendance entry not found');
    const breakMinutes = data.breakMinutes ?? entry.breakMinutes;
    const elapsedMinutes = Math.floor((now.getTime() - entry.checkedInAt.getTime()) / 60000);
    entry.checkedOutAt = now;
    entry.breakMinutes = breakMinutes;
    entry.workedMinutes = Math.max(0, elapsedMinutes - breakMinutes);
    return entry.save();
  }

  myAttendance(companyId: string, employeeId: string, month?: string) {
    return this.attendanceModel.find({
      ...this.monthFilter(companyId, month),
      employeeId: new Types.ObjectId(employeeId),
    }).sort({ workDate: -1 }).lean();
  }

  teamAttendance(companyId: string, month?: string) {
    return this.attendanceModel.find(this.monthFilter(companyId, month))
      .populate('employeeId', 'firstName lastName email hourlyRate')
      .sort({ workDate: -1 })
      .lean();
  }

  private monthFilter(companyId: string, month?: string) {
    const selectedMonth = month || new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(selectedMonth)) throw new BadRequestException('Month must use YYYY-MM format');
    const [year, monthNumber] = selectedMonth.split('-').map(Number);
    if (monthNumber < 1 || monthNumber > 12) throw new BadRequestException('Month is invalid');
    return {
      companyId: new Types.ObjectId(companyId),
      workDate: {
        $gte: new Date(Date.UTC(year, monthNumber - 1, 1)),
        $lt: new Date(Date.UTC(year, monthNumber, 1)),
      },
    };
  }

  async myLeaves(companyId: string, employeeId: string) {
    return this.leaveModel.find({
      companyId: new Types.ObjectId(companyId),
      employeeId: new Types.ObjectId(employeeId),
    }).sort({ createdAt: -1 }).lean();
  }

  teamLeaves(companyId: string) {
    return this.leaveModel.find({ companyId: new Types.ObjectId(companyId) })
      .populate('employeeId', 'firstName lastName email role')
      .populate('decidedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
  }

  async createLeave(companyId: string, employeeId: string, data: CreateLeaveRequestDto) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate < startDate) throw new BadRequestException('Leave end date must be on or after its start date');
    return this.leaveModel.create({
      companyId: new Types.ObjectId(companyId),
      employeeId: new Types.ObjectId(employeeId),
      kind: data.kind,
      startDate,
      endDate,
      reason: data.reason,
    });
  }

  async reviewLeave(companyId: string, reviewerId: string, leaveId: string, data: ReviewLeaveRequestDto) {
    const leave = await this.leaveModel.findOneAndUpdate(
      { _id: leaveId, companyId: new Types.ObjectId(companyId), status: LeaveStatus.PENDING },
      { $set: { status: data.status, decidedBy: new Types.ObjectId(reviewerId), decidedAt: new Date() } },
      { new: true, runValidators: true },
    );
    if (!leave) throw new NotFoundException('Pending leave request not found');
    return leave;
  }

  async payroll(companyId: string, month: string) {
    const attendance = await this.attendanceModel.find({
      ...this.monthFilter(companyId, month),
      checkedOutAt: { $exists: true },
    }).populate('employeeId', 'firstName lastName email hourlyRate').lean();
    const totals = new Map<string, { employeeId: string; firstName: string; lastName: string; email: string; hourlyRate: number; days: number; workedMinutes: number }>();

    for (const entry of attendance) {
      const employee = entry.employeeId as unknown as { _id: Types.ObjectId; firstName: string; lastName: string; email: string; hourlyRate?: number };
      if (!employee?._id) continue;
      const id = employee._id.toString();
      const row = totals.get(id) || {
        employeeId: id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        hourlyRate: employee.hourlyRate || 0,
        days: 0,
        workedMinutes: 0,
      };
      row.days += 1;
      row.workedMinutes += entry.workedMinutes;
      totals.set(id, row);
    }

    return {
      month,
      rows: Array.from(totals.values()).map((row) => {
        const hours = Math.round((row.workedMinutes / 60) * 100) / 100;
        return { ...row, hours, grossPay: Math.round(hours * row.hourlyRate) };
      }),
    };
  }
}