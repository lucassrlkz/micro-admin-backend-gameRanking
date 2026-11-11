import { Controller, Get, Logger, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import type { Category } from './interfaces/categories/category.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private logger = new Logger(AppController.name);

  @EventPattern('criar-categoria')
  async createCategory(@Payload() category: Category) {
    this.logger.log(`categoria: ${JSON.stringify(category)}`);

    await this.appService.createCategory(category);
  }

  @MessagePattern('consultar-categorias')
  async findCategories(@Payload() _id: string) {
    if (_id) {
      return await this.appService.findCategoryById(_id);
    } else {
      return await this.appService.findAllCategories();
    }
  }
}
