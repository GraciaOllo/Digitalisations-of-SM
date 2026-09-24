import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/constants/permissions.constant';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/create-employee.dto';
import { UsersService } from '../users/users.service';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly users: UsersService) {}

  @Get() @Permissions(Permission.USERS_READ) @ApiOperation({ summary: 'List employees' })
  list(@CurrentUser() user: any) { return this.users.listCompanyUsers(user.companyId); }

  @Post() @Permissions(Permission.USERS_CREATE) @ApiOperation({ summary: 'Create employee' })
  create(@CurrentUser() user: any, @Body() dto: CreateEmployeeDto) {
    return this.users.create({ ...dto, companyId: user.companyId });
  }

  @Patch(':id') @Permissions(Permission.USERS_UPDATE) @ApiOperation({ summary: 'Update employee' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.users.updateCompanyUser(user.companyId, id, dto);
  }

  @Delete(':id') @Permissions(Permission.USERS_DELETE) @ApiOperation({ summary: 'Deactivate employee' })
  remove(@CurrentUser() user: any, @Param('id') id: string) { return this.users.removeCompanyUser(user.companyId, id); }
}
