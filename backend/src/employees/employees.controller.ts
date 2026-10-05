import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/roles.constant';
import { CreateEmployeeDto, UpdateEmployeeDto, UpdateOwnProfileDto } from './dto/create-employee.dto';
import { UsersService } from '../users/users.service';

const teamRoles = [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.HR];
const managementRoles = [UserRole.OWNER, UserRole.ADMIN, UserRole.HR];

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly users: UsersService) {}

  @Get('me') @ApiOperation({ summary: 'Get current employee profile' })
  getOwnProfile(@CurrentUser() user: any) {
    return this.users.getOwnProfile(user.companyId, user.sub);
  }

  @Patch('me') @ApiOperation({ summary: 'Update current employee profile' })
  updateOwnProfile(@CurrentUser() user: any, @Body() dto: UpdateOwnProfileDto) {
    return this.users.updateOwnProfile(user.companyId, user.sub, dto);
  }

  @Get() @Roles(...teamRoles) @ApiOperation({ summary: 'List employees' })
  list(@CurrentUser() user: any) { return this.users.listCompanyUsers(user.companyId); }

  @Post() @Roles(...managementRoles) @ApiOperation({ summary: 'Create employee' })
  create(@CurrentUser() user: any, @Body() dto: CreateEmployeeDto) {
    return this.users.create({ ...dto, companyId: user.companyId });
  }

  @Patch(':id') @Roles(...managementRoles) @ApiOperation({ summary: 'Update employee' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.users.updateCompanyUser(user.companyId, id, dto);
  }

  @Delete(':id') @Roles(...managementRoles) @ApiOperation({ summary: 'Deactivate employee' })
  remove(@CurrentUser() user: any, @Param('id') id: string) { return this.users.removeCompanyUser(user.companyId, id); }
}
