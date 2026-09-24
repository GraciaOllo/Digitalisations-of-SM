import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { AdjustStockDto, CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Injectable()
export class StockService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) {}

  create(companyId: string, dto: CreateProductDto) {
    return this.productModel.create({ ...dto, companyId: new Types.ObjectId(companyId) });
  }

  findAll(companyId: string, search?: string) {
    const query: any = { companyId: new Types.ObjectId(companyId), isDeleted: false };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }];
    return this.productModel.find(query).sort({ name: 1 }).lean();
  }

  async stats(companyId: string) {
    const products = await this.productModel.find({ companyId: new Types.ObjectId(companyId), isDeleted: false }).lean();
    return {
      productsCount: products.length,
      unitsCount: products.reduce((sum, product) => sum + product.quantity, 0),
      lowStockCount: products.filter(product => product.quantity <= product.lowStockThreshold).length,
      inventoryValue: products.reduce((sum, product) => sum + product.quantity * product.unitPrice, 0),
    };
  }

  async findOne(companyId: string, id: string) {
    const product = await this.productModel.findOne({ _id: id, companyId: new Types.ObjectId(companyId), isDeleted: false });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(companyId: string, id: string, dto: UpdateProductDto) {
    const product = await this.findOne(companyId, id);
    Object.assign(product, dto);
    return product.save();
  }

  async adjust(companyId: string, id: string, dto: AdjustStockDto) {
    const product = await this.findOne(companyId, id);
    const nextQuantity = product.quantity + dto.quantity;
    if (nextQuantity < 0) throw new BadRequestException('Stock cannot be negative');
    product.quantity = nextQuantity;
    return product.save();
  }

  async remove(companyId: string, id: string) {
    const product = await this.productModel.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId), isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Deleted successfully' };
  }
}
