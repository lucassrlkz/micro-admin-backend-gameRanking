import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, UpdateCategory } from './interfaces/category.interface';
import { Player } from './interfaces/player.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
    // constructor(
    //     @InjectModel('categories')
    //     private readonly categoryModel: Model<Category>,
    //     @InjectModel('players') private readonly playerModel: Model<Player>,
    // ) {}

    // private readonly logger = new Logger(AppService.name);

    // async createCategory(category: Category): Promise<Category> {
    //     try {
    //         const createdCategory = new this.categoryModel(category);
    //         return await createdCategory.save();
    //     } catch (error) {
    //         const message =
    //             error instanceof Error ? error.message : String(error);

    //         this.logger.error(
    //             `Error (create-category): ${JSON.stringify(message)}`,
    //         );
    //         throw new RpcException(message);
    //     }
    // }
    // async findAllCategories(): Promise<Category[]> {
    //     try {
    //         return await this.categoryModel.find().exec();
    //     } catch (error) {
    //         const message =
    //             error instanceof Error ? error.message : String(error);

    //         this.logger.error(
    //             `Error (find-all-categories: ${JSON.stringify(message)}`,
    //         );
    //         throw new RpcException(message);
    //     }
    // }

    // async findCategoryById(_id: string): Promise<Category | null> {
    //     try {
    //         return await this.categoryModel.findOne({ _id }).exec();
    //     } catch (error) {
    //         const message =
    //             error instanceof Error ? error.message : String(error);

    //         this.logger.error(
    //             `Error (find-category-by-id): ${JSON.stringify(message)}`,
    //         );
    //         throw new RpcException(message);
    //     }
    // }

    // async updateCategory(_id: string, category: UpdateCategory): Promise<void> {
    //     try {
    //         await this.categoryModel
    //             .findOneAndUpdate({ _id }, { $set: category })
    //             .exec();
    //     } catch (error) {
    //         const message =
    //             error instanceof Error ? error.message : String(error);

    //         this.logger.error(
    //             `Error (update-category): ${JSON.stringify(message)}`,
    //         );
    //         throw new RpcException(message);
    //     }
    // }
}
