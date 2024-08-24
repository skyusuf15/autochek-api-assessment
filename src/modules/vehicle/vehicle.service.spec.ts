import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle, Valuation } from '../../entities';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LoggerService, HttpException, HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Vinlookup } from './interface';
import { CreateVehicleDto } from './dto/index.dto';

describe('VehicleService', () => {
  let vehicleService: VehicleService;
  let vehicleRepo: Repository<Vehicle>;
  let valuationRepo: Repository<Valuation>;
  let httpService: HttpService;
  let configService: ConfigService;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: getRepositoryToken(Vehicle),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Valuation),
          useClass: Repository,
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    vehicleService = module.get<VehicleService>(VehicleService);
    vehicleRepo = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
    valuationRepo = module.get<Repository<Valuation>>(
      getRepositoryToken(Valuation),
    );
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    logger = module.get<LoggerService>(WINSTON_MODULE_PROVIDER);
  });

  describe('getAllVehicles', () => {
    it('should return an array of vehicles', async () => {
      const vehicles = [{ vin: '123' }, { vin: '456' }];
      jest.spyOn(vehicleRepo, 'find').mockResolvedValue(vehicles as Vehicle[]);

      const result = await vehicleService.getAllVehicles();

      expect(vehicleRepo.find).toHaveBeenCalled();
      expect(result).toEqual(vehicles);
    });
  });

  describe('simulateVehicleValuation', () => {
    it('should simulate vehicle valuation and save it', async () => {
      const vin = '1HGCM82633A123456';
      const basePrice = 10000;
      const vinLookupResponse: Vinlookup = {
        vin,
        year: '2015',
        class: 'SUV',
        manufacturer: 'Honda',
        model: 'Accord',
        country: '',
        region: '',
        wmi: '',
        vds: '',
        vis: '',
      };

      const axiosResponse: AxiosResponse<Vinlookup> = {
        data: vinLookupResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'X_RAPIDAPI_KEY') return 'test-key';
        if (key === 'X_RAPIDAPI_HOST') return 'test-host';
      });
      jest.spyOn(valuationRepo, 'save').mockResolvedValue({
        valuationAmount: 12000,
        valuationDate: new Date(),
      } as Valuation);
      jest
        .spyOn(valuationRepo, 'create')
        .mockImplementation((val) => val as any);

      const result = await vehicleService.simulateVehicleValuation(
        vin,
        basePrice,
      );

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining(vin),
        expect.any(Object),
      );
      expect(valuationRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('valuationAmount');
    });

    it('should throw an error if fetching vehicle data fails', async () => {
      const vin = '1HGCM82633A123456';
      const basePrice = 10000;

      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: {},
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {},
        } as AxiosResponse<Vinlookup>),
      );

      await expect(
        vehicleService.simulateVehicleValuation(vin, basePrice),
      ).rejects.toThrow('Failed to fetch vehicle data');
    });
  });

  describe('saveValuation', () => {
    it('should save valuation data and return it', async () => {
      const vinData: Vinlookup = {
        vin: '1HGCM82633A123456',
        year: '2015',
        class: 'SUV',
        manufacturer: 'Honda',
        model: 'Accord',
        country: '',
        region: '',
        wmi: '',
        vds: '',
        vis: '',
      };
      const valuation = 12000;

      const valuationEntity = {
        vin: vinData.vin,
        valuationAmount: valuation,
        valuationDate: new Date(),
      } as Valuation;

      jest.spyOn(valuationRepo, 'create').mockReturnValue(valuationEntity);
      jest.spyOn(valuationRepo, 'save').mockResolvedValue(valuationEntity);

      const result = await vehicleService.saveValuation(vinData, valuation);

      expect(valuationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ vin: vinData.vin }),
      );
      expect(valuationRepo.save).toHaveBeenCalledWith(valuationEntity);
      expect(result).toEqual(valuationEntity);
    });
  });

  describe('getVehicleByVIN', () => {
    it('should return a vehicle by VIN', async () => {
      const vin = '1HGCM82633A123456';
      const vehicle = { vin };

      jest
        .spyOn(vehicleRepo, 'findOneBy')
        .mockResolvedValue(vehicle as Vehicle);

      const result = await vehicleService.getVehicleByVIN(vin);

      expect(vehicleRepo.findOneBy).toHaveBeenCalledWith({ vin });
      expect(result).toEqual(vehicle);
    });
  });

  describe('create', () => {
    it('should create a new vehicle', async () => {
      const createVehicleDto: CreateVehicleDto = {
        vin: '1HGCM82633A123456',
        make: 'Honda',
        model: 'Accord',
        year: 2015,
        mileage: 120000,
        baseAmount: 5000000,
        sellingPrice: 7000000,
      };

      const newVehicle = { ...createVehicleDto, id: 1 };

      jest.spyOn(vehicleRepo, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(vehicleRepo, 'create').mockReturnValue(newVehicle as Vehicle);
      jest.spyOn(vehicleRepo, 'save').mockResolvedValue(newVehicle as Vehicle);

      const result = await vehicleService.create(createVehicleDto);

      expect(vehicleRepo.findOneBy).toHaveBeenCalledWith({
        vin: createVehicleDto.vin,
      });
      expect(vehicleRepo.create).toHaveBeenCalledWith(createVehicleDto);
      expect(vehicleRepo.save).toHaveBeenCalledWith(newVehicle);
      expect(result).toEqual(newVehicle);
    });

    it('should throw an error if vehicle already exists', async () => {
      const createVehicleDto: CreateVehicleDto = {
        vin: '1HGCM82633A123456',
        make: 'Honda',
        model: 'Accord',
        year: 2015,
        mileage: 120000,
        baseAmount: 5000000,
        sellingPrice: 7000000,
      };

      const existingVehicle = { ...createVehicleDto, id: 1 };

      jest
        .spyOn(vehicleRepo, 'findOneBy')
        .mockResolvedValue(existingVehicle as Vehicle);

      await expect(vehicleService.create(createVehicleDto)).rejects.toThrow(
        new HttpException('Vehicle already exists', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
