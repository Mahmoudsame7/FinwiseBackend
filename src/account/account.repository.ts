import { Injectable } from "@nestjs/common";
import { Account } from "./entities/account.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AccountRepository {
    constructor(@InjectRepository(Account) private readonly repository: Repository<Account>) { }

    async create(account: Partial<Account>): Promise<Account> {
        const newAccount = this.repository.create(account);

        return this.repository.save(newAccount);
    }

    async getTotalBalance(userId: string): Promise<number> {
        const result = await this.repository
            .createQueryBuilder('account')
            .select('COALESCE(SUM(account.balance), 0)', 'totalBalance')
            .where('account.userId = :userId', { userId })
            .getRawOne();

        return Number(result.totalBalance);
    }

     

   


    async findAll(userId:string):Promise<Account[]>{
        return this.repository.find({
            where: {
                userId: userId
            }
        })
    }

    async findUserAccount(userId:string ,accountId:string) : Promise<Account|null> {
        return this.repository.findOne({
            where: {
                id: accountId,
                userId: userId
            }
        })
    }

    async update(userId:string,accountId:string ,account: Partial<Account>): Promise<Account> {
        const updateAccount = await this.repository.preload({
            id: accountId,
            userId: userId,
            ...account,
        });

        if (!updateAccount) {
            return null;
        }

        return this.repository.save(updateAccount);
    }

    async remove(accountId:string)  {
        return this.repository.delete({
                id: accountId,
        })
    }
}