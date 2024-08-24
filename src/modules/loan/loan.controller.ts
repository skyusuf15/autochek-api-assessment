import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanApplicationDto, UpdateLoanStatusDto } from './dto/index.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/enum/index.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Loan')
@Controller('api/v1/loan')
export class LoanController {
  constructor(private readonly loanApplicationsService: LoanService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for a vehicle financing' })
  @ApiResponse({
    status: 201,
    description: 'Loan application created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  @Post('apply')
  async applyForLoan(
    @Body() createLoanApplicationDto: CreateLoanApplicationDto,
  ) {
    const newLoan = await this.loanApplicationsService.create(
      createLoanApplicationDto,
    );
    return {
      data: newLoan,
      message: 'Loan application created successfully',
      status: 'success',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review loan application' })
  @ApiResponse({
    status: 200,
    description: 'Loan status updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan not found.',
  })
  @Patch('review')
  async reviewLoan(@Body() updateLoanStatusDto: UpdateLoanStatusDto) {
    const updatedLoan =
      await this.loanApplicationsService.updateStatus(updateLoanStatusDto);
    return {
      data: updatedLoan,
      message: 'Loan status updated successfully',
      status: 'success',
    };
  }
}
