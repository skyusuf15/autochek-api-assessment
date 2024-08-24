import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanService } from './loan.service';
import { Loan, Vehicle, User } from '../../entities';
import { CreateLoanApplicationDto, UpdateLoanStatusDto } from './dto/index.dto';

describe('LoanService', () => {
  let loanService: LoanService;
  let loanRepo: Repository<Loan>;
  let vehiclesRepo: Repository<Vehicle>;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        {
          provide: getRepositoryToken(Loan),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    loanService = module.get<LoanService>(LoanService);
    loanRepo = module.get<Repository<Loan>>(getRepositoryToken(Loan));
    vehiclesRepo = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new loan application successfully', async () => {
      const createLoanApplicationDto: CreateLoanApplicationDto = {
        vehicleId: 1,
        userId: 1,
        amountRequested: 10000,
        monthlyIncome: 600000,
        monthlyDebt: 10000,
        creditScore: 700,
        age: 25,
      };

      const vehicle = { id: 1 } as Vehicle;
      const user = { id: 1 } as User;

      jest.spyOn(vehiclesRepo, 'findOne').mockResolvedValue(vehicle);
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
      jest.spyOn(loanRepo, 'create').mockReturnValue({
        id: 1,
        ...createLoanApplicationDto,
      } as unknown as Loan);
      jest.spyOn(loanRepo, 'save').mockResolvedValue({
        id: 1,
        ...createLoanApplicationDto,
      } as unknown as Loan);

      const result = await loanService.create(createLoanApplicationDto);

      expect(result).toEqual({ id: 1, ...createLoanApplicationDto });
      expect(loanRepo.create).toHaveBeenCalledWith({
        user: { id: user.id },
        vehicle,
        amountRequested: createLoanApplicationDto.amountRequested,
        applicationDate: expect.any(Date),
        status: 'pending',
      });
      expect(loanRepo.save).toHaveBeenCalled();
    });

    it('should throw an error if vehicle is not found', async () => {
      jest.spyOn(vehiclesRepo, 'findOne').mockResolvedValue(null);

      await expect(
        loanService.create({
          vehicleId: 1,
          userId: 1,
          amountRequested: 10000,
          monthlyIncome: 600000,
          monthlyDebt: 10000,
          creditScore: 700,
          age: 25,
        }),
      ).rejects.toThrow('Vehicle not found');
    });

    it('should throw an error if user is not found', async () => {
      jest
        .spyOn(vehiclesRepo, 'findOne')
        .mockResolvedValue({ id: 1 } as Vehicle);
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(
        loanService.create({
          vehicleId: 1,
          userId: 1,
          amountRequested: 10000,
          monthlyIncome: 600000,
          monthlyDebt: 10000,
          creditScore: 700,
          age: 25,
        }),
      ).rejects.toThrow('User not found');
    });

    it('should throw a BadRequestException if applicant does not meet loan eligibility criteria', async () => {
      jest
        .spyOn(vehiclesRepo, 'findOne')
        .mockResolvedValue({ id: 1 } as Vehicle);
      jest.spyOn(userRepo, 'findOne').mockResolvedValue({ id: 1 } as User);

      const ineligibleLoanApplicationDto: CreateLoanApplicationDto = {
        vehicleId: 1,
        userId: 1,
        amountRequested: 10000,
        monthlyIncome: 10000,
        monthlyDebt: 5000,
        creditScore: 500,
        age: 17,
      };

      await expect(
        loanService.create(ineligibleLoanApplicationDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should update loan status successfully', async () => {
      const updateLoanStatusDto: UpdateLoanStatusDto = {
        loanId: 1,
        loanStatus: 'approved',
        comments: 'Loan approved',
      };

      const loanApplication = { id: 1, status: 'pending', comment: '' };

      jest
        .spyOn(loanRepo, 'findOne')
        .mockResolvedValue(loanApplication as Loan);
      jest.spyOn(loanRepo, 'save').mockResolvedValue({
        ...loanApplication,
        status: updateLoanStatusDto.loanStatus,
        comment: updateLoanStatusDto.comments,
      } as Loan);

      const result = await loanService.updateStatus(updateLoanStatusDto);

      expect(result).toEqual({
        id: 1,
        status: 'approved',
        comment: 'Loan approved',
      });
      expect(loanRepo.save).toHaveBeenCalledWith({
        ...loanApplication,
        status: 'approved',
        comment: 'Loan approved',
      });
    });

    it('should throw an HttpException if loan application is not found', async () => {
      jest.spyOn(loanRepo, 'findOne').mockResolvedValue(null);

      await expect(
        loanService.updateStatus({
          loanId: 1,
          loanStatus: 'approved',
          comments: 'Loan approved',
        }),
      ).rejects.toThrow(
        new HttpException('Loan application not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
