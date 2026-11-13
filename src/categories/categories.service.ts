import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Category, UpdateCategory } from '../interfaces/category.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { errorInstance } from '../common/ErrorInstance';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel('categories')
        private readonly categoryModel: Model<Category>,
    ) {}

    private readonly logger = new Logger(CategoriesService.name);

    async createCategory(category: Category): Promise<Category> {
        try {
            const createdCategory = new this.categoryModel(category);
            return await createdCategory.save();
        } catch (error) {
            const message = errorInstance(error);

            this.logger.error(
                `Error (create-category): ${JSON.stringify(message)}`,
            );
            throw new RpcException(message);
        }
    }

    async findAllCategories(): Promise<Category[]> {
        try {
            return await this.categoryModel.find().exec();
        } catch (error) {
            const message = errorInstance(error);

            this.logger.error(
                `Error (find-all-categories: ${JSON.stringify(message)}`,
            );
            throw new RpcException(message);
        }
    }

    async findCategoryById(_id: string): Promise<Category | null> {
        try {
            return await this.categoryModel.findOne({ _id }).exec();
        } catch (error) {
            const message = errorInstance(error);

            this.logger.error(
                `Error (find-category-by-id): ${JSON.stringify(message)}`,
            );
            throw new RpcException(message);
        }
    }

    async updateCategory(_id: string, category: UpdateCategory): Promise<void> {
        try {
            await this.categoryModel
                .findOneAndUpdate({ _id }, { $set: category })
                .exec();
        } catch (error) {
            const message = errorInstance(error);

            this.logger.error(
                `Error (update-category): ${JSON.stringify(message)}`,
            );
            throw new RpcException(message);
        }
    }
}
