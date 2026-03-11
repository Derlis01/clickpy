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
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ─── Auth required ───

  @Post('product/addProduct')
  async addProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.createProduct(
      user.commerceId,
      user.currentPlan,
      dto,
    );
  }

  @Get('product/getProducts')
  async getProducts(@CurrentUser() user: AuthenticatedUser) {
    return this.productService.getAllProducts(user.commerceId);
  }

  @Delete('product/deleteProduct/:productId')
  async deleteProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
  ) {
    return this.productService.deleteProduct(user.commerceId, productId);
  }

  @Post('product/duplicateProduct')
  async duplicateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.duplicateProduct(
      user.commerceId,
      user.currentPlan,
      dto,
    );
  }

  @Put('product/updateProduct')
  async updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(user.commerceId, dto);
  }

  @Put('product/update-products-visibility')
  async updateProductsVisibility(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateVisibilityDto,
  ) {
    return this.productService.updateProductsVisibility(user.commerceId, dto);
  }

  @Put('product/update-products-category')
  async updateProductsCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.productService.updateProductsCategory(user.commerceId, dto);
  }

  // ─── Public ───

  @Public()
  @Get('public/product/commerce-products/:commerceId')
  async getCommerceProducts(@Param('commerceId') commerceId: string) {
    return this.productService.getActiveProducts(commerceId);
  }

  @Public()
  @Get('public/product/:commerceSlug/:productId')
  async getProductBySlugAndId(
    @Param('commerceSlug') commerceSlug: string,
    @Param('productId') productId: string,
  ) {
    return this.productService.getProductBySlugAndId(commerceSlug, productId);
  }
}
