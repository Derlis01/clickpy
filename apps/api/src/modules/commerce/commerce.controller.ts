import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-request';
import { UpdateCommerceDto } from './dto/update-commerce.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller()
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  // ─── Organization (auth required) ───

  @Get('organization')
  async getOrganization(@CurrentUser() user: AuthenticatedUser) {
    return this.commerceService.getOrganizationInfo(user.organizationId);
  }

  @Put('organization')
  async updateOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCommerceDto,
  ) {
    return this.commerceService.updateOrganization(user.organizationId, dto);
  }

  // ─── Branches (auth required) ───

  @Get('branch')
  async getBranches(@CurrentUser() user: AuthenticatedUser) {
    return this.commerceService.getBranches(user.organizationId);
  }

  @Get('branch/:id')
  async getBranch(@Param('id') id: string) {
    return this.commerceService.getBranch(id);
  }

  @Put('branch/:id')
  async updateBranch(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.commerceService.updateBranch(id, dto);
  }

  // ─── Public ───

  @Public()
  @Get('public/org/:slug')
  async getOrganizationPublic(@Param('slug') slug: string) {
    return this.commerceService.getOrganizationBySlug(slug);
  }

  @Public()
  @Get('public/org/:slug/branches')
  async getBranchesPublic(@Param('slug') slug: string) {
    const result = await this.commerceService.getOrganizationBySlug(slug);
    return this.commerceService.getBranches(
      (result.organization as { id: string }).id,
    );
  }
}
