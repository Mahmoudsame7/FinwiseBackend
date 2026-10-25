import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus,ParseIntPipe, UsePipes, UseGuards, UseInterceptors, Inject} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, createProductSchema, UpdateProductDto, updateProductSchema } from './dto/create-product.dto';
// import { HttpExceptionFilter } from 'src/Utilities/HttpExceptionFilter';

import { Roles } from 'src/Utilities/RoleDecorator';
import { LoggingInterceptor } from 'src/Utilities/LoggingInterceptor';
import { ValidationPipe } from 'src/Utilities/validation.pipe';


@Controller('product')
@UseInterceptors(LoggingInterceptor)

export class ProductController {
  constructor(
    @Inject("PRDS_SERVICE") private readonly productService: ProductService,

  //  @Inject("PRDService") private readonly productService: ProductService,
  ) {}

  @Get()
  @Roles(['admin'])
  findAll() {
    return this.productService.findAll();
  }

  @Post()
  @UsePipes(new ValidationPipe(createProductSchema))
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ValidationPipe(updateProductSchema)) updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
