import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Repository } from "typeorm";

@Injectable()
export class CategoryRepository {
    constructor(@InjectRepository(Category) private readonly  repository: Repository<Category>){

    }

   async create(category: Partial<Category>): Promise<Category> {
        const newAccount = this.repository.create(category);
   
        return this.repository.save(newAccount);
    }

    async findAll(): Promise<Category[]>{
        return this.repository.find()
    }

    async findOne(id:string): Promise<Category|null>{
        return this.repository.findOne({
            where : {
                id
            }
        }) 
    }

     async update(id:string,category: Partial<Category>): Promise<Category> {
            const updateCategory = await this.repository.preload({
                id,
                ...category,
            });
    
            if (!updateCategory) {
                return null;
            }
    
            return this.repository.save(updateCategory);
        }

    async remove(id:string){
         return this.repository.delete({
                id,
        })
    }

}