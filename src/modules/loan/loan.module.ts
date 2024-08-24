import { Logger, Module } from '@nestjs/common';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan, Vehicle, User } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Vehicle, User])],
  controllers: [LoanController],
  providers: [LoanService, Logger],
  exports: [LoanService],
})
export class LoanModule {}
