import {
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle, Valuation } from '../../entities';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Vinlookup } from './interface';
import { CreateVehicleDto } from './dto/index.dto';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class VehicleService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Valuation)
    private readonly valuationRepo: Repository<Valuation>,
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  async getAllVehicles(): Promise<Vehicle[]> {
    // Ideally, this should be paginated
    return this.vehicleRepo.find();
  }

  async simulateVehicleValuation(
    vin: string,
    basePrice: number,
  ): Promise<Valuation> {
    const { data: vinLookupResponse, status }: AxiosResponse<Vinlookup> =
      await lastValueFrom(
        this.httpService.get(
          `https://${this.configService.get<string>('X_RAPIDAPI_HOST')}/v1/vinlookup?vin=${vin}`,
          {
            headers: {
              'x-rapidapi-key':
                this.configService.get<string>('X_RAPIDAPI_KEY'),
              'x-rapidapi-host':
                this.configService.get<string>('X_RAPIDAPI_HOST'),
            },
          },
        ),
      );
    this.logger.debug(vinLookupResponse);
    if (status !== 200) throw new Error('Failed to fetch vehicle data');

    // Extract the manufacturing year from the response
    const yearOfManufacture = parseInt(vinLookupResponse.year, 10);
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearOfManufacture;

    let valuation = basePrice;
    if (age < 5) {
      valuation *= 1.5;
    } else if (age >= 5 && age < 10) {
      valuation *= 1.2;
    } else if (age >= 10) {
      valuation *= 0.8;
    }
    const carClass = vinLookupResponse.class?.toLowerCase();

    if (vinLookupResponse.class === 'suv') {
      valuation *= 1.1;
    } else if (
      carClass === 'sedan' ||
      carClass === 'saloon' ||
      carClass === 'sedan/saloon'
    ) {
      valuation *= 0.9;
    }

    return this.saveValuation(vinLookupResponse, valuation);
  }

  async saveValuation(
    vinData: Vinlookup,
    valuation: number,
  ): Promise<Valuation> {
    const valuationData = this.valuationRepo.create({
      vin: vinData.vin,
      manufacturer: vinData.manufacturer,
      model: vinData.model,
      year: vinData.year,
      class: vinData.class,
      valuationAmount: valuation,
      valuationDate: new Date(),
    });

    return await this.valuationRepo.save(valuationData);
  }

  async getVehicleByVIN(vin: string) {
    return this.vehicleRepo.findOneBy({ vin });
  }

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existingVehicle = await this.getVehicleByVIN(createVehicleDto.vin);

    if (existingVehicle)
      throw new HttpException('Vehicle already exists', HttpStatus.BAD_REQUEST);

    const newVehicle = this.vehicleRepo.create(createVehicleDto);
    return this.vehicleRepo.save(newVehicle);
  }
}
