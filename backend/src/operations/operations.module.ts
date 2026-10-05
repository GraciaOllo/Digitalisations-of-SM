import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { Operation, OperationSchema } from './schemas/operation.schema';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';

@Module({
  imports: [UsersModule, MongooseModule.forFeature([{ name: Operation.name, schema: OperationSchema }])],
  controllers: [OperationsController],
  providers: [OperationsService],
})
export class OperationsModule {}