import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InvoicingService } from '../invoicing/invoicing.service';
import {
  CreateCRMOrderDto,
  CreateCustomerActivityDto,
  CreateLeadDto,
  CreateMessageTemplateDto,
  UpdateCRMOrderDto,
  UpdateLeadDto,
  UpdateMessageTemplateDto,
} from './dto/crm.dto';
import { CustomerActivity, CustomerActivityDocument } from './schemas/customer-activity.schema';
import { CRMOrder, CRMOrderDocument } from './schemas/crm-order.schema';
import { Lead, LeadDocument, LeadStage } from './schemas/lead.schema';
import { MessageTemplate, MessageTemplateDocument } from './schemas/message-template.schema';

@Injectable()
export class CRMService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
    @InjectModel(CustomerActivity.name) private readonly activityModel: Model<CustomerActivityDocument>,
    @InjectModel(CRMOrder.name) private readonly orderModel: Model<CRMOrderDocument>,
    @InjectModel(MessageTemplate.name) private readonly templateModel: Model<MessageTemplateDocument>,
    private readonly invoicing: InvoicingService,
  ) {}

  listLeads(companyId: string) {
    return this.leadModel.find({ companyId: new Types.ObjectId(companyId) }).sort({ nextFollowUp: 1, createdAt: -1 }).lean();
  }

  createLead(companyId: string, userId: string, data: CreateLeadDto) {
    return this.leadModel.create({
      ...data,
      companyId: new Types.ObjectId(companyId),
      createdBy: new Types.ObjectId(userId),
      ...(data.nextFollowUp ? { nextFollowUp: new Date(data.nextFollowUp) } : {}),
    });
  }

  async updateLead(companyId: string, leadId: string, data: UpdateLeadDto) {
    const update = { ...data, ...(data.nextFollowUp ? { nextFollowUp: new Date(data.nextFollowUp) } : {}) };
    const lead = await this.leadModel.findOneAndUpdate(
      { _id: leadId, companyId: new Types.ObjectId(companyId) },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async convertLead(companyId: string, leadId: string) {
    const companyObjectId = new Types.ObjectId(companyId);
    const lead = await this.leadModel.findOne({ _id: leadId, companyId: companyObjectId });
    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.customerId) return this.invoicing.findCustomer(companyId, lead.customerId.toString());

    const customer = await this.invoicing.createCustomer(companyId, {
      name: lead.companyName || lead.name,
      email: lead.email,
      phone: lead.phone,
      type: lead.companyName ? 'company' : 'individual',
    });
    lead.customerId = new Types.ObjectId(customer._id.toString());
    lead.stage = LeadStage.WON;
    await lead.save();
    return customer;
  }

  async addCustomerActivity(companyId: string, userId: string, customerId: string, data: CreateCustomerActivityDto) {
    await this.invoicing.findCustomer(companyId, customerId);
    return this.activityModel.create({
      ...data,
      companyId: new Types.ObjectId(companyId),
      customerId: new Types.ObjectId(customerId),
      createdBy: new Types.ObjectId(userId),
    });
  }

  async listCustomerActivity(companyId: string, customerId: string) {
    await this.invoicing.findCustomer(companyId, customerId);
    return this.activityModel.find({
      companyId: new Types.ObjectId(companyId),
      customerId: new Types.ObjectId(customerId),
    }).sort({ createdAt: -1 }).lean();
  }

  async createOrder(companyId: string, data: CreateCRMOrderDto) {
    const customer = await this.invoicing.findCustomer(companyId, data.customerId);
    const number = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
    return this.orderModel.create({
      ...data,
      number,
      customerName: customer.name,
      companyId: new Types.ObjectId(companyId),
      customerId: new Types.ObjectId(data.customerId),
      ...(data.expectedAt ? { expectedAt: new Date(data.expectedAt) } : {}),
    });
  }

  listOrders(companyId: string) {
    return this.orderModel.find({ companyId: new Types.ObjectId(companyId) }).sort({ createdAt: -1 }).lean();
  }

  async updateOrder(companyId: string, orderId: string, data: UpdateCRMOrderDto) {
    const update = { ...data, ...(data.expectedAt ? { expectedAt: new Date(data.expectedAt) } : {}) };
    const order = await this.orderModel.findOneAndUpdate(
      { _id: orderId, companyId: new Types.ObjectId(companyId) },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async listTemplates(companyId: string) {
    const companyObjectId = new Types.ObjectId(companyId);
    const templates = await this.templateModel.find({ companyId: companyObjectId }).sort({ channel: 1, name: 1 }).lean();
    if (templates.length) return templates;
    return this.templateModel.insertMany([
      {
        companyId: companyObjectId,
        channel: 'email',
        name: 'Suivi après premier contact',
        subject: 'Suite à notre échange',
        body: 'Bonjour {{customer_name}},\n\nMerci pour notre échange. Je reste disponible pour répondre à vos questions et vous accompagner dans votre projet.\n\nÀ bientôt,\n{{company_name}}',
      },
      {
        companyId: companyObjectId,
        channel: 'email',
        name: 'Envoi de devis',
        subject: 'Votre devis {{quote_number}}',
        body: 'Bonjour {{customer_name}},\n\nVeuillez trouver votre devis en pièce jointe. N’hésitez pas à nous contacter si vous avez des questions.\n\nCordialement,\n{{company_name}}',
      },
      {
        companyId: companyObjectId,
        channel: 'sms',
        name: 'Confirmation de rendez-vous',
        body: 'Bonjour {{customer_name}}, nous vous confirmons notre rendez-vous le {{appointment_date}}. À bientôt, {{company_name}}.',
      },
    ]);
  }

  createTemplate(companyId: string, data: CreateMessageTemplateDto) {
    return this.templateModel.create({ ...data, companyId: new Types.ObjectId(companyId) });
  }

  async updateTemplate(companyId: string, templateId: string, data: UpdateMessageTemplateDto) {
    const template = await this.templateModel.findOneAndUpdate(
      { _id: templateId, companyId: new Types.ObjectId(companyId) },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async deleteTemplate(companyId: string, templateId: string) {
    const template = await this.templateModel.findOneAndDelete({
      _id: templateId,
      companyId: new Types.ObjectId(companyId),
    });
    if (!template) throw new NotFoundException('Template not found');
    return { message: 'Template deleted' };
  }
}