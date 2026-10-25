import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { CategoryRepository } from './category.repository';


@Injectable()
export class CategoryService {

  constructor(private readonly categoryRepository:CategoryRepository){}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.create(createCategoryDto)
  }

  async findAll() {
    const categories = await this.categoryRepository.findAll()

    return categories
  }

  async findOne(id: string) {
    const category = await  this.categoryRepository.findOne(id)

    if(!category){
      throw new NotFoundException('Category not found')
    }

    return category
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne(id)
    
    if(!category){
      throw new NotFoundException('Category not found')
    }

    return this.categoryRepository.update(id,updateCategoryDto)
  }

  async remove(id: string) {
     const category = await this.categoryRepository.findOne(id)
    
    if(!category){
      throw new NotFoundException('Category not found')
    }

    return this.categoryRepository.remove(id)
  }
}
