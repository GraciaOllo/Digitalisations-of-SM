import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicingModule } from '../invoicing/invoicing.module';
import { CustomerActivity, CustomerActivitySchema } from './schemas/customer-activity.schema';
import { CRMOrder, CRMOrderSchema } from './schemas/crm-order.schema';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { MessageTemplate, MessageTemplateSchema } from './schemas/message-template.schema';
import { CRMController } from './crm.controller';
import { CRMService } from './crm.service';

@Module({
  imports: [
    InvoicingModule,
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: CustomerActivity.name, schema: CustomerActivitySchema },
      { name: CRMOrder.name, schema: CRMOrderSchema },
      { name: MessageTemplate.name, schema: MessageTemplateSchema },
    ]),
  ],
  controllers: [CRMController],
  providers: [CRMService],
})
export class CRMModule {}