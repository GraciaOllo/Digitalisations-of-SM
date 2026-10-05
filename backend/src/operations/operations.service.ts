import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreateOperationDto, UpdateOperationDto } from './dto/operation.dto';
import { Operation, OperationDocument, OperationKind, OperationStatus } from './schemas/operation.schema';

@Injectable()
export class OperationsService {
  constructor(
    @InjectModel(Operation.name) private readonly operationModel: Model<OperationDocument>,
    private readonly users: UsersService,
  ) {}

  list(companyId: string, kind?: OperationKind) {
    return this.operationModel.find({
      companyId: new Types.ObjectId(companyId),
      ...(kind ? { kind } : {}),
    }).populate('assignedTo', 'firstName lastName email').sort({ scheduledAt: 1, dueAt: 1, createdAt: -1 }).lean();
  }

  async create(companyId: string, userId: string, data: CreateOperationDto) {
    if (data.assignedTo) await this.users.findActiveCompanyUser(companyId, data.assignedTo);
    return new this.operationModel({
      ...data,
      companyId: new Types.ObjectId(companyId),
      createdBy: new Types.ObjectId(userId),
    }).save();
  }

  async update(companyId: string, operationId: string, data: UpdateOperationDto) {
    if (data.assignedTo) await this.users.findActiveCompanyUser(companyId, data.assignedTo);
    const update = { ...data };
    if (data.assignedTo === '') delete update.assignedTo;
    const operation = await this.operationModel.findOneAndUpdate(
      { _id: operationId, companyId: new Types.ObjectId(companyId) },
      { $set: update, ...(data.assignedTo === '' ? { $unset: { assignedTo: 1 } } : {}) },
      { new: true, runValidators: true },
    ).populate('assignedTo', 'firstName lastName email');
    if (!operation) throw new NotFoundException('Operation not found');
    return operation;
  }

  async remove(companyId: string, operationId: string) {
    const operation = await this.operationModel.findOneAndDelete({
      _id: operationId,
      companyId: new Types.ObjectId(companyId),
    });
    if (!operation) throw new NotFoundException('Operation not found');
    return { message: 'Operation deleted' };
  }
}