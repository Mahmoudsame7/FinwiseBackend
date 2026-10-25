import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AccountType {
    CASH = "cash",
    BANK_ACCOUNT = "bank_account",
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.accounts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;


  @Column({ nullable: true })
  name: string;

  @Column({
    type: "enum",
    enum: AccountType,
    default: AccountType.CASH,
  })
  type: AccountType;

  @OneToMany(() => Transaction, (transaction) => transaction.accountId)
  transactions: Transaction[];


  @Column({ nullable: false })
  initial_Balance: number;

  @Column({ nullable: false })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}