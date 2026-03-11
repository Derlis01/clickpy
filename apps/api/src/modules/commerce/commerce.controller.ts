import { Controller, Get, Put, Param, Body, Query } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-request';
import { UpdateCommerceDto } from './dto/update-commerce.dto';
import { CheckoutConfigurationDto } from './dto/checkout-configuration.dto';

@Controller()
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  // ─── Auth required ───

  @Get('commerce/get-commerce-info')
  async getCommerceInfo(@CurrentUser() user: AuthenticatedUser) {
    return this.commerceService.getCommerceInfo(user.commerceId);
  }

  @Put('commerce/put-commerce-info')
  async putCommerceInfo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCommerceDto,
  ) {
    return this.commerceService.updateCommerce(user.commerceId, dto);
  }

  @Put('commerce/update-checkout-configuration')
  async updateCheckoutConfiguration(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutConfigurationDto,
  ) {
    return this.commerceService.updateCheckoutConfiguration(
      user.commerceId,
      dto,
    );
  }

  // ─── Public ───

  @Public()
  @Get('public/commerce/get-commerce-info/:slug')
  async getCommerceInfoPublic(@Param('slug') slug: string) {
    return this.commerceService.getCommerceBySlug(slug);
  }

  @Public()
  @Get('public/commerce/get-commerce-products')
  async getCommerceProductsPublic(@Query('slug') slug: string) {
    if (!slug) {
      return { success: false, message: 'Commerce slug is required' };
    }

    const commerce = await this.commerceService.getCommerceBySlug(slug);

    if (!commerce.success || !commerce.commerceInfo) {
      return { success: false, message: 'Commerce not found' };
    }

    // This returns the commerce info; products are fetched via product endpoints
    return commerce;
  }
}
