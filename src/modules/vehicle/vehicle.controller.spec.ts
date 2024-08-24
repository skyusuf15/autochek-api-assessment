import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LoggerService, HttpException, HttpStatus } from '@nestjs/common';
import { CreateVehicleDto } from './dto/index.dto';
import { Valuation, Vehicle } from '../../entities';

describe('VehicleController', () => {
  let vehicleController: VehicleController;
  let vehicleService: VehicleService;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehicleService,
          useValue: {
            create: jest.fn(),
            getAllVehicles: jest.fn(),
            getVehicleByVIN: jest.fn(),
            simulateVehicleValuation: jest.fn(),
            saveValuation: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    vehicleController = module.get<VehicleController>(VehicleController);
    vehicleService = module.get<VehicleService>(VehicleService);
    logger = module.get<LoggerService>(WINSTON_MODULE_PROVIDER);
  });

  describe('create', () => {
    it('should create a vehicle successfully', async () => {
      const createVehicleDto: CreateVehicleDto = {
        vin: '1HGCM82633A123456',
        make: 'Honda',
        model: 'Accord',
        year: 2015,
        mileage: 12000,
        baseAmount: 15000,
        sellingPrice: 18000,
      };

      const newVehicle = { ...createVehicleDto, id: 1 };

      jest
        .spyOn(vehicleService, 'create')
        .mockResolvedValue(newVehicle as Vehicle);

      const result = await vehicleController.create(createVehicleDto);

      expect(result).toEqual({
        data: newVehicle,
        message: 'Vehicle created successfully',
        status: 'success',
      });
    });

    it('should log an error and rethrow it when service fails', async () => {
      const createVehicleDto: CreateVehicleDto = {
        vin: '1HGCM82633A123456',
        make: 'Honda',
        model: 'Accord',
        year: 2015,
        mileage: 12000,
        baseAmount: 15000,
        sellingPrice: 18000,
      };

      const error = new Error('Service failure');
      jest.spyOn(vehicleService, 'create').mockRejectedValue(error);
      jest.spyOn(logger, 'error');

      await expect(vehicleController.create(createVehicleDto)).rejects.toThrow(
        error,
      );
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllVehicles', () => {
    it('should return an array of vehicles', async () => {
      const vehicles = [{ vin: '123' }, { vin: '456' }];

      jest
        .spyOn(vehicleService, 'getAllVehicles')
        .mockResolvedValue(vehicles as Vehicle[]);

      const result = await vehicleController.getAllVehicles();

      expect(result).toEqual(vehicles);
    });
  });

  describe('getVehicleValuation', () => {
    it('should return a vehicle valuation successfully', async () => {
      const vin = '1HGCM82633A123456';
      const vehicle = { vin, baseAmount: 15000 };
      const valuation: Valuation = {
        id: 1,
        vin,
        manufacturer: 'Honda',
        model: 'Accord',
        year: '2015',
        class: 'Sedan',
        valuationAmount: 15000,
        valuationDate: new Date(),
        vehicle: new Vehicle(),
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest
        .spyOn(vehicleService, 'getVehicleByVIN')
        .mockResolvedValue(vehicle as Vehicle);
      jest
        .spyOn(vehicleService, 'simulateVehicleValuation')
        .mockResolvedValue(valuation);

      const result = await vehicleController.getVehicleValuation(vin);

      expect(result).toEqual({
        data: valuation,
        message: 'Vehicle valuation retrieved and saved successfully',
        status: 'success',
      });
    });

    it('should throw an error if VIN is not provided', async () => {
      jest.spyOn(vehicleService, 'getVehicleByVIN').mockResolvedValue(null);

      await expect(vehicleController.getVehicleValuation('')).rejects.toThrow(
        new HttpException('VIN is required', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error if vehicle is not found', async () => {
      const vin = '1HGCM82633A123456';
      jest.spyOn(vehicleService, 'getVehicleByVIN').mockResolvedValue(null);

      await expect(vehicleController.getVehicleValuation(vin)).rejects.toThrow(
        new HttpException('Vehicle not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle errors when simulating vehicle valuation', async () => {
      const vin = '1HGCM82633A123456';
      const vehicle = { vin, baseAmount: 15000 };
      const error = new Error('Simulation failed');
      jest
        .spyOn(vehicleService, 'getVehicleByVIN')
        .mockResolvedValue(vehicle as Vehicle);
      jest
        .spyOn(vehicleService, 'simulateVehicleValuation')
        .mockRejectedValue(error);
      jest.spyOn(logger, 'error');

      await expect(vehicleController.getVehicleValuation(vin)).rejects.toThrow(
        new HttpException(
          {
            data: null,
            message: 'Failed to get vehicle valuation',
            developerMessage: error.message,
            status: 'error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });
});
