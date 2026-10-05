import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreateCRMOrderDto,
  CreateCustomerActivityDto,
  CreateLeadDto,
  CreateMessageTemplateDto,
  UpdateCRMOrderDto,
  UpdateLeadDto,
  UpdateMessageTemplateDto,
} from './dto/crm.dto';
import { CRMService } from './crm.service';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('crm')
export class CRMController {
  constructor(private readonly crm: CRMService) {}

  @Get('leads')
  @ApiOperation({ summary: 'List company leads and sales opportunities' })
  listLeads(@CurrentUser() user: any) {
    return this.crm.listLeads(user.companyId);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create a sales lead' })
  createLead(@CurrentUser() user: any, @Body() dto: CreateLeadDto) {
    return this.crm.createLead(user.companyId, user.sub, dto);
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update a sales lead stage or details' })
  updateLead(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.crm.updateLead(user.companyId, id, dto);
  }

  @Post('leads/:id/convert')
  @ApiOperation({ summary: 'Convert a lead into a customer' })
  convertLead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.crm.convertLead(user.companyId, id);
  }

  @Get('customers/:customerId/activity')
  @ApiOperation({ summary: 'List a customer activity history' })
  listCustomerActivity(@CurrentUser() user: any, @Param('customerId') customerId: string) {
    return this.crm.listCustomerActivity(user.companyId, customerId);
  }

  @Post('customers/:customerId/activity')
  @ApiOperation({ summary: 'Add a note or communication record to customer history' })
  addCustomerActivity(
    @CurrentUser() user: any,
    @Param('customerId') customerId: string,
    @Body() dto: CreateCustomerActivityDto,
  ) {
    return this.crm.addCustomerActivity(user.companyId, user.sub, customerId, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List company orders' })
  listOrders(@CurrentUser() user: any) {
    return this.crm.listOrders(user.companyId);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create a customer order' })
  createOrder(@CurrentUser() user: any, @Body() dto: CreateCRMOrderDto) {
    return this.crm.createOrder(user.companyId, dto);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update order status or expected delivery date' })
  updateOrder(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateCRMOrderDto) {
    return this.crm.updateOrder(user.companyId, id, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List company email and SMS templates' })
  listTemplates(@CurrentUser() user: any) {
    return this.crm.listTemplates(user.companyId);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create an email or SMS template' })
  createTemplate(@CurrentUser() user: any, @Body() dto: CreateMessageTemplateDto) {
    return this.crm.createTemplate(user.companyId, dto);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update a communication template' })
  updateTemplate(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateMessageTemplateDto) {
    return this.crm.updateTemplate(user.companyId, id, dto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete a communication template' })
  deleteTemplate(@CurrentUser() user: any, @Param('id') id: string) {
    return this.crm.deleteTemplate(user.companyId, id);
  }
}