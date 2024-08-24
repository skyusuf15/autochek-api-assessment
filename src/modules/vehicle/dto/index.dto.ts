import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  vin: string;

  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsNumber()
  @IsNotEmpty()
  mileage: number;

  @IsNumber()
  @IsNotEmpty()
  baseAmount: number;

  @IsNumber()
  @IsNotEmpty()
  sellingPrice: number;
}
