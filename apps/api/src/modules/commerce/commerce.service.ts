import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CommerceRepository } from './commerce.repository';
import { UploadService } from '../upload/upload.service';
import { UpdateCommerceDto } from './dto/update-commerce.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class CommerceService {
  constructor(
    private readonly commerceRepository: CommerceRepository,
    private readonly uploadService: UploadService,
  ) {}

  async getOrganizationInfo(organizationId: string) {
    const org =
      await this.commerceRepository.getOrganizationById(organizationId);
    if (!org) throw new NotFoundException('Organization not found');
    return { success: true, message: 'Organization found', organization: org };
  }

  async getOrganizationBySlug(slug: string) {
    const org = await this.commerceRepository.getOrganizationBySlug(slug);
    if (!org) throw new NotFoundException('Organization not found');
    return { success: true, message: 'Organization found', organization: org };
  }

  async updateOrganization(organizationId: string, dto: UpdateCommerceDto) {
    const updateData: Record<string, any> = {};

    if (dto.logo && !dto.logo.startsWith('https')) {
      const url = await this.uploadService.uploadImage(
        dto.logo,
        'logo',
        organizationId,
      );
      if (url) updateData.logo = url;
    } else if (dto.logo) {
      updateData.logo = dto.logo;
    }

    if (dto.banner && !dto.banner.startsWith('https')) {
      const url = await this.uploadService.uploadImage(
        dto.banner,
        'banner',
        organizationId,
      );
      if (url) updateData.banner = url;
    } else if (dto.banner) {
      updateData.banner = dto.banner;
    }

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.primary_color !== undefined)
      updateData.primary_color = dto.primary_color;
    if (dto.category !== undefined) updateData.category = dto.category;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const org = await this.commerceRepository.updateOrganization(
      organizationId,
      updateData,
    );
    return {
      success: true,
      message: 'Organization updated',
      organization: org,
    };
  }

  async getBranches(organizationId: string) {
    const branches =
      await this.commerceRepository.getBranchesByOrganization(organizationId);
    return { success: true, message: 'Branches found', branches };
  }

  async getBranch(branchId: string) {
    const branch = await this.commerceRepository.getBranchById(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return { success: true, message: 'Branch found', branch };
  }

  async updateBranch(branchId: string, dto: UpdateBranchDto) {
    const updateData: Record<string, any> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.schedule !== undefined) updateData.schedule = dto.schedule;
    if (dto.payment_methods !== undefined)
      updateData.payment_methods = dto.payment_methods;
    if (dto.shipping_methods !== undefined)
      updateData.shipping_methods = dto.shipping_methods;
    if (dto.ask_payment_method !== undefined)
      updateData.ask_payment_method = dto.ask_payment_method;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const branch = await this.commerceRepository.updateBranch(
      branchId,
      updateData,
    );
    return { success: true, message: 'Branch updated', branch };
  }

  async getProductsCount(organizationId: string): Promise<number> {
    return this.commerceRepository.getProductsCountByOrganization(
      organizationId,
    );
  }
}
