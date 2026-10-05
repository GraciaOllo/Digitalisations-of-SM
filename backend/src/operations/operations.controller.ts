import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateOperationDto, UpdateOperationDto } from './dto/operation.dto';
import { OperationsService } from './operations.service';
import { OperationKind } from './schemas/operation.schema';

@ApiTags('Operations')
@ApiBearerAuth()
@Controller('operations')
export class OperationsController {
  constructor(private readonly operations: OperationsService) {}

  @Get()
  @ApiOperation({ summary: 'List company tasks, projects, notes, and events' })
  list(@CurrentUser() user: any, @Query('kind') kind?: OperationKind) {
    return this.operations.list(user.companyId, kind);
  }

  @Post()
  @ApiOperation({ summary: 'Create an operation item' })
  create(@CurrentUser() user: any, @Body() dto: CreateOperationDto) {
    return this.operations.create(user.companyId, user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company operation item' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateOperationDto) {
    return this.operations.update(user.companyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company operation item' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.operations.remove(user.companyId, id);
  }
}