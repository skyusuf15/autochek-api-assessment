import { Test, TestingModule } from '@nestjs/testing';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { CreateLoanApplicationDto, UpdateLoanStatusDto } from './dto/index.dto';
import { Loan } from '../../entities';

describe('LoanController', () => {
  let loanController: LoanController;
  let loanService: LoanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanController],
      providers: [
        {
          provide: LoanService,
          useValue: {
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    loanController = module.get<LoanController>(LoanController);
    loanService = module.get<LoanService>(LoanService);
  });

  describe('applyForLoan', () => {
    it('should create a new loan application', async () => {
      const createLoanApplicationDto: CreateLoanApplicationDto = {
        vehicleId: 1,
        userId: 1,
        amountRequested: 10000,
        monthlyIncome: 3000,
        monthlyDebt: 500,
        creditScore: 700,
        age: 30,
      };

      const mockLoan = {
        amountRequested: 6000000,
        status: 'pending',
        applicationDate: '2024-08-24T10:07:24.565Z',
        vehicle: {
          id: 1,
          vin: 'JH4KA7561PC008269',
          make: 'Acura',
          model: 'Legend',
          year: 1993,
          mileage: 120000,
          baseAmount: 5000000,
          sellingPrice: 7000000,
        },
        user: {
          id: 2,
        },
        comment: null,
        id: 1,
      } as unknown as Loan;
      jest.spyOn(loanService, 'create').mockResolvedValue(mockLoan);

      const result = await loanController.applyForLoan(
        createLoanApplicationDto,
      );

      expect(result).toEqual({
        data: mockLoan,
        message: 'Loan application created successfully',
        status: 'success',
      });
      expect(loanService.create).toHaveBeenCalledWith(createLoanApplicationDto);
    });
  });

  describe('reviewLoan', () => {
    it('should update the loan status', async () => {
      const updateLoanStatusDto: UpdateLoanStatusDto = {
        loanId: 1,
        loanStatus: 'approved',
        comments: 'Loan approved',
      };

      const mockUpdatedLoan = {
        id: updateLoanStatusDto.loanId,
        status: updateLoanStatusDto.loanStatus,
      } as Loan;
      jest
        .spyOn(loanService, 'updateStatus')
        .mockResolvedValue(mockUpdatedLoan);

      const result = await loanController.reviewLoan(updateLoanStatusDto);

      expect(result).toEqual({
        data: mockUpdatedLoan,
        message: 'Loan status updated successfully',
        status: 'success',
      });
      expect(loanService.updateStatus).toHaveBeenCalledWith(
        updateLoanStatusDto,
      );
    });
  });
});
