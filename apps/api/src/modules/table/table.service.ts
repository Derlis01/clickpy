import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TableRepository } from './table.repository';

@Injectable()
export class TableService {
  constructor(private readonly tableRepo: TableRepository) {}

  async create(
    branchId: string,
    dto: { name: string; number?: number; capacity?: number },
  ) {
    return this.tableRepo.create({ branch_id: branchId, ...dto });
  }

  async findByBranch(branchId: string) {
    return this.tableRepo.findByBranch(branchId);
  }

  async update(
    id: string,
    branchId: string,
    dto: Partial<{ name: string; number: number; capacity: number }>,
  ) {
    const table = await this.tableRepo.findById(id);
    if (!table) throw new NotFoundException('Table not found');
    if (table.branch_id !== branchId) throw new ForbiddenException();
    return this.tableRepo.update(id, dto);
  }

  async delete(id: string, branchId: string) {
    const table = await this.tableRepo.findById(id);
    if (!table) throw new NotFoundException('Table not found');
    if (table.branch_id !== branchId) throw new ForbiddenException();
    return this.tableRepo.delete(id);
  }
}
