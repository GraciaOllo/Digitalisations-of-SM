import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<CompanyDocument>,
  ) {}

  create(data: Partial<Company>) {
    return new this.companyModel(data).save();
  }

  async findById(companyId: string) {
    const company = await this.companyModel.findOne({
      _id: new Types.ObjectId(companyId),
      isDeleted: false,
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  update(companyId: string, data: Partial<Company>) {
    return this.companyModel.findOneAndUpdate(
      { _id: new Types.ObjectId(companyId), isDeleted: false },
      { $set: data },
      { new: true },
    );
  }

  softDelete(companyId: string) {
    return this.companyModel.findByIdAndUpdate(
      companyId,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
  }
}
