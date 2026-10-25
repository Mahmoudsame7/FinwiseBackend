import { MiddlewareConsumer, Module, NestModule,RequestMethod } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { logger } from 'src/Utilities/Logger';


// const ProductAliasProvider = {
//   provide: 'PRDService',
//   useExisting: ProductService,
// };
@Module({
  controllers: [ProductController],
  providers: [
    // ProductService,
    {
    provide: 'PRDS_SERVICE',
    useClass: ProductService,
    },
    //  ProductAliasProvider
    ],
})
export class ProductModule {}
