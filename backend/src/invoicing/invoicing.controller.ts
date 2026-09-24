import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { InvoicingService } from './invoicing.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions.constant';
import { InvoiceType, InvoiceStatus } from './schemas/invoice.schema';

@ApiTags('Invoicing')
@ApiBearerAuth()
@Controller('invoicing')
export class InvoicingController {
  constructor(private readonly service: InvoicingService) {}

  // ─── Customers ───────────────────────────────────────────────

  @Post('customers')
  @Permissions(Permission.INVOICE_CREATE)
  @ApiOperation({ summary: 'Create a customer' })
  createCustomer(@CurrentUser() user: any, @Body() dto: CreateCustomerDto) {
    return this.service.createCustomer(user.companyId, dto);
  }

  @Get('customers')
  @Permissions(Permission.INVOICE_READ)
  @ApiOperation({ summary: 'List customers' })
  findAllCustomers(@CurrentUser() user: any) {
    return this.service.findAllCustomers(user.companyId);
  }

  @Get('customers/:id')
  @Permissions(Permission.INVOICE_READ)
  @ApiOperation({ summary: 'Get one customer' })
  findCustomer(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.findCustomer(user.companyId, id);
  }

  @Patch('customers/:id')
  @Permissions(Permission.CRM_UPDATE)
  updateCustomer(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateCustomerDto) {
    return this.service.updateCustomer(user.companyId, id, dto);
  }

  @Delete('customers/:id')
  @Permissions(Permission.CRM_UPDATE)
  deleteCustomer(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.deleteCustomer(user.companyId, id);
  }

  // ─── Documents (Quotes / Invoices / Credit Notes) ────────────

  @Post()
  @Permissions(Permission.INVOICE_CREATE)
  @ApiOperation({ summary: 'Create quote / invoice / credit note' })
  create(@CurrentUser() user: any, @Body() dto: CreateInvoiceDto) {
    return this.service.create(user.companyId, user.userId || user.sub, dto);
  }

  @Get()
  @Permissions(Permission.INVOICE_READ)
  @ApiOperation({ summary: 'List documents' })
  @ApiQuery({ name: 'type', required: false, enum: InvoiceType })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('type') type?: InvoiceType,
    @Query('status') status?: InvoiceStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(user.companyId, {
      type,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('stats')
  @Permissions(Permission.INVOICE_READ)
  @ApiOperation({ summary: 'Invoicing stats' })
  getStats(@CurrentUser() user: any) {
    return this.service.getStats(user.companyId);
  }

  @Get(':id')
  @Permissions(Permission.INVOICE_READ)
  @ApiOperation({ summary: 'Get one document' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.findOne(user.companyId, id);
  }

  @Patch(':id')
  @Permissions(Permission.INVOICE_UPDATE)
  @ApiOperation({ summary: 'Update document' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.service.update(user.companyId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.INVOICE_DELETE)
  @ApiOperation({ summary: 'Soft delete document' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.softDelete(user.companyId, id);
  }
}
