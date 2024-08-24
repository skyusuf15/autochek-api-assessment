import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  LoggerService,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/index.dto';
import { Valuation, Vehicle } from '../../entities';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/enum/index.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('vehicles')
@Controller('api/v1/vehicles')
export class VehicleController {
  constructor(
    private readonly vehicleService: VehicleService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({
    status: 201,
    description: 'The vehicle has been successfully created.',
    type: Vehicle,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEALER, UserRole.ADMIN)
  @Post()
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    try {
      const newVehicle = await this.vehicleService.create(createVehicleDto);
      return {
        data: newVehicle,
        message: 'Vehicle created successfully',
        status: 'success',
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of all vehicles.',
    type: [Vehicle],
  })
  @Get()
  async getAllVehicles(): Promise<Vehicle[]> {
    return this.vehicleService.getAllVehicles();
  }

  @ApiOperation({ summary: 'Get vehicle valuation by VIN' })
  @ApiQuery({
    name: 'vin',
    required: true,
    description: 'Vehicle Identification Number',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the valuation of a vehicle.',
    type: Valuation,
  })
  @ApiResponse({ status: 400, description: 'VIN is required' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @Get('/valuation')
  async getVehicleValuation(
    @Query('vin') vin: string,
  ): Promise<{ data: Valuation; message: string; status: string }> {
    try {
      this.logger.log({
        message: `Simulating vehicle valuation for VIN: ${vin}`,
        level: 'info',
      });

      if (!vin) {
        throw new BadRequestException('VIN is required');
      }

      const vehicle = await this.vehicleService.getVehicleByVIN(vin);
      if (!vehicle) {
        throw new BadRequestException('Vehicle not found');
      }

      // Call your service to simulate valuation
      const valuation = await this.vehicleService.simulateVehicleValuation(
        vin,
        vehicle.baseAmount,
      );

      return {
        data: valuation,
        message: 'Vehicle valuation retrieved and saved successfully',
        status: 'success',
      };
    } catch (error) {
      this.logger.error(error);

      if (error instanceof BadRequestException) throw error;

      throw new HttpException(
        {
          message: 'Failed to get vehicle valuation',
          developerMessage: error.message,
        },
        error.status,
      );
    }
  }
}
