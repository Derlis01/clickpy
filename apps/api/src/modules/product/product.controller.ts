import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-request';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ─── Auth required ───

  @Post('product')
  async addProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.createProduct(
      user.organizationId,
      user.branchId,
      user.plan,
      dto,
    );
  }

  @Get('product')
  async getProducts(@CurrentUser() user: AuthenticatedUser) {
    return this.productService.getAllProducts(user.branchId);
  }

  @Delete('product/:productId')
  async deleteProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
  ) {
    return this.productService.deleteProduct(user.branchId, productId);
  }

  @Post('product/duplicate')
  async duplicateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.duplicateProduct(
      user.organizationId,
      user.branchId,
      user.plan,
      dto,
    );
  }

  @Put('product')
  async updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(user.branchId, dto);
  }

  @Put('product/visibility')
  async updateProductsVisibility(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateVisibilityDto,
  ) {
    return this.productService.updateProductsVisibility(user.branchId, dto);
  }

  // ─── Public ───

  @Public()
  @Get('public/product/:orgSlug')
  async getActiveProducts(@Param('orgSlug') orgSlug: string) {
    return this.productService.getActiveProductsByOrgSlug(orgSlug);
  }
}
