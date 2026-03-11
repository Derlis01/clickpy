import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CommerceRepository } from './commerce.repository';
import { UploadService } from '../upload/upload.service';
import { UpdateCommerceDto } from './dto/update-commerce.dto';
import { CheckoutConfigurationDto } from './dto/checkout-configuration.dto';

@Injectable()
export class CommerceService {
  constructor(
    private readonly commerceRepository: CommerceRepository,
    private readonly uploadService: UploadService,
  ) {}

  async getCommerceInfo(commerceId: string) {
    const commerce = await this.commerceRepository.getCommerceById(commerceId);

    if (!commerce) {
      throw new NotFoundException('Commerce not found');
    }

    return { success: true, message: 'Commerce found', commerceInfo: commerce };
  }

  async getCommerceBySlug(slug: string) {
    const commerce = await this.commerceRepository.getCommerceBySlug(slug);

    if (!commerce) {
      throw new NotFoundException('Commerce not found');
    }

    return { success: true, message: 'Commerce found', commerceInfo: commerce };
  }

  async updateCommerce(commerceId: string, dto: UpdateCommerceDto) {
    const updateData: Record<string, any> = {};

    // Handle logo upload if it's base64
    if (dto.commerce_logo && !dto.commerce_logo.startsWith('https')) {
      const logoUrl = await this.uploadService.uploadImage(
        dto.commerce_logo,
        'logo',
        commerceId,
      );
      if (logoUrl) {
        updateData.commerce_logo = logoUrl;
      }
    } else if (dto.commerce_logo) {
      updateData.commerce_logo = dto.commerce_logo;
    }

    // Handle banner upload if it's base64
    if (dto.commerce_banner && !dto.commerce_banner.startsWith('https')) {
      const bannerUrl = await this.uploadService.uploadImage(
        dto.commerce_banner,
        'banner',
        commerceId,
      );
      if (bannerUrl) {
        updateData.commerce_banner = bannerUrl;
      }
    } else if (dto.commerce_banner) {
      updateData.commerce_banner = dto.commerce_banner;
    }

    // Copy remaining fields
    if (dto.commerce_name !== undefined)
      updateData.commerce_name = dto.commerce_name;
    if (dto.commerce_slug !== undefined)
      updateData.commerce_slug = dto.commerce_slug;
    if (dto.commerce_phone !== undefined)
      updateData.commerce_phone = dto.commerce_phone;
    if (dto.commerce_address !== undefined)
      updateData.commerce_address = dto.commerce_address;
    if (dto.commerce_primary_color !== undefined)
      updateData.commerce_primary_color = dto.commerce_primary_color;
    if (dto.commerce_category !== undefined)
      updateData.commerce_category = dto.commerce_category;
    if (dto.ask_payment_method !== undefined)
      updateData.ask_payment_method = dto.ask_payment_method;
    if (dto.commerce_schedule !== undefined)
      updateData.commerce_schedule = dto.commerce_schedule;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const commerce = await this.commerceRepository.updateCommerce(
      commerceId,
      updateData,
    );

    return {
      success: true,
      message: 'Commerce updated',
      commerceInfo: commerce,
    };
  }

  async updateCheckoutConfiguration(
    commerceId: string,
    dto: CheckoutConfigurationDto,
  ) {
    const commerce =
      await this.commerceRepository.updateCheckoutConfiguration(
        commerceId,
        dto.payment_methods,
        dto.shipping_methods,
      );

    return {
      success: true,
      message: 'Checkout configuration updated successfully',
      commerceInfo: commerce,
    };
  }

  async getProductsCount(commerceId: string): Promise<number> {
    return this.commerceRepository.getProductsCount(commerceId);
  }
}
