import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
@Entity()
export class Valuation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vin: string;

  @Column()
  manufacturer: string;

  @Column()
  model: string;

  @Column()
  year: string;

  @Column()
  class: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valuationAmount: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.valuations, {
    onDelete: 'CASCADE',
  })
  vehicle: Vehicle;

  @Column({ type: 'date' })
  valuationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
