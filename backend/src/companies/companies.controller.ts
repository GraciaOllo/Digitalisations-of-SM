import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CompaniesService } from './companies.service';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Get('current')
  async getCurrent(@CurrentUser() user: { companyId: string }) {
    const company = await this.companies.findById(user.companyId);
    return {
      id: company._id.toString(),
      name: company.name,
      currency: company.currency,
      country: company.country,
    };
  }
}