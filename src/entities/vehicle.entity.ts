import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Valuation } from './valuation.entity';
import { Loan } from './loan.entity';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  vin: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  mileage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellingPrice: number;

  // Relationships
  @OneToMany(() => Valuation, (valuation) => valuation.vehicle)
  valuations: Valuation[];

  @OneToMany(() => Loan, (loanApplication) => loanApplication.vehicle)
  loanApplications: Loan[];

  // improvements: a vehicle should be attached to a dealer/autochek/Creator
}
