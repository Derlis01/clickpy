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
import { ReorderProductsDto } from './dto/reorder-products.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { PlanName, PLANS_LIMITATIONS } from '../../common/config/plans.config';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly commerceService: CommerceService,
    private readonly uploadService: UploadService,
  ) {}

  async getProductById(branchId: string, productId: string) {
    const product = await this.productRepository.getProductById(
      productId,
      branchId,
    );
    if (!product) throw new NotFoundException('Product not found');
    return { success: true, message: 'Product found', product };
  }

  async getAllProducts(branchId: string) {
    const products = await this.productRepository.getAllProducts(branchId);
    return { success: true, message: 'Products found', products };
  }

  async getActiveProducts(branchId: string) {
    const products = await this.productRepository.getActiveProducts(branchId);
    return { success: true, message: 'Active products found', products };
  }

  async createProduct(
    organizationId: string,
    branchId: string,
    currentPlan: PlanName,
    dto: CreateProductDto,
  ) {
    const productsCount =
      await this.commerceService.getProductsCount(organizationId);
    if (productsCount >= PLANS_LIMITATIONS[currentPlan].maxProducts) {
      throw new BadRequestException('Products limit reached for your plan');
    }

    if (dto.has_addon_limits && dto.min_addons && dto.max_addons) {
      if (dto.min_addons > dto.max_addons) {
        throw new BadRequestException(
          'min_addons cannot be greater than max_addons',
        );
      }
    }

    let coverImage = dto.cover_image || '';
    if (coverImage && !coverImage.startsWith('https')) {
      const uploaded = await this.uploadService.uploadImage(
        coverImage,
        'product',
        branchId,
      );
      if (!uploaded) throw new BadRequestException('Error uploading image');
      coverImage = uploaded;
    }

    const productData = {
      branch_id: branchId,
      name: dto.name,
      price: dto.price,
      cover_image: coverImage,
      images: dto.images || [],
      description: dto.description || '',
      category_id: dto.category_id || null,
      is_deleted: false,
      is_active: true,
      is_hidden: false,
      options: dto.options || [],
      addons: dto.addons || [],
      has_addon_limits: dto.has_addon_limits || false,
      min_addons: dto.min_addons ?? null,
      max_addons: dto.max_addons ?? null,
    };

    const product = await this.productRepository.createProduct(productData);
    return { success: true, message: 'Product created', product };
  }

  async duplicateProduct(
    organizationId: string,
    branchId: string,
    currentPlan: PlanName,
    dto: CreateProductDto,
  ) {
    const productsCount =
      await this.commerceService.getProductsCount(organizationId);
    if (productsCount >= PLANS_LIMITATIONS[currentPlan].maxProducts) {
      throw new BadRequestException('Products limit reached for your plan');
    }

    const productData = {
      branch_id: branchId,
      name: dto.name,
      price: dto.price,
      cover_image: dto.cover_image || '',
      images: dto.images ? [...dto.images] : [],
      description: dto.description || '',
      category_id: dto.category_id || null,
      is_deleted: false,
      is_active: true,
      is_hidden: false,
      options: dto.options ? [...dto.options] : [],
      addons: dto.addons ? [...dto.addons] : [],
      has_addon_limits: dto.has_addon_limits || false,
      min_addons: dto.min_addons ?? null,
      max_addons: dto.max_addons ?? null,
    };

    const product = await this.productRepository.createProduct(productData);
    return { success: true, message: 'Product duplicated', product };
  }

  async updateProduct(branchId: string, dto: UpdateProductDto) {
    let coverImage = dto.cover_image;
    if (coverImage && !coverImage.startsWith('https')) {
      const uploaded = await this.uploadService.uploadImage(
        coverImage,
        'product',
        branchId,
      );
      if (!uploaded) throw new BadRequestException('Error uploading image');
      coverImage = uploaded;
    }

    if (dto.has_addon_limits && dto.min_addons && dto.max_addons) {
      if (dto.min_addons > dto.max_addons) {
        throw new BadRequestException(
          'min_addons cannot be greater than max_addons',
        );
      }
    }

    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (coverImage !== undefined) updateData.cover_image = coverImage;
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category_id !== undefined) updateData.category_id = dto.category_id;
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

  async deleteProduct(branchId: string, productId: string) {
    await this.productRepository.softDeleteProduct(productId, branchId);
    return { success: true, message: 'Product deleted' };
  }

  async updateProductsVisibility(branchId: string, dto: UpdateVisibilityDto) {
    if (!dto.product_ids || dto.product_ids.length === 0) {
      throw new BadRequestException('Product IDs are required');
    }
    await this.productRepository.updateProductsVisibility(
      branchId,
      dto.product_ids,
      dto.is_hidden,
    );
    const action = dto.is_hidden ? 'hidden' : 'shown';
    return { success: true, message: `Products ${action} successfully` };
  }

  async reorderProducts(branchId: string, dto: ReorderProductsDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Items are required');
    }
    await this.productRepository.reorderProducts(branchId, dto.items);
    return { success: true, message: 'Products reordered' };
  }

  async reorderCategories(branchId: string, dto: ReorderCategoriesDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Items are required');
    }
    await this.productRepository.reorderCategories(branchId, dto.items);
    return { success: true, message: 'Categories reordered' };
  }

  async getActiveProductsByOrgSlug(orgSlug: string) {
    const products =
      await this.productRepository.getActiveProductsByOrgSlug(orgSlug);
    return { success: true, message: 'Active products found', products };
  }
}
