import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from '../../entities';
import { Repository } from 'typeorm';

@Injectable()
export class VehicleSeeder {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async seed() {
    const vehiclesData = [
      {
        vin: 'JH4KA7561PC008269',
        make: 'Acura',
        model: 'Legend',
        year: 1993,
        mileage: 120000,
        baseAmount: 5000000,
        sellingPrice: 7000000,
      },
      {
        vin: '1HGCM82633A123456',
        make: 'Honda',
        model: 'Accord',
        year: 2003,
        mileage: 90000,
        baseAmount: 3000000,
        sellingPrice: 4500000,
      },
      {
        vin: '2T1BURHE6FC123456',
        make: 'Toyota',
        model: 'Corolla',
        year: 2015,
        mileage: 30000,
        baseAmount: 8000000,
        sellingPrice: 9500000,
      },
    ];

    for (const vehicleData of vehiclesData) {
      const vehicle = this.vehicleRepository.create(vehicleData);
      await this.vehicleRepository.save(vehicle);
    }

    console.log('Seed data created successfully');
  }
}
