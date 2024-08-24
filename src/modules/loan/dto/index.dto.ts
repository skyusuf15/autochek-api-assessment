import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateLoanApplicationDto {
  @ApiProperty({ description: 'The ID of the vehicle' })
  @IsNotEmpty()
  @IsNumber()
  vehicleId: number;

  @ApiProperty({ description: 'The ID of the user' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'The amount requested for the loan' })
  @IsNotEmpty()
  @IsNumber()
  amountRequested: number;

  @ApiProperty({ description: 'The monthly income of the user' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthlyIncome: number;

  @ApiProperty({ description: 'The monthly debt of the user' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthlyDebt: number;

  // ideally this was supposed to be fetched from a credit bureau or a third party you analyse credit history
  @ApiProperty({
    description: 'The credit score of the user',
    minimum: 300,
    maximum: 850,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(300)
  @Max(850)
  creditScore: number;

  @ApiProperty({ description: 'The age of the user' })
  @IsNotEmpty()
  @IsNumber()
  age: number;
}

export class UpdateLoanStatusDto {
  @ApiProperty({ description: 'The ID of the loan application' })
  @IsNumber()
  loanId: number;

  @ApiProperty({
    description: 'The status of the loan application',
    enum: ['pending', 'approved', 'rejected'],
  })
  @IsIn(['pending', 'approved', 'rejected'])
  loanStatus: 'pending' | 'approved' | 'rejected';

  @ApiProperty({
    description: 'Optional comments about the loan application',
    required: false,
  })
  @IsString()
  @IsOptional()
  comments: string;
}
