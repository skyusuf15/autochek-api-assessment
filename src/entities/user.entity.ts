import { UserRole } from '../modules/user/enum/index.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { Loan } from './loan.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  lastName: string;

  @Column()
  firstName: string;

  @Column({ type: 'text', default: UserRole.CUSTOMER })
  role: UserRole;

  @OneToMany(() => Loan, (loan) => loan.user)
  loans: Loan[];

  @BeforeInsert()
  @BeforeUpdate()
  validateLoanStatus() {
    const validStatuses = ['customer', 'admin', 'dealer'];
    if (!validStatuses.includes(this.role)) {
      throw new Error(`Invalid user role: ${this.role}`);
    }
  }
}
