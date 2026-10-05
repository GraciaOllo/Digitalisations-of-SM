import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole } from '../common/constants/roles.constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    companyId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
    permissions?: string[];
  }) {
    const companyId = new Types.ObjectId(data.companyId);
    const email = data.email.toLowerCase();

    const existing = await this.userModel.findOne({
      companyId, email, isDeleted: false,
    });
    if (existing) throw new ConflictException('User already exists');

    const user = new this.userModel({
      ...data,
      companyId,
      email,
      password: await bcrypt.hash(data.password, 12),
      role: data.role || UserRole.EMPLOYEE,
    });
    return user.save();
  }

  findByEmail(email: string, companyId?: string) {
    const query: any = { email: email.toLowerCase(), isDeleted: false };
    if (companyId) query.companyId = new Types.ObjectId(companyId);
    return this.userModel.findOne(query);
  }

  findById(userId: string, companyId?: string) {
    const query: any = { _id: new Types.ObjectId(userId), isDeleted: false };
    if (companyId) query.companyId = new Types.ObjectId(companyId);
    return this.userModel.findOne(query);
  }

  updateRefreshToken(userId: string, refreshTokenHash: string | null) {
    return this.userModel.findByIdAndUpdate(
      userId, { refreshTokenHash }, { new: true },
    );
  }

  updateLastLogin(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
    });
  }

  async listCompanyUsers(companyId: string) {
    return this.userModel.find({ companyId: new Types.ObjectId(companyId), isDeleted: false })
      .select('-password -refreshTokenHash')
      .sort({ lastName: 1, firstName: 1 })
      .lean();
  }

  async getOwnProfile(companyId: string, userId: string) {
    const user = await this.userModel.findOne({
      _id: userId,
      companyId: new Types.ObjectId(companyId),
      isDeleted: false,
    }).select('-password -refreshTokenHash').lean();
    if (!user) throw new NotFoundException('Employee not found');
    return user;
  }

  async updateOwnProfile(companyId: string, userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) {
    const companyObjectId = new Types.ObjectId(companyId);
    const update = { ...data };
    if (data.email) {
      update.email = data.email.toLowerCase().trim();
      const duplicate = await this.userModel.findOne({
        _id: { $ne: userId },
        companyId: companyObjectId,
        email: update.email,
        isDeleted: false,
      });
      if (duplicate) throw new ConflictException('Email already exists');
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, companyId: companyObjectId, isDeleted: false },
      { $set: update },
      { new: true, runValidators: true },
    ).select('-password -refreshTokenHash');
    if (!user) throw new NotFoundException('Employee not found');
    return user;
  }

  async updateCompanyUser(companyId: string, userId: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'role' | 'permissions' | 'isActive' | 'hourlyRate'>>) {
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, companyId: new Types.ObjectId(companyId), isDeleted: false },
      data,
      { new: true, runValidators: true },
    ).select('-password -refreshTokenHash');
    if (!user) throw new NotFoundException('Employee not found');
    return user;
  }

  async findActiveCompanyUser(companyId: string, userId: string) {
    const user = await this.userModel.findOne({
      _id: userId,
      companyId: new Types.ObjectId(companyId),
      isDeleted: false,
      isActive: true,
    }).select('_id firstName lastName email role hourlyRate').lean();
    if (!user) throw new NotFoundException('Employee not found');
    return user;
  }

  async removeCompanyUser(companyId: string, userId: string) {
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, companyId: new Types.ObjectId(companyId), isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true },
    );
    if (!user) throw new NotFoundException('Employee not found');
    return { message: 'Employee deactivated' };
  }
}
