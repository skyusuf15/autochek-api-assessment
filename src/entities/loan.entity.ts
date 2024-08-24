import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { User } from './user.entity';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.loanApplications, {
    onDelete: 'CASCADE',
  })
  vehicle: Vehicle;

  @ManyToOne(() => User, (user) => user.loans, {
    onDelete: 'CASCADE',
    eager: false,
    nullable: false,
  })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountRequested: number;

  @Column({ type: 'text' })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'date' })
  applicationDate: Date;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @BeforeInsert()
  @BeforeUpdate()
  validateLoanStatus() {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`Invalid loan status: ${this.status}`);
    }
  }
}
