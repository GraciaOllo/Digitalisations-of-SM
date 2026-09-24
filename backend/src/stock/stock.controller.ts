import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions.constant';
import { AdjustStockDto, CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { StockService } from './stock.service';

@ApiTags('Stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly service: StockService) {}

  @Get('stats') @Permissions(Permission.STOCK_READ) @ApiOperation({ summary: 'Stock statistics' })
  stats(@CurrentUser() user: any) { return this.service.stats(user.companyId); }

  @Get() @Permissions(Permission.STOCK_READ) @ApiOperation({ summary: 'List products' })
  findAll(@CurrentUser() user: any, @Query('search') search?: string) { return this.service.findAll(user.companyId, search); }

  @Get(':id') @Permissions(Permission.STOCK_READ)
  findOne(@CurrentUser() user: any, @Param('id') id: string) { return this.service.findOne(user.companyId, id); }

  @Post() @Permissions(Permission.STOCK_CREATE)
  create(@CurrentUser() user: any, @Body() dto: CreateProductDto) { return this.service.create(user.companyId, dto); }

  @Patch(':id') @Permissions(Permission.STOCK_UPDATE)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateProductDto) { return this.service.update(user.companyId, id, dto); }

  @Post(':id/adjust') @Permissions(Permission.STOCK_UPDATE)
  adjust(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: AdjustStockDto) { return this.service.adjust(user.companyId, id, dto); }

  @Delete(':id') @Permissions(Permission.STOCK_UPDATE)
  remove(@CurrentUser() user: any, @Param('id') id: string) { return this.service.remove(user.companyId, id); }
}
