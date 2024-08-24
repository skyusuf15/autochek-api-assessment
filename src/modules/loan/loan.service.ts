import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan, Vehicle, User } from '../../entities';
import { Repository } from 'typeorm';
import { CreateLoanApplicationDto, UpdateLoanStatusDto } from './dto/index.dto';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepo: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(
    createLoanApplicationDto: CreateLoanApplicationDto,
  ): Promise<Loan> {
    const vehicle = await this.vehiclesRepo.findOne({
      where: { id: Number(createLoanApplicationDto.vehicleId) },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const user = await this.userRepo.findOne({
      where: { id: Number(createLoanApplicationDto.userId) },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check loan eligibility
    const isEligible = this.checkEligibility(createLoanApplicationDto);
    if (!isEligible) {
      throw new BadRequestException(
        'Applicant does not meet loan eligibility criteria.',
      );
    }

    const newLoan = this.loanRepo.create({
      user: { id: user.id },
      vehicle,
      amountRequested: createLoanApplicationDto.amountRequested,
      applicationDate: new Date(),
      status: 'pending',
    });

    // notify admin of a loan request here or other backgroud task

    return this.loanRepo.save(newLoan);
  }

  async updateStatus(updateLoanStatusDto: UpdateLoanStatusDto): Promise<Loan> {
    const loanApplication = await this.loanRepo.findOne({
      where: { id: Number(updateLoanStatusDto.loanId) },
    });

    if (!loanApplication) {
      throw new HttpException(
        'Loan application not found',
        HttpStatus.NOT_FOUND,
      );
    }

    loanApplication.status = updateLoanStatusDto.loanStatus;
    loanApplication.comment = updateLoanStatusDto.comments;
    const loan = await this.loanRepo.save(loanApplication);

    // notify customer & dealer about the financing status (approved or rejected) here

    return loan;
  }

  private checkEligibility(
    createLoanApplicationDto: CreateLoanApplicationDto,
  ): boolean {
    const { monthlyIncome, monthlyDebt, creditScore, age } =
      createLoanApplicationDto;

    // Predefined criteria
    const MIN_INCOME = 500000;
    const MAX_DEBT_TO_INCOME_RATIO = 0.4;
    const MIN_CREDIT_SCORE = 600;
    const MIN_AGE = 18;

    // Calculate debt-to-income ratio
    const debtToIncomeRatio = monthlyDebt / monthlyIncome;

    // Check if all conditions are met
    if (
      monthlyIncome >= MIN_INCOME &&
      debtToIncomeRatio < MAX_DEBT_TO_INCOME_RATIO &&
      creditScore >= MIN_CREDIT_SCORE &&
      age >= MIN_AGE
    ) {
      return true;
    }

    return false;
  }
}
