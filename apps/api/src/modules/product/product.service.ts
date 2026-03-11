import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CommerceService } from '../commerce/commerce.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PlanName, PLANS_LIMITATIONS } from '../../common/config/plans.config';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly commerceService: CommerceService,
    private readonly uploadService: UploadService,
  ) {}

  async getProductById(commerceId: string, productId: string) {
    const product = await this.productRepository.getProductById(
      productId,
      commerceId,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { success: true, message: 'Product found', product };
  }

  async getAllProducts(commerceId: string) {
    const products = await this.productRepository.getAllProducts(commerceId);
    return { success: true, message: 'Products found', products };
  }

  async getActiveProducts(commerceId: string) {
    const products =
      await this.productRepository.getActiveProducts(commerceId);
    return { success: true, message: 'Active products found', products };
  }

  async createProduct(
    commerceId: string,
    currentPlan: PlanName,
    dto: CreateProductDto,
  ) {
    // Check plan limits
    const productsCount =
      await this.commerceService.getProductsCount(commerceId);
    if (productsCount >= PLANS_LIMITATIONS[currentPlan].maxProducts) {
      throw new BadRequestException('Products limit reached');
    }

    // Validate addon limits
    if (dto.has_addon_limits) {
      if (
        dto.min_addons &&
        dto.max_addons &&
        dto.min_addons > dto.max_addons
      ) {
        throw new BadRequestException(
          'Minimum addons cannot be greater than maximum addons',
        );
      }
    }

    // Handle image upload
    let imageUrl = dto.image_url || '';
    if (imageUrl && !imageUrl.startsWith('https')) {
      const uploadedUrl = await this.uploadService.uploadImage(
        imageUrl,
        'product',
        commerceId,
      );
      if (!uploadedUrl) {
        throw new BadRequestException('Error uploading image');
      }
      imageUrl = uploadedUrl;
    }

    const productData = {
      commerce_id: commerceId,
      product_name: dto.product_name,
      price: dto.price,
      image_url: imageUrl,
      description: dto.description || '',
      category: dto.category || '',
      is_deleted: false,
      is_active: true,
      is_hidden: false,
      options: dto.options || [],
      addons: dto.addons || [],
      has_addon_limits: dto.has_addon_limits || false,
      min_addons: dto.min_addons,
      max_addons: dto.max_addons,
    };

    const product = await this.productRepository.createProduct(productData);

    // products_count is handled by the PostgreSQL trigger

    return { success: true, message: 'Product created', product };
  }

  async duplicateProduct(
    commerceId: string,
    currentPlan: PlanName,
    dto: CreateProductDto,
  ) {
    // Check plan limits
    const productsCount =
      await this.commerceService.getProductsCount(commerceId);
    if (productsCount >= PLANS_LIMITATIONS[currentPlan].maxProducts) {
      throw new BadRequestException('Products limit reached');
    }

    const productData = {
      commerce_id: commerceId,
      product_name: dto.product_name,
      price: dto.price,
      image_url: dto.image_url || '',
      description: dto.description || '',
      category: dto.category || '',
      is_deleted: false,
      is_active: true,
      is_hidden: false,
      options: dto.options ? [...dto.options] : [],
      addons: dto.addons ? [...dto.addons] : [],
      has_addon_limits: dto.has_addon_limits || false,
      min_addons: dto.min_addons,
      max_addons: dto.max_addons,
    };

    const product = await this.productRepository.createProduct(productData);

    return { success: true, message: 'Product duplicated', product };
  }

  async updateProduct(commerceId: string, dto: UpdateProductDto) {
    // Handle image upload
    let imageUrl = dto.image_url;
    if (imageUrl && !imageUrl.startsWith('https')) {
      const uploadedUrl = await this.uploadService.uploadImage(
        imageUrl,
        'product',
        commerceId,
      );
      if (!uploadedUrl) {
        throw new BadRequestException('Error uploading image');
      }
      imageUrl = uploadedUrl;
    }

    // Validate addon limits
    if (dto.has_addon_limits) {
      if (
        dto.min_addons &&
        dto.max_addons &&
        dto.min_addons > dto.max_addons
      ) {
        throw new BadRequestException(
          'Minimum addons cannot be greater than maximum addons',
        );
      }
    }

    const updateData: Record<string, any> = {};
    if (dto.product_name !== undefined)
      updateData.product_name = dto.product_name;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.options !== undefined) updateData.options = dto.options;
    if (dto.addons !== undefined) updateData.addons = dto.addons;
    if (dto.has_addon_limits !== undefined)
      updateData.has_addon_limits = dto.has_addon_limits;
    if (dto.min_addons !== undefined) updateData.min_addons = dto.min_addons;
    if (dto.max_addons !== undefined) updateData.max_addons = dto.max_addons;

    const product = await this.productRepository.updateProduct(
      dto.id,
      updateData,
    );

    return { success: true, message: 'Product updated', product };
  }

  async deleteProduct(commerceId: string, productId: string) {
    await this.productRepository.softDeleteProduct(productId, commerceId);

    // products_count is handled by the PostgreSQL trigger

    return { success: true, message: 'Product deleted' };
  }

  async updateProductsVisibility(
    commerceId: string,
    dto: UpdateVisibilityDto,
  ) {
    if (!dto.product_ids || dto.product_ids.length === 0) {
      throw new BadRequestException('Product IDs are required');
    }

    await this.productRepository.updateProductsVisibility(
      commerceId,
      dto.product_ids,
      dto.is_hidden,
    );

    const action = dto.is_hidden ? 'hidden' : 'shown';
    return { success: true, message: `Products ${action} successfully` };
  }

  async updateProductsCategory(commerceId: string, dto: UpdateCategoryDto) {
    if (!dto.product_ids || dto.product_ids.length === 0) {
      throw new BadRequestException('Product IDs are required');
    }

    if (!dto.new_category_name || dto.new_category_name.trim() === '') {
      throw new BadRequestException('New category name is required');
    }

    const updated = await this.productRepository.updateProductsCategory(
      commerceId,
      dto.product_ids,
      dto.new_category_name.trim(),
    );

    return {
      success: true,
      message: `Successfully updated ${updated?.length ?? 0} product(s) category to "${dto.new_category_name}"`,
      updatedCount: updated?.length ?? 0,
    };
  }

  async getProductBySlugAndId(commerceSlug: string, productId: string) {
    const product = await this.productRepository.getProductBySlugAndId(
      commerceSlug,
      productId,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { success: true, message: 'Product found', product };
  }
}
