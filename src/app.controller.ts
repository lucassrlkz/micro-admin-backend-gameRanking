import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { Category } from './interfaces/categories/category.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private logger = new Logger(AppController.name);

  @EventPattern('criar-categoria')
  async createCategory(@Payload() category: Category) {
    this.logger.log(`categoria: ${JSON.stringify(category)}`);

    this.appService.createCategory(category);
  }
}
